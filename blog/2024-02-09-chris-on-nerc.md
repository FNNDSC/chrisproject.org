---
title: "ChRIS on the NERC in 2024"
authors: jennings
tags: [OpenShift, announcements, DICOM]
---

_ChRIS_ is now available on the [NERC](https://nerc.mghpcc.org/)
at https://app1.chrisproject.org. This deployment is a milestone
comprising many improvements to _ChRIS_ made in 2023.

<!--truncate-->

## Highlights

- _CUBE_ is deployed using Helm, a cloud-native and vendor-neutral solution.
  https://github.com/FNNDSC/charts
- The "Library" and "PACS Query" pages of *ChRIS_ui* were improved.
  [NiiVue](https://github.com/niivue/niivue), a WebGL2 medical image viewer,
  was incorporated into *ChRIS_ui* and is what powers https://app.fetalmri.org/niivue
- Many AI and ML _ChRIS_ plugins were published last year, such as for
  [fetal brain masking](https://app1.chrisproject.org/plugin/5) and
  [MRI reconstruction](https://app1.chrisproject.org/plugin/4). They can be executed
  via https://app1.chrisproject.org, thanks to the availability of GPUs on the NERC-OCP.
- Performance was improved in _CUBE_, especially with "innetwork" "filesystem" mode
  pfcon. In other words, the data transfer from _CUBE_ to plugin instance jobs is
  as-efficient as could be.
- PACS retrieval was accelerated 200x by optimizing the system with Rust. https://github.com/FNNDSC/pypx-listener
- DICOMs retrieved by _ChRIS_ can be queried for and browsed via standardized DICOMweb WADO-RS, QIDO-RS
  APIs thanks to [pypx-DICOMweb](https://github.com/FNNDSC/pypx-rs/tree/master/pypx-DICOMweb),
  or with the popular [Open Health Imaging Foundation](https://ohif.org) viewer.
  Try it here: https://ohif.chrisproject.org
