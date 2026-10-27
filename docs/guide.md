---
sidebar_position: 1
---

# Contributor's Guide

Reading this page provides background knowledge and will point you in the right direction
for getting started on hacking at _ChRIS_'s codebases.


:::danger

Page is WIP.

:::

## Architecture

_ChRIS_ is a distributed, "hybrid cloud" application. Two figures describe it. The first reads the whole of it as a machine, in layers; the second opens the backend up as blocks and shows who talks to whom.

### ChRIS as a machine

The stack a shell runs on is the plainest way to hold the layers in mind, and _ChRIS_ has two ways in that both end at the same server. On the left, the [_mise_](https://github.com/FNNDSC/mise) stack on a bastion: a door (`porter`), a session (`calypso`), a shell (`brasa`), a virtual filesystem (`fond`) and the `chris` backend that mounts _CUBE_ as a tree, with ARGUS as the desktop and `chell` as the terminal. On the right, the original [_ChRIS\_ui_](https://github.com/FNNDSC/ChRIS_ui): one browser application that speaks the _CUBE_ REST API through `chrisapi` and needs nothing else. Below the network line is the server's machine: _CUBE_ and its services, the compute resources it schedules onto, the OpenShift cluster, and the substrate the cluster stands on. A hospital's PACS is another machine across another network, reached only through _CUBE_'s own gateway.

![ChRIS as a machine: a layered figure. Rows are layers; surfaces attach from above over a wire; the bastion's box ends at the network line and the server's machine is below it](/img/figures/chris-as-a-machine.png)

### CUBE and what it stands on

The backend, _CUBE_, is one Helm release on an OpenShift cluster: an API server (Django on uvicorn, Collection+JSON over HTTP and a WebSocket for PACS progress), Celery workers over a DragonflyDB broker, a `beat` scheduler, PostgreSQL for the metadata, and file storage (Swift, S3 or a POSIX filesystem) holding CFS, the ChRIS File System. The PACS gateway is two services: `pfdcm` finds studies and asks the PACS to send them, and `oxidicom` is the DICOM receiver that writes what arrives into the file storage and registers it.

A compute resource is a separate [_pfcon_](https://github.com/FNNDSC/pfcon) service, one per resource; it took over the job of the former _pman_ in 2025 and is now the whole of it. A worker hands a plugin instance to _pfcon_ over HTTP; _pfcon_ stages the inputs, runs the plugin's container on its engine (Kubernetes, Docker Swarm, Docker or Podman), and stages the outputs back. An in-network _pfcon_ shares _CUBE_'s storage and runs on the same cluster, so staging is a copy and each plugin instance is a Kubernetes Job the cluster schedules; an out-of-network _pfcon_ runs anywhere and exchanges zips with the worker instead. The red wires in the figure are where _CUBE_ touches OpenShift: Helm installs every block as a pod, Routes and Services expose the API and the DICOM port, storage classes back the database and the storeBase, and the Kubernetes API is where _pfcon_ asks for Jobs.

![CUBE and what it stands on: a block figure. The CUBE deployment in the centre, the callers and the PACS at the left, two compute resources at the right, and the OpenShift cluster on its substrate as the floor](/img/figures/cube-and-what-it-stands-on.png)

Both figures are rendered from the HTML beside them in `static/img/figures/`; edit the HTML and re-render rather than editing the PNG.

## Values and Goals

...

