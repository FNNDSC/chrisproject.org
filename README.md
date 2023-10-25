# chrisproject.org Website

[![MIT License](https://img.shields.io/github/license/fnndsc/website2)](/LICENSE)
[![CI](https://github.com/FNNDSC/website2/actions/workflows/ci.yml/badge.svg)](https://github.com/FNNDSC/website2/actions/workflows/ci.yml)

_ChRIS_ project landing page and documentation website.

## Contributing

The source code of this repository is built automatically by
[GitHub Actions](https://github.com/FNNDSC/chrisproject.org/actions)
and deployed to GitHub Pages.

Most pages are just Markdown files, so it should be easy enough to contribute.

Suggested reading on how to create blog posts: https://docusaurus.io/docs/blog

### Editing Pages on GitHub.com

Markdown pages can be edited by clicking "Edit this page" on the page
itself, then "Edit this file" on GitHub.com.

When creating a new page on GitHub.com, be sure to follow the
[naming conventions](https://docusaurus.io/docs/blog#blog-post-date).

### Local Development

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

# automatically fix more issues, but with ¡danger!
pnpm run fix:unsafe
```

### Pages Organization

This table guides you on where to put your documentation.

| Directory          | Name                   | Description                                                                                        |
|--------------------|------------------------|----------------------------------------------------------------------------------------------------|
| `src/pages/`       | (none)                 | Landing page and other high-visibility pages.                                                      |
| `docs/`            | Documentation          | High quality documentation intended for the public.                                                |
| `docs/internal/`   | Internal Documentation | Notes and low quality documentation which are relevant only to the _ChRIS_ core development group. |
| `blog/`            | Blog                   | High quality write-ups about milestones or technical challenges and solutions.                     |
| `meeting_minutes/` | Meeting Minutes        | Low quality notes about meetings and progress updates.                                             |
| `ChRISalis/`       | ChRISalis              | Blog for the _ChRIS_ learning seminar. Contains links, slides, and meeting recordings.             |

### Static Assets

Small images and other media can be uploaded to Git in the `static/` directory.
Optionally, large assets such as PDFs, PPTX, ... can be hosted on
[NERC OpenStack](stack.nerc.mghpcc.org/) Swift Object Storage.

The instructions on how to do so are found [here](./docs/internal/nerc/swift.md).
If you don't have an account, or are too lazy to figure this out,
[message Jennings](https://matrix.to/#/@jennydaman:fedora.im) and he will handle it for you.
