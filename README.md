# Website2

[![MIT License](https://img.shields.io/github/license/fnndsc/website2)](/LICENSE)
[![CI](https://github.com/FNNDSC/website2/actions/workflows/ci.yml/badge.svg)](https://github.com/FNNDSC/website2/actions/workflows/ci.yml)

A humble start. A dim hope to replace the current
[chrisproject.org Jekyll website](https://github.com/FNNDSC/website/tree/223a2146546ec74ebdde4245cb9fd069c36ea5d7).

### Installation

```
$ pnpm
```

### Local Development

```
$ pnpm start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

### Build

```
$ pnpm build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

### Deployment

Using SSH:

```
$ USE_SSH=true pnpm deploy
```

Not using SSH:

```
$ GIT_USER=<Your GitHub username> pnpm deploy
```

If you are using GitHub pages for hosting, this command is a convenient way to build the website and push to the `gh-pages` branch.
