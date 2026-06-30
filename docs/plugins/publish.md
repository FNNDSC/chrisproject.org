# ChRIS Plugin Development & Registration Workflow

**Author:** `Sandip Samal`
**Date:** 2026-06-12
**Repos:** [cookiecutter-chrisapp](https://github.com/FNNDSC/cookiecutter-chrisapp) · [python-chrisapp-template](https://github.com/FNNDSC/python-chrisapp-template)

---

## 1. Summary

The ChRIS plugin ecosystem provides two paths for scaffolding Python plugins (`cookiecutter-chrisapp` and `python-chrisapp-template`) and five distinct mechanisms for registering plugins to a running CUBE instance, ranging from manual CLI tools to automated GitHub Actions. The primary consumers are scientific software developers building medical imaging analysis tools for the ChRIS platform. Documentation is spread across multiple GitHub repos, the chrisproject.org site, and implicit institutional knowledge, with no single authoritative source covering the full develop-to-register lifecycle.

---

## 2. Inventory

| Location | Type | Last updated | Authoritative? |
|---|---|---|---|
| `cookiecutter-chrisapp` `README.md` | Overview / scaffolding guide | ~2020 (stale) | No — superseded |
| `python-chrisapp-template` `README.md` | Quickstart + template usage | Active (144 commits) | Yes (for new plugins) |
| `python-chrisapp-template` `bootstrap.sh` | Inline comments / usage | Active | Partial |
| `.github/workflows/ci.yml` (template) | GHA pipeline — inline comments | Active | Yes (for CI/CD) |
| `plugin2cube` PyPI page / README | CLI tool reference | Unknown (broken tool) | No |
| `chrisproject.org` | General ChRIS docs | Unknown | Partial |
| `chrisomatic.yml` (referenced in usage) | Local dev config format | Unknown | Partial (local only) |
| `chili` repo | CLI registration tool | Under construction | No |

---

## 3. Coverage

**Purpose & scope — Partial**
`python-chrisapp-template` README explains what a ChRIS plugin is and the basic `commandname inputdir/ outputdir/` contract. No single document describes the full lifecycle (scaffold → build → register → release). The distinction between `cookiecutter-chrisapp` (deprecated) and `python-chrisapp-template` (current) is not clearly communicated anywhere; a new user searching GitHub will find both without guidance on which to use.

**Local setup & run — Partial**
The template README covers cloning and running `bootstrap.sh`. It does not cover `uv`-based workflows, migration of existing Python projects into the ChRIS plugin format, or how to adapt an existing `Dockerfile` to be ChRIS-compatible. These are known pain points with no documented resolution.

**Architecture — Missing**
No document explains the CUBE backend, what the plugin JSON representation is, how CUBE discovers and executes plugins, or how the `commandname` maps to the container entrypoint. The meaning and source of `commandname` confusion is undocumented and only surfaced as a known pain point.

**API / interface reference — Partial**
The `chris-admin` Django REST API endpoint for plugin registration is mentioned as a prerequisite path but has no standalone reference doc. The plugin JSON representation format is referenced but not documented in the template repo.

**Deployment & operations — Partial**
The GHA workflow in `python-chrisapp-template` automates build and push to `chrisstore.co` / `cube.chrisproject.org`. The preconditions to trigger a release (tag format, secrets required, what "successful build" means) are not clearly spelled out. Only one target (`cube.chrisproject.org`) is supported by GHA; registering to other CUBE instances is undocumented end-to-end.

**Testing — Partial**
A `tests/` directory and `pytest` are present in the template. There is no documented guidance on what to test, how to run tests locally, or what the CI test step validates.

**Contribution guidelines — Missing**
Neither repo documents branching strategy, PR process, or coding style for contributors to the template itself. Plugin authors working from the template also lack guidance on how to structure their own contributions.

**Security & compliance — Missing**
No documentation on secrets management for GHA (e.g., `CUBE_URL`, `CUBE_USERNAME`, `CUBE_PASSWORD`), image signing, or any compliance considerations for medical imaging software.

**Onboarding — Missing**
A new engineer cannot get productive from docs alone. The template README covers the absolute minimum. There is no end-to-end walkthrough that takes a user from "I have a Python script" to "my plugin is registered and running in ChRIS." The five registration paths are entirely undocumented as a coherent guide.

---

## 4. Issues

- **`cookiecutter-chrisapp` is not formally deprecated.** It remains publicly visible on GitHub with no deprecation notice, no redirect, and no pinned issue pointing to `python-chrisapp-template`. New users will find it and attempt to use it.

- **`plugin2cube` is broken and still listed as the primary CLI registration tool.** `pip install plugin2cube` is documented as the install command but the tool is broken with no error guidance, no known workaround, and no timeline for replacement by `chili`.

- **`commandname` is undefined in all docs.** Users encounter this term when building plugins and wiring up the Dockerfile entrypoint, but no document explains what it is, where it must match, and what happens if it doesn't.

- **No `uv` migration guide exists.** The template uses `setup.py` / `requirements.txt`. There is no documented path for projects already using `uv` to adopt the ChRIS plugin structure, nor guidance on whether `pyproject.toml` is supported.

- **Dockerfile adaptation for ChRIS is undocumented.** Users with existing Dockerfiles have no reference for what structural changes (entrypoint format, label requirements, etc.) make a container ChRIS-compatible.

- **GHA release preconditions are opaque.** The workflow fires on tag push, but the required tag format, which GitHub secrets must be pre-configured, and how to set up the CUBE credentials are not documented.

- **GHA only targets `cube.chrisproject.org`.** No documentation explains how to add additional CUBE targets or adapt the workflow for a self-hosted instance.

- **`chrisomatic.yml` has no standalone reference.** Its schema, required fields, and relationship to local miniChRIS setup are explained nowhere accessible to a new developer.

- **Plugin JSON representation format is undocumented.** The `chris-admin` API path requires a plugin JSON file, but no doc describes the schema, how to generate it, or where to find it for existing plugins.

- **Five registration paths with no decision guide.** `plugin2cube`, `chris-admin` REST API, `chrisomatic.yml`, `chili`, and GHA all exist with no document explaining when to use each, their trade-offs, or their current status (broken / production / experimental / automated).

---

## 5. Proposed Tasks


**1. Deprecate `cookiecutter-chrisapp` and redirect to `python-chrisapp-template`**
Why: Users find the old repo and waste time on an outdated scaffold. A deprecation notice and pinned redirect prevents this immediately.
Effort: S · Priority: P0

**2. Add end-to-end "New Plugin" guide covering scaffold → local test → register**
Why: No single doc exists covering the full lifecycle. This is the most critical onboarding gap.
Effort: L · Priority: P0

**3. Document `commandname`: what it is, where it must match, and common mistakes**
Why: Confirmed pain point causing repeated confusion; zero current documentation.
Effort: S · Priority: P0

**4. Write a registration path decision guide (when to use GHA vs `chili` vs `chris-admin` vs `chrisomatic`)**
Why: Five mechanisms exist with no guidance; new users default to the broken one (`plugin2cube`).
Effort: M · Priority: P0

**5. Mark `plugin2cube` as broken; document workaround or interim manual steps**
Why: It is the first tool encountered and does not work. No error guidance exists.
Effort: S · Priority: P0

**6. Write a `uv`-based migration guide for existing Python projects**
Why: Explicit known pain point; `uv` adoption is growing and `setup.py`-based docs are becoming a mismatch.
Effort: M · Priority: P1

**7. Document Dockerfile requirements for ChRIS compatibility**
Why: Existing project migrations fail here; no reference for entrypoint format, required labels, or image structure.
Effort: M · Priority: P1

**8. Document GHA release preconditions: tag format, required secrets, CUBE target configuration**
Why: GHA is the recommended automated path but its setup is undocumented; users cannot reproduce it for their own instances.
Effort: M · Priority: P1

**9. Publish `chrisomatic.yml` schema reference with local miniChRIS setup walkthrough**
Why: Local dev environment is completely undocumented for new contributors.
Effort: M · Priority: P1

**10. Document plugin JSON representation: schema, generation, and use with `chris-admin` API**
Why: Required for the `chris-admin` path; no schema or example exists in accessible docs.
Effort: S · Priority: P2

---

## 6. Open Questions

- **What is the intended state of `chili`?** Is it on a timeline to replace `plugin2cube` as the primary CLI registration tool? This determines whether to document `chili` now or maintain interim workarounds.

- **Is `plugin2cube` being actively fixed or abandoned?** If abandoned, the docs and PyPI package should be delisted; if being fixed, a timeline is needed.

- **Who owns the registration path decision?** `chrisomatic`, GHA, and `chris-admin` serve different environments (local, automated, production). Should there be one recommended path per context, or a unified tool?

- **Is `uv` / `pyproject.toml` an officially supported project structure?** If yes, the template should be updated; if no, that decision should be documented so contributors don't attempt it.

- **Should `cookiecutter-chrisapp` be archived or deleted?** Leaving it public causes ongoing confusion; a decision is needed before the deprecation notice can be finalized.

## Related Pages

- [Plugin concepts](./)
- [GitHub Actions for plugins](./github_actions.md)
- [Multi-architecture images](./multiarch.md)
- [Convert an existing Python app](../tutorials/convert_python_app.md)
- [Upload a plugin](../tutorials/upload_plugin/)