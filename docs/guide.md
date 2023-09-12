---
sidebar_position: 2
---

# Contributor's Guide

## Architecture

As a distributed, "hybrid cloud" application, the backend architecture of _ChRIS_ is complex.

Generally, users sit in front of the [_ChRIS\_ui_](https://github.com/FNNDSC/ChRIS_ui), which makes
HTTP requests to the _CUBE_ API. _CUBE_ speaks to one or more _pfcon_ services. A _pfcon_ provides
CUBE access to a specific compute resource. _pfcon_ speaks to _pman_, which is a
[shim](https://en.wikipedia.org/wiki/Shim_(computing)) that translates a job request from _CUBE_
to a call to the compute resource cluster.

![Architecture Diagram](/img/figures/ChRIS_architecture.svg)

## Values and Goals

nada
