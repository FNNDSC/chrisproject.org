---
title: "Helm (Kubernetes)"
sidebar_position: 2
---

# ChRIS in Production using Helm

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

When you're ready, install it.

:::tip

The command `helm upgrade --install --create-namespace ...` is a combination of the commands
`kubectl create namespace ...`, `helm install`, and `helm upgrade`. It:

1. Creates the namespace if it does not already exist.
2. If this is the first time running the command, install the chart, otherwise upgrade it.

:::

To install `chris` with a configuration values file called `values.yaml`:

```shell
helm upgrade --install --create-namespace --namespace chris --values values.yaml chris-prod fnndsc/chris
```

To uninstall the chart:

```shell
helm delete --namespace chris chris-prod
```

Finally, to nuke everything:

```shell
kubectl delete namespace chris
```

## Special Cases

Here are some common situations where the default values will not work.

### NFS Server Workarounds

A NFS-based storage class (for instance, using [nfs-subdir-external-provisioner](https://github.com/kubernetes-sigs/nfs-subdir-external-provisioner))
may require that all (stateful) containers run as a user with a specific UID. This can be achieved by configuring `securityContext`.

### RWO Volume Workarounds

It is strongly recommended to use `ReadWriteMany` volumes. If your storage class can only provide
`ReadWriteOnce` (RWO) volumes, then you need to do two workarounds.

When installing `fnndsc/chris` set the value `cube.enablePodAffinityWorkaround=true`

```shell
helm install --set cube.enablePodAffinityWorkaround=true chris-one fnndsc/chris
```

Once `chris-one` is installed, you need to reconfigure `pman` to use the node which
everything is running on. In the example below, we are using `oc` instead of `kubectl`.

```shell
selector='-l app.kubernetes.io/name=pfcon -l app.kubernetes.io/instance=chris-one'
node=$(oc get pod -o jsonpath='{.items[0].spec.nodeName}' $selector)
helm upgrade --reuse-values chris-one fnndsc/chris --set pfcon.pman.config.NODE_SELECTOR=kubernetes.io/hostname=$node
oc rollout restart deployment $selector
```

### Reverse Proxy for HTTPS

:::tip

OpenShift Routes use a HTTP reverse proxy behind the scenes.

:::

If _CUBE_ is behind a (trusted) reverse proxy which adds HTTPS, you must set the config to be

```yaml
cube:
  config:
    # the two settings below tell CUBE to trust the reverse proxy's HTTPS headers
    DJANGO_SECURE_PROXY_SSL_HEADER: "HTTP_X_FORWARDED_PROTO,https"
    DJANGO_USE_X_FORWARDED_HOST: "true"

    # for extra security...
    DJANGO_CORS_ALLOW_ALL_ORIGINS: "false"
    DJANGO_CORS_ALLOWED_ORIGINS: "https://chrisui.example.org"

    # other configs...
    CUBE_CELERY_POLL_INTERVAL: "5.0"
    AUTH_LDAP: "false"
```

### External PostgreSQL

It may be advantageous to use a pre-existing PostgreSQL instead of the bundled bitnamicharts/postgresql chart.
E.g. you may want to use `postgresql-ha` or a PostgreSQL operator (PGO) instead.
To use an external PostgreSQL, set the values

```yaml
postgresql:
  enabled: false  # disable bundled postgresql subchart

postgresSecret:
  # specify secret containing PostgreSQL connection parameters
  name: my-existing-postgresql
  isCrunchy: false  # <-- set as `true` if using Crunchy PGO.
```

## Tips and Tricks

### Helmfile

We strongly recommend using [Helmfile](https://helmfile.readthedocs.io) instead of using Helm directly.

Here is an example of a `helmfile.yaml` for installing both `fnndsc/chris` (backend) and `fnndsc/chris-ui` (frontend):

```yaml
repositories:
  - name: fnndsc
    url: https://fnndsc.github.io/charts

helmDefaults:
  createNamespace: false  # necessary on OpenShift

releases:
  - name: chris
    namespace: chris
    chart: fnndsc/chris
    version: "1.0.0-alpha.2"
    values:
      - ./chris-values.yaml
      - cube:
          secrets:
            AUTH_LDAP_BIND_PASSWORD: {{ fetchSecretValue "ref+k8s://v1/Secret/chris/ldapservice/bind-password" | quote }}
  - name: chris-ui
    namespace: chris
    chart: fnndsc/chris-ui
    version: "1.0.0-alpha.2"
    values:
      - ./chris-ui-values.yaml
```

### Use NodePort

If Kubelet is running on your host (whether your host is part of the cluster, or you're running
Kubernetes on your host for locatl development using something like [KinD](https://kind.sigs.k8s.io/))
you can configure `chris` to use `NodePort` as a convenient ingress solution.

```shell
helm upgrade --install --create-namespace --namespace chris chris fnndsc/chris \
     --set cube.server.service.type=NodePort \
     --set cube.server.service.nodePort=32000 \
     --set cube.server.service.nodePortHost=$(hostname)
```

### _ChRISomatic_

TODO

## Next Steps

- Configure **backups** for your PostgreSQL database.
- Install [_ChRIS\_ui_](./chris_ui.md), the _ChRIS_ user interface.
- Consider setting up [Authentik](/docs/admin/authentik-ldap.md) for a better user and group management experience.
