# Multi-Arch Images

Here are some tips and tricks for building multi-architectural container images.

## Use Micromamba or Pixi

Many common packages, including Python packages, are cross-compiled for conda.

Example: https://github.com/FNNDSC/pl-fetal-surface-extract/blob/5a966810def2f04785bc7aafb1dbb1fe6d4dd6d5/Dockerfile https://github.com/FNNDSC/pfcon/pulls?q=is:pr%20is:closed

For PowerPC Power 9 (ppc64le), try out the [Open-CE](https://github.com/open-ce/open-ce) and [RocketCE](https://community.ibm.com/community/user/powerdeveloper/blogs/sebastian-lehrig/2024/02/08/rocketce) conda channels.


