---
title: Architecture
sidebar_position: 2
---

The _ChRIS_ user interface, [_ChRIS\_ui_](https://github.com/FNNDSC/ChRIS_ui), is what a typical user sees in their web browser.
It works by making HTTP requests to the backend API, which we call _CUBE_ (an appreviation of its
repository name, the [_ChRIS ultron backEnd_](https://github.com/FNNDSC/ChRIS_ultron_backEnd)).

At its core, _CUBE_ is responsible for maintaining a database of users, files, and computational jobs.
It runs jobs by sending job requests to one or more _pfcon_ services. A _pfcon_ provides
CUBE access to a specific compute resource. _pfcon_ speaks to _pman_, which is a
[shim](https://en.wikipedia.org/wiki/Shim_(computing)) that translates a job request from _CUBE_
to a call to the compute resource cluster.

Other parts of _ChRIS_ include [pfdcm](https://github.com/FNNDSC/pfdcm),
[oxidicom](./oxidicom), and [serie](https://github.com/FNNDSC/serie).
These components integrate _ChRIS_ with specialized features in the hospital environment,
e.g. reception of DICOM from PACS and automatic execution of pipelines for clinical analysis.

![Architecture Diagram (light theme)](/img/figures/ChRIS_architecture.svg#gh-light-mode-only)
![Architecture Diagram (dark theme)](/img/figures/ChRIS_architecture_dark.svg#gh-dark-mode-only)
