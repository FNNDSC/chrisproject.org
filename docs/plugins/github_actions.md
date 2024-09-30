# GitHub Actions

**GitHub Actions** provides *continuous integration*, which can
automatically test, build, and publish your _ChRIS_ plugin.

<details>
<summary>What is <em>continuous integration</em>?</summary>

Continuous integration is the practice of automating development
and operations (_devops_) by testing, building, and redeploying
your code whenever you push to GitHub.

</details>

## General Background

[*DockerHub*](https://hub.docker.com/) (`docker.io`) and the [*GitHub Container Registry*](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
(`ghcr.io`) are container registries, which is where built container images are saved.

_ChRIS_ plugins are uploaded to a container registry, while their metadata
are uploaded to a _ChRIS_ backend. When you run a plugin on _ChRIS_,
the backend pulls the plugin image from the container registry.

## Developer's Workflow

The developer's workflow using CI looks like:

1.  Write code.
2.  `git push`
3.  `git tag vX.Y.Z && git push --tags`

After these human-made actions (push or created release), a chain of
automatic steps execute to build, test, and publish your software.
Additionally, pull requests can be automatically tested too
(however pull requests do _not_ get published until they are merged and tagged).

## Repository Settings

Your GitHub repository settings should define the following secrets. For
help, see https://docs.github.com/en/actions/reference/encrypted-secrets

:::tip

use organization level secrets. If your repository lives under
https://github.com/FNNDSC, there is nothing you need to do.

:::

| Secret Name             | Description                                                  |
|-------------------------|--------------------------------------------------------------|
| `DOCKERHUB_USERNAME`    | DockerHub username                                           |
| `DOCKERHUB_PASSWORD`    | DockerHub password                                           |
| `CHRISPROJECT_USERNAME` | Admin username for https://cube.chrisprojet.org/chris-admin/ | 
| `CHRISPROJECT_PASSWORD` | Admin password for https://cube.chrisprojet.org/chris-admin/ | 

# Use CI

[python-chrisapp-template](https://github.com/FNNDSC/python-chrisapp-template)
provides the file
[`.github/workflows/ci.yml`](https://github.com/FNNDSC/python-chrisapp-template/blob/main/.github/workflows/ci.yml)
which defines the instructions for *Github Actions*. It is important to
read and understand this file before using CI.
