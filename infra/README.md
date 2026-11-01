# infra

What `chrisproject.org` runs on, as scripts a [mise](https://github.com/HARBOR-Medical-AI/mise) stratus session plays.

- `store.mise`: the ChRIS store at `cube.chrisproject.org`, the CUBE every plugin's upload job registers with (`compute_names: NERC`). A network and a VM on Oracle Cloud, CUBE 6.11.0 on it, and the name pointed at it at GoDaddy.

A script states what should exist. Played again, each line compares: unchanged lines do nothing, and anything that would build, change or bill asks first.
