---
title: Blazingly fast DICOM retrieval from PACS
authors: jennings
tags: [PACS, Rust, observability]
---

In this article, we share our experience, the pros and cons of incorporating Rust into
our mostly Python backend. The target audience are those with some awareness of Python's
shortcomings and are curious about how adopting Rust can play out for a small developer
team, especially one which targets deployment in cloud/Kubernetes environments.

<!--truncate-->

## Introduction

We are a computational research laboratory at the Boston Children's Hospital.
Our scientific operations center around the _ChRIS_ Research Integration System,
a platform we are building to bridge the gap between research and integration using
Linux container technologies.

Our backend code was written in 100% Python. While Python is a flexible and easy,
its performance and language conventions can be problematic when projects grow large.
Recently, we reworked one component of our backend and implemented the new version of
it in Rust.

All of our research and clinical workflows start with data retrieval from the hospital database.
The _oxidicom_ component of _ChRIS_ receives DICOM images from a hospital
database ([PACS](https://en.wikipedia.org/wiki/Picture_archiving_and_communication_system))
and stores them in the _ChRIS_ backend (_CUBE_). More technically, it implements the C-STORE
operation of the DIMSE network protocol.

:::tip

What's with the name "oxidicom?" In the rust community, "to oxidize" is slang for
introducing Rust to an existing project.

:::

_oxidicom_ is a rework of the most error-prone and performance-critical parts
of the interface between _CUBE_ and PACS. While its predecessor, PFDCM, was designed
to run as a stateful service targeting output to the filesystem, _oxidicom_ is designed
with "cloud-native" aspects by adhering to the
[twelve-factor app methodology](https://12factor.net/).
With the new architecture based on _oxidicom_ we achieved:

- easier deployment on Kubernetes and OpenShift
- horizontal scalability by individual microservice
- observability using the OpenTelemetry + Prometheus ecosystem
- massively improved performance (thus lower costs)

## The Advantages of the Rust Programming Language

_oxidicom_ is implemented in the Rust programming language, which is well-known for
its reliability and performance.

### Performance

Our first approach was to reimplement performance-critical parts of PFDCM without
reworking the dataflow. Our benchmarks showed the performance of our Rust implementation to be
[100-200 times faster than the original Python program](https://github.com/FNNDSC/pypx-listener/blob/74bc9d0519f2fa57dd27d4997fb78d91d7268685/README.md#blazingly-fast).

We later decided to rework more of the architecture, and thus _oxidicom_ was born.
With _oxidicom_ deployed in production, our
[Grafana dashboards](./2024-04-02-pacs-retrieve-observability/index.md#performance-dashboards)
are showing that its resource usage is practically negligible. Even at 32 threads, its CPU usage
peaks below 0.5 CPU seconds and its memory stays below 256 MiB. Unlike Python, Rust does not use a
[garbage collector (GC)](https://en.wikipedia.org/wiki/Garbage_collection_(computer_science)),
meaning memory is freed as soon as it is unused. Thus, Rust is able to keep memory usage
low, even when under high load. GC-ed languages such as Python continue to consume memory
and CPU even after finishing a computation, resulting in unpredictable memory usage and
worse performance when under load.

At idle, _oxidicom_ uses \<11 MiB of memory, whereas our Python-based apps tend to require
100-200 MiB of memory per thread. For these reasons,
**Rust is an advantageous language for cloud-native development**
because of the potential **cost-savings from low and predictable resource usage**.

### Reliability

Although it has been less than a week since deploying _oxidicom_ to production, it has already
processed 119,322 DICOM files (25.5 GiB) without a single error\*.

\*Well, that would be a lie. Usually, we find a bug on day 0 and need to release a version 1.0.1.
There was a silly oversight in _oxidicom's_ logic which was quick and easy to
[fix](https://github.com/FNNDSC/oxidicom/commit/ba2301dd3ae942b0b009cd500439074428d99f91#diff-24f3b978f9be3cf884d376f5eb57be2a312a55caa02c8307111d95b0285ae38a).

The only failures we are getting are HTTP request timeouts during _oxidicom_'s communication
to our Python Django backend. In other words, our Python backend cannot keep up with the speed of
the Rust-based _oxidicom_ component.

**There were no edge cases nor surprises.** Many of Rust's programming language design choices encourage
developers to think critically about _correctness_ when programming. For example, Rust's design has
these advantages over Python:

- Rust distinguishes between recoverable (the `Result` enum) and non-recoverable (panics) errors.
  All recoverable errors _must_ be handled, while non-recoverable errors must not. In this design,
  error handling is both more robust and easier to think about.
- The [Result](https://doc.rust-lang.org/std/result/enum.Result.html) type enum makes error handling
  a conscious choice of the developer. As a [monad](https://en.wikipedia.org/wiki/Monad_(functional_programming)),
  the control flow for error handling is decoupled from business logic.
- The Rust compiler catches more bugs at compile time rather than at runtime, primarily with type checking
  and borrow checking.

### Modern Features and Design

Rust features ware developed with lessons learned from history regarding what works and
what doesn't. For example, the `cargo` build system and package manager for Rust is well
praised. In contrast to Python, there is no agreement in the community for how to build
packages and manage dependencies — pip, setup.py, requirements.txt, conda, venv, virtualenv,
Poetry, hatch... It's complicated (in contradition to the language's own
[philosophies](https://peps.python.org/pep-0020/)).

Fun fact: Python's new pyproject.toml is inspired by Rust's Cargo.toml.
https://peps.python.org/pep-0518/#file-format

The praise for the Rust ecosystem's quality goes beyond officially supported tools such
as `cargo`. Rust community libraries, known as "crates," are renowned for high quality
and good design. The popular CLI argument parser [clap](https://lib.rs/crates/clap) has
better features than Python's [argparse](https://docs.python.org/3/library/argparse.html)
and even [Typer](https://typer.tiangolo.com/). Some crates such as [serde](https://serde.rs/)
have been cornerstones in the history of Rust's growth and evolution as a language.

## Challenges with Rust: The Ecosystem

While the crates ecosystem certainly deserves all of the praise, it is not without its problems.
Development of applications in Rust can be slowed down by two crucial issues with the crates
ecosystem: package maturity and ecosystem fragmentation.

### Ecosystem Maturity

A new Rust developer coming from Python or JavaScript might find it weird how mamny crates
are versioned 0.X.X.

dicom-rs v.s. pynetdicom

### Ecosystem Fragmentation

async v.s. sync

tokio v.s. other async runtimes

https://github.com/open-telemetry/opentelemetry-rust/issues/1571

### P.S. Rust is _not_ difficult!

- https://youtu.be/6mZRWFQRvmw?t=27012
- https://opensource.googleblog.com/2023/06/rust-fact-vs-fiction-5-insights-from-googles-rust-journey-2022.html
