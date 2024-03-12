---
title: CLI Client
---

`chrs` is the command-line client for [_ChRIS_](https://chrisproject.org).
It is useful for scripting as well as efficiency for file uploads and downloads.

## Overview

Using `chrs` you can manage files and run analyses in _ChRIS_.

First, create a _ChRIS_ user account at https://app.chrisproject.org/signup and
[install `chrs`](./install.md). After that, you will be able to follow along with this
section as a tutorial.

### Logging In

First, we need to log in. By default, `chrs` uses "keyring" (secure) storage
to save your login token.

```shell
# login to a ChRIS backend
$ chrs login --cube https://cube.chrisproject.org/api/v1/ --ui https://app.chrisproject.org
username: rudolph
password: [hidden]
```

### Uploading Files

Now that we are logged in, we can get to work by uploading some files. To upload a
directory of DICOMs:

```shell
# upload specific files
$ chrs upload --feed 'Example Feed Name' ./001.dcm ./002.dcm

# upload specific files by pattern
$ chrs upload --feed 'Example Feed Name' ./*.dcm

# or, upload directory
$ chrs upload --feed 'Example Feed Name' .
```

### Searching for Analyses

Now that we have some data to work with, what can we do? Search for plugins/pipelines
to run with the `chrs search` command, followed by `chrs describe` to get the usage:

```
# show *all* available plugins and pipelines
$ chrs search

# search for plugins and pipelines matching the query "dcm"
$ chrs search "dcm"
plugin/88     pl-img2dcm@1.0.10
plugin/87     pl-img2dcm@1.0.12
plugin/86     pl-img2dcm@1.2.0
plugin/85     pl-img2dcm@1.2.2
plugin/98     pl-dcm2mha_cnvtr@1.0.0
plugin/97     pl-dcm2mha_cnvtr@1.1.14
plugin/96     pl-dcm2mha_cnvtr@1.1.16
plugin/95     pl-dcm2mha_cnvtr@1.1.18
plugin/17     pl-dcm2mha_cnvtr@1.2.22
plugin/127    pl-dcm2niix@0.1.0
plugin/9      pl-dcm2niix@1.0.0

# print information and help about a command
$ chrs describe pl-dcm2niix@1.0.0
pl-dcm2niix: dcm2niix (plugin/9)
https://app.chrisproject.org/plugin/9

             Version: 1.0.0
               Image: fnndsc/pl-dcm2niix:1.0.0
             License: MIT
                Code: https://github.com/FNNDSC/pl-dcm2niix
   Compute Resources: NERC-other, NERC

Usage: dcm2niixw [OPTIONS] [incoming]...

Arguments:
  [incoming]...  Plugin instance or feed to use as input for this plugin

Options:
  -b, --b <string>  BIDS sidecar [choices: y, n, o]
  -d, --d <int>     directory search depth. Convert DICOMs in sub-folders of in_folder? [choices: 0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
  -f, --f <string>  filename (%%a=antenna (coil) name, %%b=basename, %%c=comments, %%d=description, %%e=echo number, %%f=folder name, %%g=accession number, %%i=ID of patient, %%j=seriesInstanceUID, %%k=studyInstanceUID, %%m=manufacturer, %%n=name of patient, %%o=mediaObjectInstanceUID, %%p=protocol, %%r=instance number, %%s=series number, %%t=time, %%u=acquisition number, %%v=vendor, %%x=study ID; %%z=sequence name;)
  -m, --m <string>  merge 2D slices from same series regardless of echo, exposure, etc. [no, yes, auto] [choices: n, y, 0, 1, 2]
  -v, --v <string>  verbose [no, yes, logorrheic] [choices: n, y, 0, 1, 2]
  -x, --x <string>  crop 3D acquisitions [choices: y, n, i]
  -z, --z <string>  gz compress images [y=pigz, o=optimal pigz, i=internal:miniz, n=no, 3=no,3D] [choices: y, o, i, n, 3]
```

### Running an Analyses

Let's run `pl-dcm2niix` on our uploaded data to convert DICOM to NIFTI.

```shell
# simple usage
$ chrs run --title "DICOM to NIFTI simple" pl-dcm2niix

# advanced usage
$ chrs run --title "DICOM to NIFTI simple" --memory-limit 4Gi   pl-dcm2niix@1.0.0       --      -b n -v y
#          |________________________________________________|   |______________|        ^^      |________|
#                            chrs options                       plugin/pipeline name  Separator   plugin parameters
```

:::tip

Plugin parameters should be listed **after** the optional `--` separator.

:::

Check what we have so far with the `chrs status` command:

```
$ chrs status

▲ Example Feed Name  (feed/10)
  |
  |    created: Tue, 12 Mar 2024 10:19:46 -0400
  |   modified: Tue, 12 Mar 2024 10:19:46 -0400
  |
  |   finished: 2  pending: 0  running: 1  errors: 0

――――――――――――――――――――――――――――――――――――――――
● File upload from chrs  (plugininstance/45)
| ghcr.io/fnndsc/pl-dircopy:2.1.2 dircopy --dir=chris/uploads/chrs-upload-tmp-
|     1710253185164
|
● pl-unstack-folders  (plugininstance/46)
| fnndsc/pl-unstack-folders:1.0.0 unstack
|
● DICOM to NIFTI simple  (plugininstance/47)
  fnndsc/pl-dcm2niix:1.0.0 dcm2niixw -b=n -v=y
```

To see the logs, run `chrs logs`:

```shell
$ chrs logs
Converting /share/incoming/0001-1.3.12.2.1107.5.2.19.45152.2013030808110258929186035.dcm
# -- logs truncated --
```

### Downloading Files

What files did we get? Find out by running

```shell
chrs ls
```

Output files can be downloaded by running `chrs download`.

```shell
# download the current data
chrs download

# be specific about what to download
chrs download 'feed/Example Feed Name'

# be specific about what to download and where to save it
chrs download 'feed/Example Feed Name' output_data
```

### Referring to Previous Jobs

What if we need to _rerun_ `pl-dcm2niix` with a different set of parameters?
Currently, our feed looks like this:

```
pi/45  "File upload from chrs"
  |
pi/46  `pl-unstack-folders`
  |
pi/47  "DICOM to NIFTI simple"
```

We need to tell `chrs run` that we want the input for the next job to be `pi/46` instead of `pi/47`.
By default, `chrs run` will assume the input directory is your most recent output, which is `pi/47`
in this case. To specify the "second to most recent output" of our analysis, we can refer to it
by ID:

```shell
chrs run --title "Convert DICOM to NIFTI with gz compression" pl-dcm2niix -- -z y pi/47
```

Or more conveniently, we can refer to the "second to most recent output" as `..`:

```shell
chrs run --title "Convert DICOM to NIFTI with gz compression" pl-dcm2niix -- -z y ..
```

Now, our tree looks like

```
    pi/45  "File upload from chrs"
      |
      |
    pi/46  `pl-unstack-folders`
    /  \
   /    \
  |      |
  |    pi/48  "Convert DICOM to NIFTI with gz compression" (new)
  |
pi/47  "DICOM to NIFTI simple"
```

### Joining Branches

Now I want to run another plugin, `pl-mri-preview` on the outputs of _both_ `pi/47` and `pi/48`.
_ChRIS_ plugins only accept a single input directory, so `chrs run` will merge multiple input
directories into one before running.

```shell
chrs run --title "Create PNG figures" pl-mri-preview "DICOM to NIFTI simple" "Convert DICOM to NIFTI with gz compression"
```

Now, our tree looks like

```
    pi/45  "File upload from chrs"
      |
      |
    pi/46  `pl-unstack-folders`
    /  \
   /    \
  |      |
  |    pi/48  "Convert DICOM to NIFTI with gz compression"
  |      |
pi/47    |    "DICOM to NIFTI simple"
  |      |
   \    /
    \ /
    pi/49  "Merge of ..."
     |
     |
    pi/50  "Create PNG figures"
```

Notice the flexibility in how we specify arguments: input arguments can be:

- by ID, e.g. `pi/47` or `plugininstance/47`
- by feed ID, e.g. `feed/10`
- by title, e.g. `"DICOM to NIFTI simple"`
- unspecified (work on the most recent)

To learn more about how this works, read about the [concepts](./concepts.md).
