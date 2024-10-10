---
title: "HOW TO: Convert an existing Python app"
toc_min_heading_level: 2
toc_max_heading_level: 3
---

This guide will show you how to convert (almost) any existing Python program into a
[_ChRIS_ _ds_ plugin](../plugins#ds-type-plugins)!
It's easier done than said.

:::tip

This guide assumes working knowledge of Python, Python packaging, and Docker.

:::

## 1. Install `chris_plugin`

```shell
pip install -U chris_plugin
```

## 2. Use `argparse`

Changes are, your Python program is already using
[argparse](https://docs.python.org/3/library/argparse.html).
If not, you'll need to add it:

```python
from argparse import ArgumentParser
parser = ArgumentParser()
```

## 3. Add a `main` function

You probably have this too, though here we need to do something special:

A ChRIS plugin processes data from an input directory and writes its results to an output directory.
Hence, these data directories should be parameters to your `main` function.

The `main` function should be **decorated** with the **`@chris_plugin`** decorator, which takes the
parser you created.

```python
from chris_plugin import chris_plugin

@chris_plugin(parser=parser)
def main(options, inputdir, outputdir):
    ...
```


## 4. Customize `setup.py`

Once again, your app should already have a `setup.py`!

As a command-line app, `setup.py` must specify
[entrypoints](https://setuptools.pypa.io/en/latest/userguide/entry_point.html).

It should look like this:

```python
from setuptools import setup

setup(
    name             = 'chris-plugin-example',
    version          = '1.0.0',
    description      = 'A ChRIS DS plugin that I made',
    author           = 'FNNDSC',
    author_email     = 'dev@babyMRI.org',
    url              = 'https://github.com/FNNDSC/chris-plugin-example',
    # if your app is a single script file, use py_modules
    # if your app is a folder containing Python packages, set packages=...
    py_modules       = ['app'],
    install_requires = ['chris_plugin'],
    license          = 'MIT',
    python_requires  = '>=3.10',
    entry_points     = {
        'console_scripts': [
            # here you need to declare the name of your executable program
            # and your main function
            'my_command = app:main'
            ]
        }
)
```

## 5. Create `Dockerfile`

`Dockerfile` are instructions for how to build a container image from your source code.

```Dockerfile
FROM python:3.10
WORKDIR /usr/local/src
COPY . .
RUN pip install .
CMD ["my_command", "--help"]
```

## 6. Done!

A JSON description of your ChRIS plugin can be created using the `chris_plugin_info` command:

```shell
chris_plugin_info --dock-image docker.io/fnndsc/pl-app:v1.0.0 > description.json
```

The file `description.json` is a representation of your plugin which can be uploaded to a _ChRIS backend_.
The instructions to do so are [here](./upload_plugin).
