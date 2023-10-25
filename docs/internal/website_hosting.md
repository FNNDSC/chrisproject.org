# Website Hosting

Our domain names chrisproject.org, fnndsc.org, babymri.org, ... are purchased on GoDaddy.
GoDaddy is configured to use Inmotionhosting name servers. Domains are configured via cPanel,
which is part of Inmotionhosting.

## Domain Names

Domain names are managed at https://secure1.inmotionhosting.com, ask Rudolph for login credentials.
In general, what you want to do is to go into cPanel, "DNS Zone Editor" and then add CNAME records for
`example.chrisproject.org` → `fnndsc.childrens.harvard.edu` or `router-default.apps.shift.nerc.mghpcc.org`

## Static Websites

Use [GitHub Pages](https://pages.github.com/). I recommend using the [Docusaurus](https://docusaurus.io/) framework.

## Hosting Web Apps

The best place to host web apps is on the NERC OpenShift.
To use HTTPS with custom domains on OpenShift, follow [this guide](nerc/https/index.md).
