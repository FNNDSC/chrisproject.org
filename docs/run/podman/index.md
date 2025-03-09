---
title: "Podman"
sidebar_position: 0
---

# _ChRIS_ on Podman

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

Podman version 4.9.3 or above is required.
We aim to support "out-of-the-box" setups of rootless Podman (using slirp4netns and aardvark-dns).

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

## Usage

```shell
git clone https://github.com/FNNDSC/miniChRIS-podman.git
cd miniChRIS-podman
./minichris.sh
```
