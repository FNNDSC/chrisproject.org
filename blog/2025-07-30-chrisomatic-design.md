---
title: "Design of chrisomatic v2"
authors: jennings
tags: [rust, software design]
---

`chrisomatic` is a tool for repeatable and declarative setup of the _ChRIS_ backend (_CUBE_)
for the purpose of automatic testing and demos. Version 2 of `chrisomatic` was redesigned
and rewritten in Rust for practical reasons and fun.

<!-- truncate -->

:::warning

This blog currently describes future work. `chrisomatic` is a WIP
and not available yet.

:::

## Why Rust?

Version 1 of `chrisomatic` was written in Python. It was certainly an
improvement over the 4,000 lines of Bash it replaced, but over time
it became yet another source of frustrations.

<details>
<summary>First of all, what's wrong with Python?</summary>

- Three years ago, [`uv`](https://docs.astral.sh/uv) was not popular yet.
  [Poetry](https://python-poetry.org) was the most popular option for
  Python package management at the time, though it isn't great.
- Installation of Python programs often goes wrong (because `pip` does
  not manage dependency version conflicts nor Python versions) so instead,
  `chrisomatic` was distributed as a 493MB image.
  [Migrating from Poetry to `rye`](https://github.com/FNNDSC/chrisomatic/commit/ea353a63a3ec748fa31847c53c570102c82f069f)
  (a predecessor to `uv`) enabled optimizations which shrunk the image to
  88MB. That is about as good as you can get with Python, but it's silly
  for a setup script to be about the size of a 2 minute YouTube video.
- Since `chrisomatic` was a container image, you needed to run it in
  Docker, which is inconvenient and riddled with pitfalls e.g. messing up
  Docker network settings.
- Python exceptions are ugly and take up your whole screen without even
  providing the user with useful information. [Example](https://github.com/FNNDSC/chrisomatic/issues/11).

</details>

Rust provides numerous practical advantages:

- Rust can compile to a single statically-linked binary&mdash;just download, `chmod +x`, and run.
- It can also compile to WASM, presenting the same features of a CLI application in a web app.
- Great ecosystem: [serde](https://serde.rs/) (schema definition, JSON+YAML+TOML+etc. deserialization),
  [schemars](https://github.com/GREsau/schemars) (generate JSON schema documents),
  [clap](https://docs.rs/clap) (polished CLI interface), etc.
- Monadic [error handling](https://doc.rust-lang.org/book/ch09-02-recoverable-errors-with-result.html)
  is a core language feature. Clean error messages can be printed to CLI with
  [eyre](https://github.com/eyre-rs/eyre).

Above all else, Rust is _fun_ 🪩. Just a few days ago, Stack Overflow's
[2025 survey](https://survey.stackoverflow.co/2025/technology#2-cloud-platforms)
revealed that Cargo is the "most admired" development tool this year.

## Program Design

The rewrite of `chrisomatic` is needlessly over-engineered and prematurely
optimized for the love of programming.

At first glance, the purpose of `chrisomatic` seems simple: all it needs to do
is send some HTTP requests. It is easiest to think about coding this imperatively:

```rust
// Rust pseudo-code
let user = client.create_user(username, password).await?;
let auth_token = client.get_token(username, password).await?;
let uploaded_file = client.upload_file(data, token).await?;
let dircopy = client.create_plugin_instance("pl-dircopy", uploaded_file, token).await?;
let feed = client.set_name_of(dircopy.feed, "My Example", token).await?;
```

But that is boring. The design of `chrisomatic` is motivated by these questions, which cannot be solved with an imperative solution:

- We want to show a progress bar. How can we estimate the total amount of needed "work" before execution, and the current "progress" during execution?
- Some API requests have dependencies (e.g. user must exist before getting
  their auth token) whereas others can run concurrently (e.g. creation of
  user "alice" can happen concurrently with creation of user "bobby"). How
  can we maximize concurrency, without doing it explicitly (i.e. use
  `select!`[^1] or equivalent no more than once throughout the entire codebase).
- Async as a keyword in programming languages is controversial, especially
  in Rust[^2]. Can we use the Sans-IO[^3] design pattern here?

[^1]: The equivalent of [`select!`](https://docs.rs/futures/latest/futures/macro.select.html) in other languages is [`Promise.all`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all) or [`asyncio.gather`](https://docs.python.org/3.12/library/asyncio-task.html#asyncio.gather)
[^2]: https://without.boats/blog/let-futures-be-futures/
[^3]: https://www.firezone.dev/blog/sans-io

In `chrisomatic_core` there is a `Step` trait which looks something like:

```rust
pub trait Step {
    fn request(&self, map: &dyn DependencyMap) -> Option<Request>;
}
```

Instead of sending HTTP requests imperatively, we define implementations of
`Step` which describe HTTP requests without actually sending them. We "plan"
out what HTTP requests to send upfront by building a
[directed acyclic graph](https://en.wikipedia.org/wiki/Directed_acyclic_graph)
(a forest of dependency trees) of `Rc<dyn Step>`. A directed edge _A_->_B_
means _B_ depends on _A_, e.g. a step `FileUpload` step would depend on a
`UserAuthToken` step.

The dependency tree of `dyn Step` are executed in [topological order](https://en.wikipedia.org/wiki/Topological_sorting).
Concurrent execution is maximized—DAG branches can be executed concurrently.

Example dependency tree, executed from top to bottom:

```
                      [UserCreate]  1. First create user, then get auth token
[PluginSearchInPeer]       |        2. Find URL of plugin, then register to CUBE
        |            [UserAuthToken] 
  [PluginRegister]    /   /   /     3. Get auth token, which is needed to
         \           /   /   /         a. upload file
          \ [FileUpload]/   /          b. create plugin instance
           \     /     /   /           c. set name of a feed
            \   /     /   /
             \ /     /   /
 [PluginInstanceCreate] /
               \       /            4. Set feed name last, after
                \     /                a. has auth token
            [FeedSetName]              b. root plugin instance created
```

This _sans-IO_ design makes it possible to **optimize concurrent execution**.
Another advantage is that the code is much **easier to test**, e.g. individual
steps and the framework of graph algorithms can be unit-tested all without
having to spin up the entire _ChRIS_ backend.

### Tradeoffs

The parameter of `Step::request` is a hashmap which provides runtime dependencies
to the step. For example, setting the name of a _ChRIS_ feed requires you to know
two things: the URL of that feed and the feed owner's auth_token. The
implementation of `FeedSetName` might look like:

```rust
impl Step for FeedSetName {
    fn request(&self, map: &dyn DependencyMap) -> Option<Request> {
        let auth_token = map.get(Dependency::AuthTokenOf(self.owner))?;
        let feed_url = map.get(Dependency::FeedUrlOf(self.plugin_instance))?;
        let body = FeedRequest { name: self.name.to_string(), ..Default::default() };
        Request::new(Method::PUT, feed_url).json(body)
    }
}
```

Unfortunately, this interface does not enable static type-safety i.e. `Step`
implementation cannot statically declare what values they depend on
(`auth_token` and `feed_url`). That would probably require lots of complicated
macros. The correctness of dependency relationships is validated at runtime
instead using [`debug_assert!`](https://doc.rust-lang.org/std/macro.debug_assert.html)
statements.

:::warning

All Rust code above is pseudo-code for the sake of brevity.

:::

## In the Browser

One of the strengths of _ChRIS_ is how easy it is to [run locally](/docs/run)
on your own hardware. The most common question is then: what next?

`chrisomatic` is now incorporated into [ChRIS_ui](https://github.com/FNNDSC/ChRIS_ui),
solving the "blank page" problem of when you open _ChRIS_ right after a fresh start.
When you run [miniChRIS](https://github.com/FNNDSC/miniChRIS-docker) and login as
the default admin user (`chris:chris1234`), `chrisomatic` will check the backend
state. If the number of feeds is zero, a widget on the homepage will offer
"first run setup" which uses `chrisomatic` in the browser to populate _ChRIS_ with
sample users, data, and analyses.

## Conclusion

The rewrite of `chrisomatic` unlocks greater productivity of _ChRIS_ development.
Furthermore, it demonstrates the power of Rust as a "Rosetta language" where
one project can have multiple front-ends, empowered by a single codebase providing
a library that is interoperable with multiple other languages.

Ideas and feature requests can be submitted to https://github.com/FNNDSC/chrisomatic2/issues
