---
title: Oxidicom
---

:::tip

This page is for an upcoming release of _ChRIS_. See https://github.com/FNNDSC/oxidicom/pull/3

:::

_oxidicom_ is a high-performance DICOM receiver for the
[_ChRIS_ backend](https://github.com/FNNDSC/ChRIS_ultron_backEnd) (CUBE).

More technically, _oxidicom_ implements a DICOM C-STORE service class provider (SCP),
meaning it is a "server" which receives DICOM data over TCP. Received data are
stored in _CUBE_.

