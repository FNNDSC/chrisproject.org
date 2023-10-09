# What are plugins?

Most simply, a _ChRIS_ plugin is a container image which has a command in the form

```shell
commandname [--optional-args values...] /path/to/inputs /path/to/outputs
```

For a more technical description, consult the spec:
https://github.com/FNNDSC/CHRIS_docs/blob/master/specs/ChRIS_Plugins.adoc

## Types of Plugins

There are three types of _ChRIS_ plugins:

- "ds" _data synthesis_ plugins process input file to produce output files
- "fs" _feed synthesis_ plugins create data, without taking input files
- "ts" _topology synthesis_ plugins are special, they are directly associated with the _ChRIS_ backend API itself

### _ds_-type Plugins

_ds_ plugins are the most common type of plugins. They process data from a directory of input files,
writing outputs to a specified output directory.

```shell
programname [--option value...] inputdir/ outputdir/
```

For example, the _ds_ plugin [pl-infantfs](https://github.com/FNNDSC/pl-infantfs)
takes in a NIFTI file as input, and in its output directory it creates brain segmentation and surface files.

### _fs_-type Plugins

_fs_ plugins create data in an output directory. They do not consume input files.

```shell
programname [--option value...] outputdir/
```

_fs_ plugins either generate data or connect _ChRIS_ to external sources. For example:

- [pl-create-tetra](https://github.com/FNNDSC/pl-create_tetra) creates a sphere polygonal mesh in its output directory
- [rclone](https://github.com/FNNDSC/pl-rclone-copy-template) is used in a _fs_ plugin to pull data from SFTP servers

### _ts_-type Plugins

_ts_ plugins are special cases which are not usually created by community developers.
_ts_ plugin functionality and some _ts_ plugin parameters are hard-coded into the
[_ChRIS_ backend](https://github.com/FNNDSC/ChRIS_ultron_backEnd) directly.
