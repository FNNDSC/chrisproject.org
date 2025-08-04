---
title: "Preact tooling in 2025: Going Off-Road"
authors: jennings
tags: [javascript]
---

![Preact Logo](https://raw.githubusercontent.com/preactjs/preact/8b0bcc927995c188eca83cba30fbc83491cc0b2f/logo.svg?sanitize=true)

There are so many new tools in the modern JS ecosystem such as
[Bun](https://bun.com/) and [Farm](https://farmfe.org/).
Do any of them work with [Preact](https://preactjs.com/)?

<!--truncate-->

## Summary

| Package Manager | Tool                   | Works? | HMR | `preact/compat` |
|-----------------|------------------------|--------|-----|-----------------|
| `bun`           | `vite`                 | ✅     | ✅  | ✅              |
| `bun`           | `vitest` + browser     | ✅     | ✅  | ✅              |
| `bun`           | `vitest` + `happy-dom` | ✅     | ✅  | ⚠️              |
| `bun`           | `bun run`              | ✅     | ❌  | ✅              |
| `bun`           | `bun test`             | ✅     | ✅  | ❌              |
| `bun`           | `farm`                 | ✅     | ✅  | [WIP](#farm-and-preact) |

## Bun

Earlier this year, Bun introduced a "full-featured frontend development toolchain"
with the release of [version 1.2.3](https://bun.com/blog/bun-v1.2.3).
The DX for React.js is great, but what about Preact?

For Preact, I found that `bun build` works fine, and `bun run` works except for
HMR. That means you have to manually refresh the web page each time you change
your source code.

Preact has a specialized system for HMR called [prefresh](https://github.com/preactjs/prefresh)
which might work with Bun. I tried to create a Bun plugin to integrate
prefresh, however it does not seem possible because Bun's plugin system is
feature incomplete. See https://github.com/oven-sh/bun/issues/21521

Nonetheless, `bun` still works as a package manager (with the same benefits of
[`pnpm`](https://pnpm.io/)) and JavaScript runtime so I choose to use it with
Preact and Vite.

## Farm

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

## Component Testing

`bun test` and `vitest` work to varying degrees with Preact.
See part 2: [Preact testing in 2025](./2025-08-04-preact-testing.md).

## Conclusion

Is JS tooling good yet? No&hellip;

Things generally work when you follow the expected instructions as-is.
Any kind of "exploratory" work of trying out new toolchain combinations
leads to unhelpful error messages and usually lost hope.
