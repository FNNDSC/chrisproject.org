---
title: "Running ChRIS"
---

# Running _ChRIS_

Running _ChRIS_ is easy. We support [Podman](podman/index.md) and [Docker](./docker.md)
via zero-config, "one-click installations" for local quickstart demos and testing.
In production, we provide [Helm charts](./helm.md) for creating a secure instance
of _ChRIS_ in [Kubernetes](https://kubernetes.io)
or [OpenShift](https://www.redhat.com/en/technologies/cloud-computing/openshift).

To run _ChRIS_ in development mode, see https://github.com/FNNDSC/ChRIS_ultron_backEnd

## Provisioning

[`chrisomatic`](https://github.com/FNNDSC/chrisomatic) is a tool for setting up
a deployment of _ChRIS_ with users and plugins. This is useful for demo and testing purposes.

[Podman](podman/index.md) and [Docker](./docker.md) provide the configuration file
`chrisomatic.yml` and instructions on how to run `chrisomatic`. For the most part,
`chrisomatic.yml` should be intuitive to figure out. More in-depth documentation can
be found in its repository: https://github.com/FNNDSC/chrisomatic
