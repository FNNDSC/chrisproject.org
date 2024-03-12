---
title: Concepts
sidebar_position: 2
---

## Inspirations

`chrs` behaves similarly, but not exactly, like a filesystem. The `chrs` command-line interface
is inspired by built-in shell commands and the design of [`kubectl`](https://kubernetes.io/docs/reference/kubectl/).

Like a filesystem, you can run the `cd` command and `ls` commands:

```shell
chrs cd chris/feed_10/pl-dircopy_45/pl-unstack-folders_46/pl-dcm2niix_47
chrs ls
chrs ls ./data
chrs ls ..
chrs ls ../..
```

Unfortunately, path resolution is not fully implemented:

```shell
chrs ls '../DICOM to NIFTI simple'
Error: path not found
```

Like `kubectl`, resources _should_ be prefixed by their resource type names, which can be abbreviated:

```shell
chrs describe 'plugin/pl-dcm2niix'
chrs describe 'pipeline/Fetal Reconstruction Pipeline'
chrs describe 'pp/Fetal Reconstruction Pipeline'
```

What's more is that `chrs` will try to guess what you mean if the resource type is not provided.

```shell
# assumed to be a plugin
chrs describe 'pl-dcm2niix'

# assumed to be a pipeline because plugin names don't usually contain spaces
chrs describe 'Fetal Reconstruction Pipeline'
```

## Runnables

Runnables are involved in `chrs run`, `chrs search`, and `chrs describe`.

A **runnable** is one of:

- a [plugin](#plugins)
- a [pipeline](#pipelines)

Tests: https://github.com/FNNDSC/chrs/blob/7ab5a7831bc9746b6e76727b24b6c9572fd177e1/chrs/src/arg/runnable.rs#L260-L338

### Plugins

Plugins may be specified by any of:

- plugin name, e.g. `pl-dcm2niix`, `pl/pl-dcm2niix`, `plugin/pl-dcm2niix`
- plugin name and version, e.g. `pl-dcm2niix@1.0.0`, `pl/pl-dcm2niix@1.0.0`, `plugin/pl-dcm2niix@1.0.0` (preferred)
- plugin ID, e.g. `127`, `pl/127`, `plugin/127`
- API URL, e.g. `https://cube.chrisproject.org/api/v1/plugins/127/`

### Pipelines

Pipelines may be specified by any of:

- pipeline name, e.g. `Fetal Brain Reconstruction`, `pp/Fetal Brain Reconstruction`, `pipeline/Fetal Brain Reconstruction`
- pipeline ID, e.g. `pp/12`, `pipeline/12`
- API URL, e.g. `https://cube.chrisproject.org/api/v1/pipelines/12/`

## Data Nodes

Data nodes are involved in `chrs run`, `chrs status`, `chrs list`, `chrs logs`, `chrs ls`, and `chrs download`.

Data nodes are plugin instances, simply put. However, for flexibility they may be specified one of several ways:

- plugin instance title, e.g. `DICOM-to-NIFTI`, `pi/DICOM-to-NIFTI`, `plugininstance/DICOM-to-NIFTI`
- plugin instance ID, e.g. `42`, `pi/42`, `plugininstance/42`
- relative path, e.g. `.`, `..`, `../..`
- absolute\* path, e.g. `rudolph/feed_130/pl-dircopy_543` 
- feed name, e.g. `feed/A tractography study`
- feed ID, e.g. `feed/80`

\*By convention, absolute paths do _not_ start with `/`. Relative paths start with `./` or `..`.

### Feeds as Data Nodes

Be aware that the different subcommands of `chrs` interpret feeds differently.

- `chrs download feed/N` will download _all_ files of a feed
- `chrs status feed/N` will show only the feed status, but no plugin instance statuses
- `chrs run <runnable> feed/N` will append the [`<runnable>`](#runnables) to the most recent plugin instance in `feed/N`
