# infra

What `chrisproject.org` runs on, as scripts a [mise](https://github.com/HARBOR-Medical-AI/mise) stratus session plays.

- `store.mise`: the ChRIS store at `cube.chrisproject.org`, the CUBE every plugin's upload job registers with (`compute_names: NERC`). A network and a VM on Oracle Cloud, CUBE 6.11.0 on it, porter (the door to mise, ARGUS in the browser) beside it at `porter.chrisproject.org`, and both names pointed at it at GoDaddy.

The VM is 2 vCPU and 8 GiB. Each person signed in through porter runs a session of a few hundred MB beside CUBE; when that outgrows 8 GiB, raise `--memory` on the `vm new` line (16 GiB is about $12 a month more) and play the script again: the machine is rebuilt over the same data volume and address.

A script states what should exist. Played again, each line compares: unchanged lines do nothing, and anything that would build, change or bill asks first.
