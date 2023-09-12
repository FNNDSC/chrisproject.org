# Website Hosting

Our domain names chrisproject.org, fnndsc.org, babymri.org, ... are purchased on GoDaddy.
GoDaddy is configured to use Inmotionhosting name servers. Domains are configured via cPanel,
which is part of Inmotionhosting.

:::caution

DNS and TLS are always tricky, I don't really understand how this stuff comes together.
Just fiddle around until it works! Then relax until it doesn't...

:::

## Domain Names

Domain names are managed at https://secure1.inmotionhosting.com, ask Rudolph for login credentials.
In general, what you want to do is to go into cPanel, "DNS Zone Editor" and then add CNAME records for
example.chrisproject.org → fnndsc.childrens.harvard.edu or router-default.apps.shift.nerc.mghpcc.org

## HTTPS

HTTPS is tricky because of the many combinations of domain name provider, hosting, HTTP server, ...

cPanel creates and renews for us certificates automatically. Historically, it's been easier to handle
certificates yourself by getting them from Let's Encrypt using whatever your hosting platform + HTTP
router supports. It kinda feels more proper to be using the certificates from cPanel, so that's what
we're going to do here. Private key and certificates are obtained from cPanel's GUI and then copy-pasted
into OpenShift's GUI.

On fnndsc.childrens.harvard.edu HTTPS certificates are mostly automated using Certbot however hosting
things on there is deprecated.

### What about cert-manager?

[`cert-manager`](https://cert-manager.io) is installed on NERC cluster-wide as an Operator, but I can't
figure out how to use it. The Issuer doesn't seem to work, I get this error with certificates:

> Issuing certificate as Secret does not exist

My guess is it's some problem about how the operator is working in a different workspace than from the
OpenShift project I'm trying to use it in.

### cPanel Tips and Tricks

Maybe I should automate certificate rotation? API token can be obtained from
https://secure312.inmotionhosting.com:2083/cpsess1817116534/frontend/jupiter/api_tokens/index.html#/
then you can get certificates programmatically, e.g.

```shell
xhs https://secure312.inmotionhosting.com:2083/cpsess9686500657/execute/SSL/list_certs \
    "Authorization: cpanel babymr5:$API_TOKEN_HERE" "Accept:application/json" \
    | jq '.data | map(select( (.is_self_signed == 0) and (.domains | contains(["app.chrisproject.org"])) and (.not_after > now) and (.not_before < now) ))'
```
