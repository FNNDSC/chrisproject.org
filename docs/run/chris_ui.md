---
title: ChRIS_ui
sidebar_position: 3
---

::::tip

This page is for an upcoming release of _ChRIS_.

::::

_ChRIS\_ui_ can be deployed as a container image. For example, using Docker or Podman:

```shell
docker run --rm -it -p 8080:80 \
    -e CHRIS_UI_URL="http://$(hostname):8000/api/v1/" \
    -e PFDCM_URL="http://$(hostname):4005/" \
    ghcr.io/fnndsc/chris_ui:staging
```

Images are built automatically by [GitHub Actions](https://github.com/FNNDSC/ChRIS_ui/actions/workflows/build.yml)
for every push to the master and staging branches, as well as PRs targeting those branches.
The list of available images can be found here ⟶ https://github.com/FNNDSC/ChRIS_ui/pkgs/container/chris_ui

## Environment Variables

| Name              | Required? | Description                                                 |
|-------------------|-----------|-------------------------------------------------------------|
| `CHRIS_UI_URL`    | required  | _ChRIS_ backend API URL, e.g. `https://example.org/api/v1/` |
| `PFDCM_URL`       | required  | _PFDCM_ API URL, e.g. `http://example.org:4005/`            |
| `OHIF_URL`        | optional  | OHIF server URL                                             |
| `ACKEE_SERVER`    | optional  | Ackee server URL, see [analytics]                           |
| `ACKEE_DOMAIN_ID` | optional  | Ackee domain ID, see [analytics]                            |
| `SERVER_PORT`     | optional  | HTTP port, see [server configuration]                       |

[analytics]: #analytics
[server configuration]: #server-configuration

## Server Configuration {#server-configuration}

[static-web-server](https://github.com/static-web-server/static-web-server), a Rust-based web server,
is used for serving static files. It can be configured using environment variables. See here:
https://static-web-server.net/configuration/environment-variables/

Note that not all options can be overridden. See the `/config.toml` file in the _ChRIS\_ui_ container image.

## Analytics {#analytics}

We use [Ackee](https://ackee.electerious.com/) for privacy-respecting web analytics.
You need to self-host an instance of Ackee, then set the environment variables
`ACKEE_SERVER` and `ACKEE_DOMAIN_ID` on _ChRIS\_ui_.

## Container Security

The container user must be part of the `root` group (which is a recommended and secure practice,
[according to Red Hat](https://www.redhat.com/en/blog/a-guide-to-openshift-and-uids)).

You can run as an arbitrary user, e.g. using Docker:

```shell
docker run -u 100100:100100 --group-add=root \
  -e CHRIS_UI_URL=http://localhost:8000/api/v1/ \
  -e PFDCM_URL=http://localhost:4005/ \
  -e SERVER_PORT=9999 -p 9999:9999 localhost/fnndsc/chris_ui 
```

