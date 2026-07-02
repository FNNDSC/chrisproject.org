# ChRIS Plugin Development & Registration Workflow

**Author:** `Sandip Samal`
**Date:** 2026-07-01
**Repos:** [cookiecutter-chrisapp](https://github.com/FNNDSC/cookiecutter-chrisapp) · [python-chrisapp-template](https://github.com/FNNDSC/python-chrisapp-template) · [upload-chris-plugin](https://github.com/FNNDSC/upload-chris-plugin) · [CHRIS_docs](https://github.com/FNNDSC/CHRIS_docs)

---

## 1. Summary

The ChRIS plugin ecosystem provides two paths for scaffolding Python plugins (`cookiecutter-chrisapp` and `python-chrisapp-template`) and five distinct mechanisms for registering plugins to a running CUBE instance, ranging from manual CLI tools to automated GitHub Actions. The primary consumers are scientific software developers building medical imaging analysis tools for the ChRIS platform. Documentation is spread across multiple GitHub repos, the chrisproject.org site, and implicit institutional knowledge, with no single authoritative source covering the full develop-to-register lifecycle from the template repos themselves — though a chrisproject.org tutorial pairing covers plugin authoring (`chris_plugin`, `argparse`, `setup.py`, `Dockerfile`, `chris_plugin_info`) and plugin upload (all five registration paths) end to end.

---

## 2. Inventory

| Location | Type | Last updated | Authoritative? |
|---|---|---|---|
| `cookiecutter-chrisapp` `README.md` | Overview / scaffolding guide | ~2020 (stale) | No — superseded |
| `python-chrisapp-template` `README.md` | Quickstart + template usage | Active (144 commits) | Yes (for new plugins) |
| `python-chrisapp-template` `bootstrap.sh` | Inline comments / usage | Active | Partial |
| `.github/workflows/ci.yml` (template) | GHA pipeline — inline comments | Active | Yes (for CI/CD) |
| `plugin2cube` PyPI page / README | CLI tool reference | Unknown | No |
| `chrisproject.org` | General ChRIS docs | Unknown | Partial |
| `chrisproject.org` tutorial — "Build a plugin" | Step-by-step Python-plugin authoring guide: install `chris_plugin`, use `argparse`, add a decorated `main`, customize `setup.py`, write a `Dockerfile`, generate a description with `chris_plugin_info` | Unknown | Yes (for Python plugin authoring) |
| `chrisproject.org` tutorial — "Upload a plugin" | Registration guide covering the Django Dashboard, `chris-admin` API, `chrisomatic` bulk upload, automatic upload via GitHub Actions, and `plugin2cube` | Unknown | Yes (for registration) |
| `FNNDSC/upload-chris-plugin` README + `action.yml` | GitHub Action reference (inputs, secrets, `chris_url` override, testing) | Active | Yes (for GHA) |
| `FNNDSC/CHRIS_docs` — `ChRIS_Plugins.adoc` | Formal plugin spec incl. JSON representation schema | Unknown | Yes (canonical spec) |
| `chrisomatic.yml` (referenced in usage) | Local dev config format — minimal working example available | Unknown | Partial (local only) |
| `chili` repo | CLI registration tool | Under construction | No |

---

## 3. Coverage

**Purpose & scope — Partial**
The "ChRIS Plugins" overview explains what a plugin is (a container image with a command in the form `commandname [--optional-args values...] /path/to/inputs /path/to/outputs`), and describes the three plugin types:
- **`ds`** (data synthesis) — processes input files, writes output files. Example: [pl-infantfs](https://github.com/FNNDSC/pl-infantfs), which takes a NIFTI file and produces brain segmentation/surface files.
- **`fs`** (feed synthesis) — creates data without input files. Examples: [pl-create_tetra](https://github.com/FNNDSC/pl-create_tetra) (generates a sphere polygonal mesh) and [pl-rclone-copy-template](https://github.com/FNNDSC/pl-rclone-copy-template) (pulls data from SFTP servers).
- **`ts`** (topology synthesis) — special-case plugins tied directly to the ChRIS backend API; not usually created by community developers, hard-coded into [ChRIS_ultron_backEnd](https://github.com/FNNDSC/ChRIS_ultron_backEnd).

For a technical description, the canonical spec is [ChRIS_Plugins.adoc](https://github.com/FNNDSC/CHRIS_docs/blob/master/specs/ChRIS_Plugins.adoc). The distinction between `cookiecutter-chrisapp` (deprecated) and `python-chrisapp-template` (current) is still not clearly communicated anywhere; a new user searching GitHub will find both without guidance on which to use.

**Local setup & run — Partial**
The template README covers cloning and running `bootstrap.sh`. The build-a-plugin tutorial adds a concrete Dockerfile example:

```dockerfile
FROM python:3.10
WORKDIR /usr/local/src
COPY . .
RUN pip install .
CMD ["my_command", "--help"]
```

It does not cover `uv`-based workflows, migration of existing Python projects into the ChRIS plugin format, or how to adapt an *existing* Dockerfile (multi-stage builds, base image constraints, required labels) to be ChRIS-compatible.

**Architecture — Partial**
The plugin JSON representation is generated via the `chris_plugin_info` command (provided by the `chris_plugin` package) and formally specified in `ChRIS_Plugins.adoc`. The `commandname` mechanism is now traceable end-to-end: the `console_scripts` entry point name declared in `setup.py`'s `entry_points` must match the command invoked in the Dockerfile's `CMD`, and that's the name CUBE executes. What's still undocumented is how CUBE's backend actually discovers and schedules plugin execution beyond that contract, and any further detail on `ts`-type plugins.

**API / interface reference — Partial**
The `chris-admin` API is documented with working examples. To upload a JSON description file and register it to compute resources `cluster1` and `cluster2`:

```bash
curl -u "$username:$password" https://cube.chrisproject.org/chris-admin/api/v1/ \
    -H 'Accept: application/json' \
    -F fname=@description.json \
    -F compute_names=cluster1,cluster2
```

To register a plugin by URL from another ChRIS instance instead:

```bash
curl -u "$username:$password" https://cube.chrisproject.org/chris-admin/api/v1/ \
    -H 'Accept: application/json' \
    -H 'Content-Type: application/json' \
    --data '{"plugin_store_url": "https://cube.example.org/api/v1/plugins/19/", "compute_names": "cluster1,cluster2"}'
```

The plugin JSON schema is linked to its canonical spec (`ChRIS_Plugins.adoc`). A JSON description for a Python-based plugin container can also be generated directly from a running image:

```bash
docker run --rm -it fnndsc/pl-example:1.2.3 chris_plugin_info -d fnndsc/pl-example:1.2.3 > description.json
```

No standalone reference doc for this API lives in either scaffolding repo — it's all on `chrisproject.org`.

**Deployment & operations — Partial**
The GHA workflow (via the [upload-chris-plugin](https://github.com/FNNDSC/upload-chris-plugin) Action) triggers on any tag push:

```yaml
on:
  push:
    tags: [ '**' ]
```

The description can be supplied one of three ways: as a JSON string (`description_json`), as a path to a file (`description_file`), or automatically from a Python-based plugin using `chris_plugin>=0.3.0` (via `dock_image`). Required inputs are `username` and `password`; the target CUBE defaults to `https://cube.chrisproject.org/api/v1/` but is overridable via `chris_url`. Repository secrets referenced for this pipeline include `DOCKERHUB_USERNAME`, `DOCKERHUB_PASSWORD`, `CHRISPROJECT_USERNAME`, and `CHRISPROJECT_PASSWORD` (organization-level secrets are used automatically for repos under the `FNNDSC` org). Further configuration is in [action.yml](https://github.com/FNNDSC/upload-chris-plugin/blob/main/action.yml).

**Testing — Partial**
A `tests/` directory and `pytest` are present in the template. For the `upload-chris-plugin` Action itself, tests are run by rebuilding the image with dev dependencies and running `pytest` inside it:

```shell
docker build -t localhost/fnndsc/pl-appname:dev --build-arg extras_require=dev .
docker run --rm -it localhost/fnndsc/pl-appname:dev pytest
```

There is no documented guidance on what plugin authors should test in their own `tests/` directory, or what the CI test step validates.

**Contribution guidelines — Missing**
Neither repo documents branching strategy, PR process, or coding style for contributors to the template itself. Plugin authors working from the template also lack guidance on how to structure their own contributions.

**Security & compliance — Partial**
Only "staff" user accounts may upload plugins to a CUBE instance. GitHub Actions secrets for the upload pipeline are named in the Repository Settings table below. No documentation covers image signing or other compliance considerations for medical imaging software.

| Secret Name | Description |
|---|---|
| `DOCKERHUB_USERNAME` | DockerHub username |
| `DOCKERHUB_PASSWORD` | DockerHub password |
| `CHRISPROJECT_USERNAME` | Admin username for `https://cube.chrisproject.org/chris-admin/` |
| `CHRISPROJECT_PASSWORD` | Admin password for `https://cube.chrisproject.org/chris-admin/` |

**Onboarding — Partial**
The build-a-plugin and upload-a-plugin tutorials together form an end-to-end path: scaffold a `main` function decorated with `@chris_plugin`, wire up `setup.py` entry points, write a Dockerfile, generate a description with `chris_plugin_info`, and register it via one of five paths. Neither template repo's README links to these tutorials yet, so a user starting from `python-chrisapp-template` won't discover them without already knowing where to look.

---

## 4. Issues

- **`cookiecutter-chrisapp` is not formally deprecated.** It remains publicly visible on GitHub with no deprecation notice, no redirect, and no pinned issue pointing to `python-chrisapp-template`. New users will find it and attempt to use it.

- **`plugin2cube` is not officially supported.** It's documented as a "non-canonical" method: a Python helper script that registers a plugin by speaking directly to the CUBE API. It requires CUBE admin username/password, knowledge of the target CUBE's compute environments, and a host with `docker` installed. Example usage:

```bash
plugin2cube --CUBEurl http://rc-live.tch.harvard.edu:32222/api/v1/ \
            --CUBEuser XXXXXX --CUBEpasswd  XXXXXX                 \
            --computenames galena-avx --dock_image ghcr.io/fnndsc/pl-dicom_repack:1.1.4
```

- **`commandname` is defined in the "ChRIS Plugins" overview and build-a-plugin tutorial, but not in the template repo.** The `console_scripts` entry point name in `setup.py` must match the command invoked in the Dockerfile's `CMD` — that's the `commandname` CUBE executes. `python-chrisapp-template`'s own README doesn't explain this link.

- **No `uv` migration guide exists.** The template and tutorials use `setup.py` / `requirements.txt`. There is no documented path for projects already using `uv` to adopt the ChRIS plugin structure, nor guidance on whether `pyproject.toml` is supported.

- **Dockerfile adaptation for existing projects is undocumented.** A minimal working Dockerfile is now shown for greenfield plugins, but users with existing Dockerfiles have no reference for what structural changes (entrypoint format, label requirements, etc.) make a container ChRIS-compatible.

- **The GHA secrets table doesn't map explicitly to the Action's inputs.** The Repository Settings table lists `DOCKERHUB_USERNAME`, `DOCKERHUB_PASSWORD`, `CHRISPROJECT_USERNAME`, `CHRISPROJECT_PASSWORD` as required repo secrets, but the Action's quick example consumes `username`, `password`, and `chris_url` as `with:` inputs. No single example shows the `${{ secrets.* }}` references tying the two together.

- **`chrisomatic.yml` has a minimal working example but no full schema reference.**

```yaml
# chrisomatic.yml
version: 1.2

on:
  cube_url: http://localhost:8000/api/v1/
  chris_superuser:
    username: chris
    password: chris1234

cube:
  compute_resource:
    - name: host
      url: http://localhost:5005/api/v1/
      innetwork: true
  plugins:
    - pl-dircopy
    - pl-tsdircopy
    - pl-topologicalcopy
```

Its schema, optional fields, validation rules, and full relationship to a local miniChRIS setup are still not documented in one place.

- **Five registration paths exist, now enumerated in the "Upload a plugin" tutorial, but without a decision guide.** The tutorial covers, in order: the Django Dashboard (upload a plugin from one ChRIS instance to another, via `chris-admin`), the `chris-admin` REST API (JSON file or URL), bulk upload via `chrisomatic`, automatic upload via GitHub Actions, and the non-canonical `plugin2cube`. It does not compare them or recommend a default per use case.

- **Only "staff" user accounts may upload plugins**, and a CUBE must have compute resources configured (via `chrisomatic` or the Django Dashboard) before plugins can be registered to it — both are documented as prerequisites in the upload tutorial but not surfaced anywhere else.

---

## 5. Proposed Tasks

**1. Deprecate `cookiecutter-chrisapp` and redirect to `python-chrisapp-template`**
Why: Users find the old repo and waste time on an outdated scaffold. A deprecation notice and pinned redirect prevents this immediately.
Effort: S · Priority: P0

**2. Link the "Build a plugin" and "Upload a plugin" chrisproject.org tutorials from both template repo READMEs**
Why: The end-to-end lifecycle guide already exists on chrisproject.org; the gap is that neither template repo points to it.
Effort: S · Priority: P0

**3. Turn the "Upload a plugin" tutorial's five methods into a decision guide (trade-offs, current status, recommended default per environment)**
Why: All five paths are now enumerated in one place but with no guidance on which to use when.
Effort: M · Priority: P0

**4. Publish a complete, worked GHA example showing repo secrets mapped to the Action's `username`/`password`/`chris_url` inputs**
Why: The secrets table and the Action's documented inputs currently don't show how they connect.
Effort: S · Priority: P1

**5. Write a `uv`-based migration guide for existing Python projects**
Why: Explicit known pain point; `uv` adoption is growing and `setup.py`-based docs are becoming a mismatch.
Effort: M · Priority: P1

**6. Document Dockerfile requirements for adapting an existing project's Dockerfile**
Why: Migrating an existing Dockerfile into ChRIS-compatible form is not documented.
Effort: M · Priority: P1

**7. Expand `chrisomatic.yml` into a full schema reference with a local miniChRIS setup walkthrough**
Why: A minimal working example now exists; optional fields and validation behavior still need documenting.
Effort: M · Priority: P1


---

## 6. Open Questions

- **What is the intended state of `chili`?** Is it on a timeline to replace `plugin2cube` as the primary CLI registration tool? This determines whether to document `chili` now or maintain interim workarounds.

- **Who owns the registration path decision?** `chrisomatic`, GHA, `chris-admin`, the Django Dashboard, and `plugin2cube` serve different environments (local, automated, production, ad hoc). Should there be one recommended path per context, or a unified tool?

- **Is `uv` / `pyproject.toml` an officially supported project structure?** If yes, the template should be updated; if no, that decision should be documented so contributors don't attempt it.

- **Should `cookiecutter-chrisapp` be archived or deleted?** Leaving it public causes ongoing confusion; a decision is needed before the deprecation notice can be finalized.

## Related Pages

- [Plugin concepts](./)
- [GitHub Actions for plugins](./github_actions.md)
- [Multi-architecture images](./multiarch.md)
- [Convert an existing Python app](../tutorials/convert_python_app.md)
- [Upload a plugin](../tutorials/upload_plugin/)
- [Build a plugin from scratch](../tutorials/)
- [ChRIS_Plugins spec](https://github.com/FNNDSC/CHRIS_docs/blob/master/specs/ChRIS_Plugins.adoc)
- [upload-chris-plugin Action](https://github.com/FNNDSC/upload-chris-plugin)