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

This table guides you on where to put your documentation.

| Directory         | Name                   | Description                                                                                        |
|-------------------|------------------------|----------------------------------------------------------------------------------------------------|
| `src/pages/`      | (none)                 | Landing page and other high-visibility pages.                                                      |
| `docs/`           | Documentation          | High quality documentation intended for the public.                                                |
| `docs/internal`   | Internal Documentation | Notes and low quality documentation which are relevant only to the _ChRIS_ core development group. |
| `blog/`           | Engineering Blog       | High quality write-ups about milestones or technical challenges and solutions.                     |
| `meeting_minutes` | Meeting Minutes        | Low quality notes about meetings and progress updates.                                             |
| `ChRISalis`       | ChRISalis              | Blog for the _ChRIS_ learning seminar. Contains links, slides, and meeting recordings.             |

## Static Assets

Small images and other media can be uploaded to Git in the `static/` directory.
Optionally, large assets such as PDFs, PPTX, ... can be hosted on
[NERC OpenStack](stack.nerc.mghpcc.org/) Swift Object Storage.
If you don't have an account, or are too lazy to figure this out,
[message Jennings](https://matrix.to/#/@jennydaman:fedora.im) and he will handle it for you.
