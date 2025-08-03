---
title: "Preact tooling in 2025: Going Off-Road"
authors: jennings
tags: [javascript]
---

![Preact Logo](https://raw.githubusercontent.com/preactjs/preact/8b0bcc927995c188eca83cba30fbc83491cc0b2f/logo.svg?sanitize=true)

There are so many new tools in the modern JS ecosystem such as
[Deno](https://deno.com/), [Bun](https://bun.com/), and
[Farm](https://farmfe.org/). Do any of them work with
[Preact](https://preactjs.com/)?

This blog summarizes the history of React.js and the motivation to replace it.
Next, I describe my experience trying to replace `vite` with `bun` or `farm`
for a Preact project.

<!--truncate-->

## Summary

| Package Manager | Tool       | Works? | HMR | `preact/compat` |
|-----------------|------------|--------|-----|-----------------|
| `bun`           | `vite`     | ✅     | ✅  | ✅              |
| `bun`           | `bun run`  | ✅     | ❌  | ✅              |
| `bun`           | `bun test` | ✅     | ✅  | ❌              |
| `bun`           | `farm`     | ✅     | ✅  | [WIP](#farm-and-preact) |

## Background

Everyone knows about [React.js](https://react.dev/). It was a revolutionary
innovation at the time. We owe it much appreciation for bringing functional
programming concepts ([pure](https://react.dev/learn/keeping-components-pure)
functions, side effects, declarative code) to the mainstream. However, React
took us a few steps forward and a few steps back. React is widely criticized
for its performance and boilerplate-heavy syntax.

### What is React.js?

Traditional UI programming involves changing visual elements (the DOM)
imperatively, which is an error-prone programming paradigm.

```html
<button onclick="addMessage()">click me</button>
<script>
function addMessage() {
  const node = document.createElement("div");
  node.innerText = "You clicked the button";
  document.body.appendChild(node);
}
</script>
```

React, as its name suggests, is "reactive": the UI changes in reaction to when
the values of your JavaScript variables change.

```jsx
const App = () => {
  const [clicked, setClicked] = React.useState(false);
  return (
    <>
      <button onChange={() => setClicked(true)}>
        click me
      </button>
      { clicked && <div>You clicked the button</div> }
    </>
  );
};
```

### How Does React.js Work?

The React.js runtime needs to be able to detect what to change about the DOM
in response to a change in state. It does so by rerunning the "render" function
(the functional component definition) whenever a JavaScript variable is mutated.
In practice, this means the "render" function is being called about 60 times a
second.

Obviously, this is very inefficient. The inefficiency has consequences:

1. React implements a "virtual DOM" a.k.a. vDOM and a "diff" algorithm which
   finds differences in vDOM. Each time a variable is changed, the vDOM is
   re-rendered. If a difference is found in the vDOM between renders, React
   updates the real DOM.
2. The "render" function must be "pure," and side-effects must be managed
   carefully (using [`React.useEffect`](https://react.dev/reference/react/useEffect)).
3. The "render" function must also be reasonably efficient.

### Inefficiency of React.js

The whole thing about how React repeatedly calls functions at 60Hz means the
programmer must be very careful. They:

- _Should_ wrap all computation (i.e. derived state) with
  [`React.useMemo`](https://react.dev/reference/react/useMemo).
  - And functions with [`React.useCallback`](https://react.dev/reference/react/useCallback).
- Should _not_ use React state for animation frames[^1], because frequent
  updates are inefficient and increase CPU load.

[^1]: https://dev.to/fedekau/animations-with-react-how-a-simple-component-can-affect-your-performance-2a41

### General Inefficiencies of JS Frameworks

- React's own programming language, JSX, needs to be converted to plain
  JavaScript because that is the language understood by web browsers.
- Your web app needs to import the React.js runtime which defines
  functions such as `React.setState`.

## The Current Scene

Since React is the most popular JS framework, a large ecosystem has been built
atop of React, and its tooling + developer experience have been heavily
optimized. In 2018, you had to wait 1-5 minutes for a React development server
to start. Today, [Vite](https://vite.dev/) starts instantly.

Vite is the most popular toolchain for React today, though I am curious about
the next-next-gen tools such as [Bun](https://bun.com/) and [Farm](https://farmfe.org/).

![Benchmarks of `bun build`](https://bun.com/images/bundler-speed.png)

I am also curious about the next-next-gen alternatives to react, e.g.
[Solid](https://www.solidjs.com/) and [Qwik](https://qwik.dev/) (or even
[Leptos](https://leptos.dev/)). Both Solid and Qwik offer React-like syntax and
paradigms but without the rerun-60x-every-second problem. Hence, runtime
performance is vastly superior. Furthermore, their bundle sizes are smaller as
well. Unfortunately, neither Solid nor Qwik are actually compatible with React.

For my current web project I choose [Preact](https://preactjs.com/) because it
is an efficient and React-compatible JS framework. It is easy to get started
with Preact using vite (`npm init preact`), but I wanted to see whether it works
with Bun or Farm.

## Bun Build

Earlier this year, Bun introduced a "full-featured frontend development toolchain"
with the release of [version 1.2.3](https://bun.com/blog/bun-v1.2.3). Many
people were asking whether Bun can replace Vite, and the answer is now **yes**!

:::tip

Always double-check whether what you're reading is up-to-date! When I searched
"vite vs. bun", a [blog on dev.to](https://dev.to/this-is-learning/why-use-vite-when-bun-is-also-a-bundler-vite-vs-bun-2723)
came up but its information is no longer accurate.

_This_ blog post is relevant in August 2025.

:::

`bun build` works great for React.js, the dev server with hot reloading (HMR)
works too. You can even write a full-stack application with Bun and React.js
SSR, so it can be an alternative to [Next.js](https://nextjs.org/).

But does `bun` work with Preact? I found that `bun build` works fine, and
`bun run` works except for HMR. That means you have to manually refresh the
web page each time you change your source code.

Preact has a specialized system for HMR called [prefresh](https://github.com/preactjs/prefresh)
which might work with Bun. I tried to create a Bun plugin to integrate
prefresh, however it does not seem possible because Bun's plugin system is
feature incomplete. See https://github.com/oven-sh/bun/issues/21521

Nonetheless, `bun` still works as a package manager (with the same benefits of
[`pnpm`](https://pnpm.io/)) and JavaScript runtime so I choose to use it with
Preact and Vite.

### `bun test` and Preact

`bun test` can _almost_ replace [vitest](https://vitest.dev/) or
[Jest](https://jestjs.io/) for Preact. It only works with pure Preact components.
`bun test` cannot alias React imports to `preact/compat`, so React components
of a Preact project cannot be tested.

## Farm and Preact

![Farm logo](https://github.com/farm-fe/farm/blob/04f2bfc2ccdab946fdae9aafe71b6825eaedaee9/assets/logo.png?raw=true)

Farm is an "extremely fast **Vite-compatible** web build tool written in Rust".
It even has a template for Preact. But does it work?

Once again, the answer is _almost_ because of problems caused by
`preact/compat`. Farm seems to work with pure Preact, but it has a bug when
Preact's React compatibility layer is linked. Considering that React
compatibility is the primary motivation to use Preact for most developers,
this is a deal-breaker.

I reported the bug which was fixed within 2 days. The author even added an
integration test specific for Preact. One nice thing about smaller projects is
that their authors are usually responsive and enthusiastic to work with you.
https://github.com/farm-fe/farm/issues/2211

## Conclusion

Is JS tooling good yet? No&hellip;
