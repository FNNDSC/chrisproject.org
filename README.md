# Website2

[![MIT License](https://img.shields.io/github/license/fnndsc/website2)](/LICENSE)
[![CI](https://github.com/FNNDSC/website2/actions/workflows/ci.yml/badge.svg)](https://github.com/FNNDSC/website2/actions/workflows/ci.yml)

_ChRIS_ project landing page and documentation website.

This is a humble WIP. It will one day replace the current
Jekyll-based website, which is available at https://chrisproject.org

## Local Development

Install [pnpm](https://pnpm.io/installation), then run

```shell
# install dependencies
pnpm i

# start development server
pnpm start
```

[Husky](https://github.com/typicode/husky) is used to enforce lint on commit.
You can run these checks manually, and fix some of the errors:


```shell
# show lint and formatting issues
pnpm run fix

# automatically format the code
pnpm run fmt

# automatically fix some issues
pnpm run fix

# automatically fix more issues, but with !danger!
pnpm run fix:unsafe
```

## Pages Organization

nada
