---
title: "Podman"
sidebar_position: 0
---

# _ChRIS_ on Podman

::::danger

This page is WIP.

::::

## Introduction

[Podman](https://podman.io) is a rootless, daemon-less\*,
and somewhat more vendor neutral alternative to [Docker](https://docker.com).

Podman has two ways of supporting Kubernetes YAMLs: directly using the
[`podman kube play`](https://docs.podman.io/en/stable/markdown/podman-kube-play.1.html)
command, or by running Kubernetes in Podman using [KinD](https://kind.sigs.k8s.io/).
The `podman kube play` command has some limitations but avoids the overhead of running
kubelet and containerd in Podman containers.

<small>
  \*Even though daemonlessness is a primary selling point of Podman, often times a damon
  is nonetheless necessary, as is the case with running _ChRIS_ using Podman.
</small>

## System Requirements

Podman version 4.3 or above is required.
We aim to support "out-of-the-box" setups of rootless Podman (using slirp4netns and aardvark-dns).
_ChRIS_ on Podman has previously been tried and worked on: Fedora Silverblue 37, Ubuntu 22.04, and Arch Linux.

<details>
<summary>
Notes about installing Podman on Arch Linux.
</summary>

On Arch Linux, please consult the wiki: https://wiki.archlinux.org/title/Podman

Here's what worked for me (possibly helpful, definitely outdated info)

```shell
sudo pacman -Syu podman aardvark-dns
sudo usermod --add-subuids 100000-165535 --add-subgids 100000-165535 $USER
```

</details>

:::warning

Podman version 4.6.2 does not work due to a [bug](https://github.com/containers/podman/issues/19930).
If `pman` is reporting the error

> crun: write to `/proc/self/oom_score_adj`: Permission denied: OCI permission denied

Try downgrading `crun` to version 1.8.7.
(On Arch Linux, run `sudo pacman -U /var/cache/pacman/pkg/crun-1.8.7-1-x86_64.pkg.tar.zst`)

:::

## Dependencies

In addition to Podman, you also need to have [Helm](https://helm.sh/) installed.

## Configuration

_ChRIS_ runs containers of its own, so you need to run a Podman socket.
On systemd GNU/Linux, run

```shell
systemctl --user start podman.service
```

Create a `values.yaml` configuration file:

```shell
git clone https://github.com/FNNDSC/charts.git fnndsc-charts
cd fnndsc-charts/podman
./init.sh > values.yaml
```

## Usage

First, set your working directory to the `fnndsc-charts` repo cloned above.

### Startup

```shell
helm template chris ./charts/chris -f podman/values.yaml | podman kube play --replace -
```

### Shutdown

```shell
helm template chris ./charts/chris -f podman/values.yaml | podman kube down -
```

### Shutdown and Delete Data

```shell
helm template chris ./charts/chris -f podman/values.yaml | podman kube down --force -
```

### Use Podman Desktop

You need to generate the Kubernetes YAML first:

```shell
helm template chris ./charts/chris -f podman/values.yaml > chris.yaml
```

TODO TODO TODO

### ChRIS_ui

TODO TODO TODO
