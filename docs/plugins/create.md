---
title: Create a ChRIS Plugin
---

# Create a ChRIS Plugin

This page is the entry point for creating a new _ChRIS_ plugin. It collects the current recommended path and points to the deeper pages for plugin concepts, continuous integration, and registration.

## Current Recommended Path

A _ChRIS_ plugin is a containerized command-line application. It accepts the input and output directory arguments expected by _ChRIS_, exposes its own parameters, and provides metadata that can be registered with a _ChRIS_ backend.

For Python plugins, the current recommended starting point is
[`python-chrisapp-template`](https://github.com/FNNDSC/python-chrisapp-template).
Open the template repository in GitHub and use **Use this template** to create a new repository
under your own GitHub account or organization. Clone the new repository locally. At this point
you have a working Python project scaffold with a Dockerfile, packaging metadata, tests,
documentation structure, and GitHub Actions.

After creating the repository, initialize it for your plugin. There are two practical paths:
edit the template files by hand, or use the template's `bootstrap.sh` helper.

### Manual initialization

If you do not use `bootstrap.sh`, start with `app.py`. This is the example plugin implementation.
Rename it only if you also update every reference to it. In `app.py`, replace the example parser
description, options, display title, `@chris_plugin(...)` metadata, and `main` implementation with
your plugin's behavior.

The Python entry point is the function that _ChRIS_ will run inside the container. In `app.py`,
that function is `main`. It uses the
[`chris_plugin`](https://github.com/FNNDSC/chris_plugin) decorator. In practice, this means:
define the command-line options with `argparse`, write `main(options, inputdir, outputdir)`, read
from `inputdir`, write all results to `outputdir`, and let `chris_plugin` use the decorated function
to generate plugin metadata. The plugin should not rely on local files outside the input and output
directories at runtime.

Next update `setup.py`. The `entry_points` section defines the console command that _ChRIS_ and
Docker will run. In the template it looks like `commandname = app:main`. Change `commandname` to
your plugin command. If you renamed `app.py`, change `app:main` to match the renamed module. Also
update the package name, description, author, email, URL, and any dependencies.

Then update `Dockerfile`. Its `CMD ["commandname"]` must match the console command from `setup.py`.
The image labels should describe your plugin, and any system-level dependencies should be installed
there. Finally, update `tests/test_example.py` so it imports your module, constructs realistic input
data, calls `main`, and verifies the expected output files.

The command name must line up across the project. The Python module, `setup.py` entry point,
Dockerfile `CMD`, tests, README examples, and GitHub Actions workflow all need to agree. If these
surfaces drift apart, the project may build but fail when _ChRIS_ tries to execute the plugin.

### Using `bootstrap.sh`

The template also includes `bootstrap.sh`, which can perform many of the renaming and metadata
edits automatically. To use it, edit the configuration variables near the top of the script:
`PLUGIN_NAME`, `PLUGIN_TITLE`, `SCRIPT_NAME`, `DESCRIPTION`, `ORGANIZATION`, and `EMAIL`. Then
uncomment `READY=yes` and run `./bootstrap.sh`.

The helper rewrites project files, renames `app.py` to your script name, updates `setup.py`,
updates the Dockerfile labels and command, updates tests, optionally enables parts of the GitHub
Actions workflow, creates a virtual environment, and installs the project for local development.
After it runs, inspect the diff before committing. The script is a convenience tool, not a substitute
for understanding the generated project.

There are important caveats. `bootstrap.sh` is written for GNU/Linux and uses GNU shell tooling.
It is not the best path for macOS or Windows users. It also changes many files at once, which can
make mistakes harder to find. If the script fails, it may leave a partially modified tree; review
the Git diff before continuing.

Before publishing, run the plugin locally. A useful smoke test is to build the container image and
run the command with temporary input and output directories. The command should accept the expected
arguments, produce output files, and return a successful exit code.

## GitHub Actions and Publication

The template includes a GitHub Actions workflow at `.github/workflows/ci.yml`. By default, parts of
the workflow are disabled with `if: false` guards. `bootstrap.sh` can remove those guards for you,
or you can edit the workflow manually.

The test job builds the Docker image and runs `pytest` inside the container. This should work for
most GitHub repositories once Actions are enabled.

The build and publish job has more prerequisites. It can push images to Docker Hub and GitHub
Container Registry. Publishing to Docker Hub requires repository or organization secrets named
`DOCKERHUB_USERNAME` and `DOCKERHUB_PASSWORD`. Publishing to GitHub Container Registry uses the
repository's `GITHUB_TOKEN`, but the repository and package permissions still need to allow package
publication.

Automatic upload to a _ChRIS_ backend is the most environment-specific part. The template workflow
uses `FNNDSC/upload-chris-plugin`, targets `https://cube.chrisproject.org/api/v1/`, and expects
secrets named `CHRISPROJECT_USERNAME` and `CHRISPROJECT_PASSWORD`. It also assumes a configured
compute name, currently `NERC` in the template workflow. These defaults are most likely to work
seamlessly for repositories under the FNNDSC GitHub organization, where organization-level secrets
and publication policy may already be configured. Contributors working in personal repositories or
other organizations should expect to configure their own secrets, registry permissions, CUBE URL,
and compute names.

The workflow publishes on Git tags that look like semantic versions, such as `v1.2.3`. A normal push
to `main` can build and push a `latest` image if the build job is enabled, but plugin upload is tied
to a version tag. Review `.github/workflows/ci.yml` before relying on automatic publication.

## ChRIS Registration

Registration is the step that makes a published container image visible to a _ChRIS_ instance. For
Python plugins, metadata can be generated with `chris_plugin_info`, which reads the decorated plugin
entry point and emits the JSON description used by the backend.

The upload workflow requires credentials for a staff/admin-capable _ChRIS_ account and at least one
compute resource name available on the target CUBE instance. If those prerequisites are not available,
use the manual [plugin upload workflow](../tutorials/upload_plugin/) or ask the administrator of the
target _ChRIS_ deployment how plugins should be registered.

## Existing Template and Factory Status

_ChRIS_ has a current Python template: [`python-chrisapp-template`](https://github.com/FNNDSC/python-chrisapp-template). Older tooling such as [`cookiecutter-chrisapp`](https://github.com/FNNDSC/cookiecutter-chrisapp) and [`chrisapp`](https://github.com/FNNDSC/chrisapp) is historical context and should not be the default recommendation for new contributors.

_ChRIS_ does not yet have a production plugin factory. `pf_build` is a proof of concept that collects plugin metadata through a web form, creates a GitHub repository from `python-chrisapp-template`, runs the template bootstrap path, and commits the result. This demonstrates the desired automation model, but it is not yet a schema-driven factory.

## What Remains Manual

Until a production factory exists, new plugin authors still need to understand and edit several project surfaces:

- Python packaging metadata
- Dockerfile and container image name
- command entry point
- GitHub Actions secrets and publication policy
- ChRIS metadata generation
- ChRIS backend/plugin store registration

This is the main onboarding gap for new contributors. The desired factory should make these values derive from one project specification instead of requiring repeated edits in multiple files.


## Future: Plugin Factory

The long-term goal is a plugin factory: a web or local tool that creates a working plugin repository from one project specification. A contributor would provide the plugin name, command name, plugin type, package layout, dependencies, container image target, supported architectures, GitHub repository target, and publication intent. The factory would then generate the source tree, Python packaging metadata, Dockerfile, tests, README, GitHub Actions, and registration guidance from the same source of truth.

A factory should reduce repeated manual edits, keep Docker and Python packaging in agreement, and support both simple single-file plugins and larger package-style plugins. It should also leave room for non-Python plugins by preserving the outer _ChRIS_ contract: a container image, a command-line interface, declared parameters, and metadata that can be registered with a _ChRIS_ backend.

## Related Pages

- [Plugin concepts](./)
- [GitHub Actions for plugins](./github_actions.md)
- [Multi-architecture images](./multiarch.md)
- [Convert an existing Python app](../tutorials/convert_python_app.md)
- [Upload a plugin](../tutorials/upload_plugin/)
