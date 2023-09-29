---
title: "Deployment"
---

# Deployment

In production, _ChRIS_ should be deployed on [Kubernetes](https://kubernetes.io)
or [OpenShift](https://www.redhat.com/en/technologies/cloud-computing/openshift)
using [Helm](https://helm.sh/).

<details>
<summary>Background: what is Kubernetes and Helm?</summary>
<p>
Kubernetes coordinates how containers run on a cluster of computers working together.
Even in the case of a single-machine <em>ChRIS</em> deployment, using Kubernetes is
still recommended for production because it is a standard solution for container management.
</p>
<p>
Helm is often described as a package manager for Kubernetes. It uses templates from
third-party repositories to create Kubernetes resources, such as services and deployments.
</p>
</details>

## Requirements

- A Kubernetes cluster
- A [storage class](https://kubernetes.io/docs/concepts/storage/storage-classes/) which can provide
  filesystem-type volume claims
- [`kubectl`](https://kubernetes.io/docs/reference/kubectl/) for Kubernetes, or
  `oc` for OpenShift. Make sure you are logged in
- Helm v3.8 or above: https://helm.sh/docs/intro/install/

## Installation

Once Helm has been set up correctly, add the repo as follows:

```shell
helm repo add fnndsc https://fnndsc.github.io/charts
```

If you had already added this repo earlier, run `helm repo update` to retrieve
the latest versions of the packages. You can then run `helm search repo fnndsc` to see the charts.

To install the `chris` chart, obtain a copy of `values.yaml` and modify it to suit your needs.

```shell
helm show values fnndsc/chris > values.yaml 
```

When you're ready, install it:

```shell
helm upgrade --install --create-namespace --namespace chris chris-prod fnndsc/chris
```

The command above will create a release of the _ChRIS_ backend called `chris-prod`.

To uninstall the chart:

```shell
helm delete --namespace chris chris-prod
```

## Special Cases

### NFS Server Workarounds

A NFS-based storage class (for instance, using [nfs-subdir-external-provisioner](https://github.com/kubernetes-sigs/nfs-subdir-external-provisioner))
may require that all (stateful) containers run as a user with a specific UID. This can be achieved by configuring `securityContext`.

### OpenShift

The `bitnami/postgresql` subchart requires specific security configurations for OpenShift.
See https://github.com/bitnami/charts/tree/main/bitnami/postgresql#differences-between-bitnami-postgresql-image-and-docker-official-image
