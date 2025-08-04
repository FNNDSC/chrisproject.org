---
title: "Preact testing in 2025: All About Compat"
authors: jennings
tags: [javascript]
---

This is part 2 of my investigation into [tooling for Preact in 2025](./2025-08-03-preact-tooling.md).
In summary, Preact component testing is easy and works using `vitest` or `bun`.
However, the only way to get `preact/compat` to work seamlessly is using
[vitest-browser-preact](https://github.com/JoviDeCroock/vitest-browser-preact),
which has other advantages too but at the cost of performance and stability.

<!-- truncate -->

## Introduction

What makes component testing hard? Web apps are supposed to run in a browser,
but they are developed on Node.js (or bun). The original idea behind Node.js
was to make things easier for developers—use one language everywhere. However,
what we ended up with are two systems (browser v.s. server JS) which are very
similar yet subtly different.

Component testing usually entails trying to run browser JavaScript outside of
a browser. Browser component testing in real browsers is becoming more popular,
but as of now the technology is still in early development.

## `bun test` and Preact

`bun test` can _almost_ replace [vitest](https://vitest.dev/) or
[Jest](https://jestjs.io/) for Preact. It only works with pure Preact components.

Setup is pretty easy: follow the official documentation, but replace
`@testing-library/react` with
<code>@testing-library/<b>p</b>react</code>.
-> https://bun.com/guides/test/testing-library

```tsx
// Example testing a Preact component using bun

import { expect, test } from "bun:test";
import { signal } from "@preact/signals";
import { fireEvent, render } from "@testing-library/preact";

const count = signal(0);

function increment() {
  count.value++;
}

function Counter() {
  return (
    <button type="button" onClick={increment}>
      click me
    </button>
  );
}

test("Counter", () => {
  const { getByText } = render(<Counter />);
  expect(count.value).toBe(0);
  fireEvent.click(getByText("click me"));
  expect(count.value).toBe(1);
});
```

<details>
<summary>

My futile attempts to get `bun test` working with `preact/compat`

</summary>

Dependencies on React need to be [aliased](https://bun.com/guides/install/npm-alias)
to `preact/compat`:

```shell
bun add --dev react@npm:@preact/compat react-dom@npm:@preact/compat
```

Unfortunately, we get to an unfixable error. The specific error message is

```
TypeError: undefined is not an object (evaluating 't.__H')
```

:::note

JavaScript is infamous for its incomprehensible error messages. The problem is
exacerbated by how Preact publishes minified code to npm. See
https://github.com/preactjs/preact/issues/2233

:::

The `t.__H` symbol comes from `node_modules/preact/hooks/dist/hooks.js`.
This bug was reported many times to `vitest` and `preact`:

- https://github.com/vitest-dev/vitest/issues/1652
- https://github.com/vitest-dev/vitest/issues/3502
- https://github.com/vitest-dev/vitest/issues/5915
- https://github.com/preactjs/preact/issues/3468
- https://github.com/preactjs/preact/issues/4035

The workarounds mentioned in those issues are for `vitest` so needless to say,
no solution has been found for `bun test`. I tried to use Bun's plugin system
to implement a solution, however its plugin API is not well maintained.

- Basic functionality of `onResolve` does not work, and has not been fixed
  for two years: https://github.com/oven-sh/bun/issues/5564
- Missing functionality and crashes: https://github.com/oven-sh/bun/issues/21521
- I also found that the examples in the
  [documentation for NAPI plugins](https://bun.com/docs/bundler/plugins#native-plugins)
  had type errors (filter must be regex, not string) and the Rust example didn't work.
  I did not bother creating a bug report for this.

</details>

## `vitest` and `happy-dom`

`vitest` works with Preact. Setup is somewhat straightforward, but adding
support for React dependencies can get ugly.

### 1. Install Dependencies

```shell
bun add -D vitest happy-dom
```

### 2. Alias react and react-dom Packages

Necessary if components depend on React.

```shell
bun add --dev react@npm:@preact/compat react-dom@npm:@preact/compat
```

### 3. Configure `vite.config.ts`

```ts
/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
export default defineConfig({
  plugins: [preact()],
  test: {
    environment: "happy-dom",

    // Automatically cleanup `render` after each test.
    // https://testing-library.com/docs/react-testing-library/setup/#auto-cleanup-in-vitest
    globals: true,

    deps: {
      // workaround to make sure preact/compat alias works in dependencies.
      // See https://github.com/vitest-dev/vitest/issues/5915#issuecomment-2179794149
      optimizer: {
        web: {
          enabled: true,
          include: [
            // list packages which depend on React, e.g. component libraries
            "@patternfly/react-core",
          ]
        }
      }
    }
  }
});
```

The `test.deps.optimizer.web` section is a workaround for the aforementioned
challenges of testing browser JS outside of a browser. It bundles the specified
dependencies so that they work properly.

### Limitations

A key strength of Preact is that it uses browser-native events instead of React
["synthetic events"](https://react.dev/reference/react-dom/components/common#react-event-object).
I found that this discrepancy can prevent events (interactivity) from working
with `@testing-library/preact`:

```tsx
import "@testing-library/jest-dom";
import { expect, test } from "vitest";
import { fireEvent, render } from "@testing-library/preact";
import { ThemeSelect, themePreference } from "./ThemeSelect";

test("Can set dark theme", () => {
  // ThemeSelect is my code which depends on a React-based component library
  const { queryByText } = render(<ThemeSelect />);

  // Sometimes, clicking works
  fireEvent.click(container.firstChild);
  expect(queryByText("Always use dark theme")).toBeVisible();

  // However, sometimes nothing works
  fireEvent.change(queryByText("Dark"));
  fireEvent.click(queryByText("Dark"));
  fireEvent.select(queryByText("Dark"));
  fireEvent.submit(queryByText("Dark"));
  fireEvent.mouseDown(queryByText("Dark"));
  fireEvent.mouseUp(queryByText("Dark"));

  // Works in browser, but not in vitest. "auto" !== "dark"
  expect(themePreference.value).toBe("dark");
});
```

## `vitest` browser mode

[vitest-browser-preact](https://github.com/JoviDeCroock/vitest-browser-preact)
is endorsed by both the Preact and Vitest teams.
It is also simple to configure:

```tsx
/// <reference types="vitest/config" />
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [preact()],
  test: {
    browser: {
      enabled: true,
      provider: 'playwright',
      instances: [
        { browser: 'firefox' }
      ]
    },
  }
});
```

Everything works great, and it comes with a fancy GUI too. The downside is that
continuous integration will run 200% slower plus an extra 1–2 minutes to setup
the Playwright browsers.

