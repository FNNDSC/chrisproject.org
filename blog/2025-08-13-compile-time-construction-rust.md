---
title: "Compile-Time Construction in Rust"
authors: jennings
tags: [rust, programming]
---

Rust's type system enables "correct by construction" design, however there are
limitations to how data can be constructed at compile time. Here we go over the
four approaches to static data initialization and their respective pros and
cons.

<!--truncate-->

## Summary

For each method, we ask whether it is:

- Flexible: can any code be used, e.g. std, iteration, allocations?
- Zero-cost: is there a runtime cost?
- Type-safe: can the data be type-checked at compile-time?
- Correct: is valid code guaranteed to work (not panic)?
- Composable: can the functionality be shared as a crate?

| Solution              | Flexible | Zero-cost | Type-safe | Correct | Composable |
|-----------------------|----------|-----------|-----------|---------|------------|
| `std::sync::LazyLock` | ✅       | ❌        | ✅        | ❌      | ✅         |
| `const fn`            | ❌       | ✅        | ✅        | ✅      | ✅         |
| `#[proc_macro]`       | ✅       | ✅        | ❌        | ❌      | ✅         |
| `build.rs`            | ✅       | ✅        | ✅        | ✅      | ❌         |

<sup>The table above is subjective.</sup>

## `LazyLock`

```rust
use regex::Regex;
use std::sync::LazyLock;

// Example using LazyLock to create a Regex
static MATCHER: LazyLock<Regex> = LazyLock::new(|| Regex::new(r".*needle.*").unwrap());

#[test]
fn test_matcher() {
    assert!(MATCHER.find("haystack needle haystack").is_some())
}
```

[`std::sync::LazyLock`](https://doc.rust-lang.org/std/sync/struct.LazyLock.html)
is the cop-out solution: "lazy" here means that data initialization is "lazy,"
that is, data is initialized only when and immediately before it is first used.
"Lazy" does _not technically_ mean that the developer is lazy, but sometimes it
is the case that you reach for `LazyLock` out of developer laziness.

:::tip

You might have seen `lazy_static!` or the `oncecell` crates. These are
third-party implementations of `LazyLock` which have existed before `LazyLock`
was introduced to `std` in Rust version 1.80.

:::

`LazyLock` is most commonly suggested because it does not have any
limitations (compared to `const fn` or codegen methods). However, it lacks
compile-time guarantees about "correctness" in the sense that whether the code
compiles makes no guarantee about whether it will work. It is possible to have
code which compiles but will unconditionally panic. The only way to find out is
by running the program (i.e. by having unit tests):

```rust
use regex::Regex;
use std::sync::LazyLock;

// note typo in regex, mising left `[`
static HAS_NUMBER: LazyLock<Regex> = LazyLock::new(|| Regex::new(r".*[:digit:]].*").unwrap());

#[test]
fn test_matcher() {
    assert_eq!(1 + 1, 2); // everything before runs fine
    assert!(HAS_NUMBER.find("haystack 123 haystack").is_some()) // 🚫 panics
}
```

The [`regex`](https://docs.rs/regex) crate is used in the examples above.
Indeed, compile-time construction and compile-time validation are highly
requested features. Sadly, these feature requests were closed as "won't fix."

- [#607](https://github.com/rust-lang/regex/issues/607): "Idea: compile-time verification"
- [#709](https://github.com/rust-lang/regex/issues/709): "provide a helper routine for building a static regex"
- [#913](https://github.com/rust-lang/regex/issues/913): duplicate of \#607

### Runtime Cost of `LazyLock`

`LazyLock` is used where you want compile-time data initialization, but it
doesn't actually do that. It does initialization at runtime. Typically the
initialization is a pure function, meaning use of `LazyLock` makes your program
unnecessarily recompute the same data every time it starts. The cost of this is
a few nanoseconds of CPU time and some extra KB of binary size. In other words,
the runtime cost of `LazyLock` is negligible. Nonetheless, if you are a
perfectionist like me, this annoys you to no end. Hence, we are motivated to
explore the other options described below.

## `const fn`

It is rare for Rustaceans to be jealous of some feature from another language,
though [Zig's](https://ziglang.org/) `comptime` sparks much envy from us.

In Rust, a function must be explicitly marked as `const fn` in order to be
`const`-compatible (i.e. to be able to compute at compile-time).

```rust
const fn add(a: u32, b: u32) -> u32 {
    a + b
}

const SUM: u32 = add(4, 5);

#[test]
fn test_sum() {
    assert_eq!(SUM, 9)
}
```

In practice, only a small subset of functions are `const`. Although more and
more `std` functions are becoming `const` with each new Rust version, many core
components are not `const`, such as iteration:

```rust
// 🚫 does not compile, requires nightly features
const SUM: u32 = [4, 5].iter().sum();

const fn sum(list: &[u32]) -> u32 {
    let mut n = 0;
    // 🚫 does not compile, cannot use for loops
    for num in list {
        n += num;
    }
    n
}
```

What is happening here is that the `Iterator` and `IntoIterator` traits are
not `const` so they cannot be used in `const fn`.

The [`konst`](https://crates.io/crates/konst) crate provides macros and a
"domain-specific language" (DSL) implementing some `std` functionality as
`const` including iteration.

```rust
use konst::{
    primitive::parse_u64,
    result::unwrap_ctx,
    iter, string,
};

const CSV: &str = "3, 8, 13, 21, 34";

static PARSED: [u64; 5] = iter::collect_const!(u64 =>
    string::split(CSV, ","),
        map(string::trim),
        map(|s| unwrap_ctx!(parse_u64(s))),
);

assert_eq!(PARSED, [3, 8, 13, 21, 34]);
```

`konst` enables a lot more at `const`, but as a macro, it is not convenient
to use (since IDEs and `rust-analyzer` are not good at handling them). Neither
does is unlock every limitation of `const`, e.g. it is still impossible to
create heap-allocated data structures such as String or Vec.

## Macros

As discussed, data declaration in `const` is possible however data
_computation_ such as iteration is usually not. One workaround is to
pre-compute the data in a procedural macro which generates `const` data
declarations.

A macro is a function which parses syntax and returns generated Rust code.

```rust
// -- file: src/lib.rs --
use proc_macro::{TokenStream, TokenTree};
use quote::quote;

#[proc_macro]
pub fn sum(input: TokenStream) -> TokenStream {
    let mut n = 0;
    for token in input {
        if let TokenTree::Literal(literal) = token {
            let num: u32 = literal.to_string().parse().unwrap();
            n += num;
        }
    }
    quote! { #n }.into()
}

// -- file: tests/test_sum.rs --
use macro_example::sum;

const SUM: u32 = sum!(3, 4, 5);

#[test]
fn test_sum() {
    assert_eq!(SUM, 12);
}
```

Unlike `const fn`, macros can do anything, including iteration, intermediate
use of allocated data structures, and I/O. However, macros are difficult to
write. They bypass Rust's type-safety and compile-time guarantees. The tiny
example above demonstrates how macros are not type-safe: `src/lib.rs` compiles,
yet it does not handle unexpected input, so `sum!("lol")` will cause it to
panic with an unhelpful error message. Neither does macro compilation guarantee
that the macro produces sound code.

```rust
use proc_macro::TokenStream;
use quote::quote;

/// Dumb example of a valid macro that produces syntactically valid but
/// unsound code.
#[proc_macro]
pub fn sum(_input: TokenStream) -> TokenStream {
    quote! { 1 + "lol" }.into()
}
```

Most non-trivial macros use the [`syn`](https://crates.io/crates/syn) crate.
I like Shepherd's[^1] description of `syn`:

> \[The\] poetically named `syn` \[...\]
> said like the first part of the word “syntax” and exactly like the word “sin”

[^1]: https://soasis.org/posts/a-mirror-for-rust-a-plan-for-generic-compile-time-introspection-in-rust/#the-syn-crate-said-like-the-first-part-of-the-word-%E2%80%9Csyntax%E2%80%9D-and

Macros are ugly yet we cannot live without them.

Procedural macros are also limited by where they can be defined[^2]:

> Procedural macros must be defined in the root of a crate with the crate type
> of `proc-macro`. The macros may not be used from the crate where they are
> defined, and can only be used when imported in another crate.

[^2]: https://doc.rust-lang.org/reference/procedural-macros.html

This limitation makes procedural macros inconvenient to use, especially in
small one-off projects (you'll have to refactor your repository to be a
[cargo workspace](https://doc.rust-lang.org/book/ch14-03-cargo-workspaces.html)).

## `build.rs`

Like macros, a `build.rs` build script offers a codegen mechanism which acts as
an escape-hatch from the limitations of `const fn`. In `build.rs` you can run
arbitrary Rust code and produce arbitrary Rust code. For small use cases, it's
actually easier to do codegen in `build.rs` than it is to write a macro,
because you can write plain strings instead of dealing with `TokenStream` and
syntax trees.

```rust
// build.rs

use std::env;
use std::fs;
use std::path::Path;

fn main() {
    let out_dir = env::var_os("OUT_DIR").unwrap();
    let dest_path = Path::new(&out_dir).join("data.rs");
    let value = [3, 4, 5].iter().sum();
    let code = format!("const SUM: u32 = {value};");
    fs::write(&dest_path, code).unwrap();
    println!("cargo::rerun-if-changed=build.rs");
}

// src/lib.rs

include!(concat!(env!("OUT_DIR"), "/data.rs"));

#[test]
fn test_sum() {
    assert_eq!(SUM, 12);
}
```

Assuming you use the output right away, this method is type-safe and
correct-by-construction. However, `build.rs` scripts are less easily
composable. If you want to create some shared functionality as a library,
it is preferable to write a `proc-macro` type crate instead.

