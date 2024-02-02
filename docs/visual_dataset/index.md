# Visual Dataset

The "Fetal MRI Browser," or more generally known as a "ChRIS Visual Dataset Browser,"
is a feature of [ChRIS_ui](https://github.com/FNNDSC/ChRIS_ui) which uses
[NiiVue](https://github.com/niivue/niivue) to visualize neuroimaging data found in public feeds.

https://app.fetalmri.org/niivue

To see a dataset in the Visual Dataset Browser, it is necessary to run the plugin
[pl-visual-dataset](https://app.fetalmri.org/plugin/7).
The parameters for pl-visual-dataset are also used to add metadata to a dataset
such as author, academic references, and default Niivue options for each file.

:::tip

Only **public feeds** containing **one** pl-visual-dataset instance are supported.

:::

## For Users

Use case: you have many _"subjects"_ where there is a directory for each subject.
For example:

```
./Age 25/serag.nii.gz
./Age 25/ali_tissue.nii.gz
./Age 25/ali_mri.nii.gz
./Age 24/serag.nii.gz
./Age 24/ali_tissue.nii.gz
./Age 24/ali_mri.nii.gz
./Age 23/serag.nii.gz
./Age 23/ali_tissue.nii.gz
./Age 23/ali_mri.nii.gz
./Age 22/kiho.nii.gz
./Age 22/ali_tissue.nii.gz
./Age 22/ali_mri.nii.gz
```

Let's say that for each _"subject"_ we want one volume to be visible, and
the rest of them hidden. If `kiho.nii.gz` exists, we want it to be shown
and the rest hidden. In lieu of `kiho.nii.gz`, we prefer `serag.nii.gz`.
The full order of preference is:

```
kiho.nii.gz,serag.nii.gz,ali_mri.nii.gz,ali_tissue.nii.gz
```

This list, delimited by commas, should be the value supplied to the
`--order` argument of `pl-visual-dataset`.

Next, we know that `kiho.nii.gz`, `serag.nii.gz`, and `ali_mri.nii.gz`
represent T2 MRIs, which are typically visualized using a "gray" colormap.
Unlike the others, `ali_tissue.nii.gz` are segmentation labels which
is best visualized using the "roi_i256" colormap.

:::tip

Colormaps may be previewed here: https://niivue.github.io/niivue/features/colormaps.html

:::

The name of the colormap for each file is specified in the `--options` parameter.
For example:

```json
{
  "kiho.nii.gz": {
    "name": "T2 MRI",
    "author": "FNNDSC (Kiho Im et al)",
    "options": {
      "colormap": "gray",
      "colorbarVisible": false
    }
  },
  "serag.nii.gz": {
    "name": "T2 MRI",
    "author": "Imperial College London (Serag et al.)",
    "options": {
      "colormap": "gray",
      "colorbarVisible": false
    }
  },
  "ali_mri.nii.gz": {
    "name": "T2 MRI",
    "author": "CRL (Ali Gholipour et al.)",
    "options": {
      "colormap": "gray",
      "colorbarVisible": false
    }
  },
  "ali_tissue.nii.gz": {
    "name": "Tissue segmentation (\"Olympic edition\")",
    "author": "CRL (Ali Gholipour et al.)",
    "options": {
      "colormap": "roi_i256",
      "colorbarVisible": false
    },
    "description": "Tissue segmentation of the CRL fetal brain atlas."
  }
}
```

:::tip

The `--options` parameter, as well as each of its keys, are optional.
Nonetheless, it's encouraged to give as much detail as you can.

:::

The specification for what is supported by the `--options` parameter
is defined in [`types.py`](https://github.com/FNNDSC/pl-visual-dataset/blob/733926142a5f9d658e40d6ca04cfb855b0f847d6/pubchrisvisual/types.py).

## For Developers

The _ChRIS_ui_ will look for public feeds containing a magic file with the name `.chrisvisualdataset.root.json`.
This file is [created by pl-visual-dataset](https://github.com/FNNDSC/pl-visual-dataset/blob/733926142a5f9d658e40d6ca04cfb855b0f847d6/pubchrisvisual/one.py#L58).
_ChRIS_ui_ searches for instances of `pl-visual-dataset` in that feed, then retrieves a list of all the files
with file extension `*.nii.gz` or `*.nii.gz.chrisvisualdataset.volume.json`. If there exists a corresponding
`.nii.gz.chrisvisualdataset.volume.json` for a `.nii.gz`, then the `.nii.gz.chrisvisualdataset.volume.json`
is loaded as the Niivue default settings.
