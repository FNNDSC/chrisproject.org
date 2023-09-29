---
sidebar_position: 2
---

# Contributor's Guide

Reading this page provides background knowledge and will point you in the right direction
for getting started on hacking at _ChRIS_'s codebases.


:::danger

Page is WIP.

:::

## Backend Architecture

As a distributed, "hybrid cloud" application, the backend architecture of _ChRIS_ is complex.

Generally, users sit in front of the [_ChRIS\_ui_](https://github.com/FNNDSC/ChRIS_ui), which makes
HTTP requests to the _CUBE_ API. _CUBE_ speaks to one or more _pfcon_ services. A _pfcon_ provides
CUBE access to a specific compute resource. _pfcon_ speaks to _pman_, which is a
[shim](https://en.wikipedia.org/wiki/Shim_(computing)) that translates a job request from _CUBE_
to a call to the compute resource cluster.

![Architecture Diagram (light theme)](/img/figures/ChRIS_architecture.svg#gh-light-mode-only)
![Architecture Diagram (dark theme)](/img/figures/ChRIS_architecture_dark.svg#gh-dark-mode-only)

## Values and Goals

nada
