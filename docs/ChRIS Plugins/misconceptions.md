# Common Misconceptions

Some common misconceptions about terminology.

### It's not a "Docker container"

[Docker](https://docker.com) is a company which develops container-related software.
One of these software projects is the command-line `docker` program.
The `docker` command-line program is used to create container images
and run containers. However, it's only one such program which does so.
Alternatives to `docker` include [`podman`](https://podman.io),
[`apptainer`](https://apptainer.org), and [Kubernetes](https://kubernetes.io).
The vendor-neutral terms **container image** and **container** are preferred.

- A **container image** is a static package which can be used to run software reproducibly.
- A **container** is an instance of an **image**. A _running_ container is what crunches numbers.

You _build_ images and _run_ containers.

### Use [Apptainer](https://apptainer.org), Not Singularity

Singularity was an academic project. A for-profit company called Syslabs forked Singularity,
taking its name, and commercialized it. To clear up the confusion, the original Singularity
project was renamed to Apptainer.

https://apptainer.org/news/community-announcement-20211130/
