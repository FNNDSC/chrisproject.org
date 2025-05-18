---
title: ChRIS_ui
sidebar_position: 3
---

::::tip

This page is for an upcoming release of _ChRIS_.

::::

_ChRIS\_ui_ can be deployed as a container image.

## Using Docker or Podman

```shell
docker run --rm -it -p 8080:80 \
    -e CHRIS_UI_URL="http://$(hostname):8000/api/v1/" \
    -e PFDCM_URL="http://$(hostname):4005/" \
    ghcr.io/fnndsc/chris_ui:staging
```

## Using Helm

```yaml
helm repo add fnndsc https://fnndsc.github.io/charts
helm repo update fnndsc
helm upgrade --install --create-namespace --namespace chris \
  --set cubeUrl=https://cube.example.org/api/v1/ \
  --set pfdcmUrl=https://pfdcm.example.org \
  chris-ui fnndsc/chris-ui
```

### Using Helmfile

[Helmfile](https://github.com/helmfile/helmfile) is strongly recommended over the official Helm CLI.

```yaml
repositories:
  - name: fnndsc
    url: https://fnndsc.github.io/charts

releases:
  - name: chris-ui
    namespace: chris
    chart: fnndsc/chris-ui
    version: "1.0.0-alpha.2"
    values:
      - cubeUrl: https://cube.example.org/api/v1/
        pfdcmUrl: https://pfdcm.example.org
```

### Using KNative

By default, the `fnndsc/chris-ui` chart will create a Deployment, Service, and optionally a HorizontalPodAutoscaler
using ordinary Kubernetes APIs. If [KNative Serving](https://knative.dev/docs/serving/) or
[Red Hat OpenShift Serverless](https://docs.openshift.com/serverless/) is available in your Kubernetes cluster,
you may prefer to use it instead. Use these values for `fnndsc/chris-ui`:

```yaml
kind: Service

# optional
revisionAnnotations:
  autoscaling.knative.dev/target: "100"
  autoscaling.knative.dev/min-scale: "1"
  autoscaling.knative.dev/max-scale: "3"
```

Consult the upstream documentation on [configuring custom domains](https://knative.dev/docs/serving/services/custom-domains/).

## Image Tags

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

