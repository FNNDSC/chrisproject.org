---
title: Authentik LDAP Configuration
---

This is a guide on how to configure Authentik and _ChRIS_ for login using LDAP.

## Introduction

[Authentik](https://goauthentik.io/) is an open-source "identity provider" meaning it manages user accounts and security.
It can act as an LDAP server with an Authentik LDAP outpost. Using Authentik with _ChRIS_ is advantageous for the
featureful admin user interface Authentik provides for user and group management.

## Authentik Configuration

Set up LDAP by following this guide:
https://docs.goauthentik.io/docs/add-secure-apps/providers/ldap/generic_setup

It is also recommended to create a (password) "recovery" flow. E.g. use this
[blueprint](https://docs.goauthentik.io/docs/customize/blueprints/):
https://github.com/FNNDSC/NERC/blob/master/authentik-blueprints/recovery.yaml

## _ChRIS_ Configuration

Set the following environment variables:

```yaml
AUTH_LDAP: 'true'
AUTH_LDAP_SERVER_URI: 'ldap://ak-outpost-ldap:389'
AUTH_LDAP_BIND_DN: 'cn=ldapservice,ou=users,dc=example,dc=org'
AUTH_LDAP_BIND_PASSWORD: '**secret*app*password*of*ldapservice*service*account**'
AUTH_LDAP_USER_SEARCH_ROOT: 'ou=users,dc=example,dc=org'
AUTH_LDAP_GROUP_SEARCH_ROOT: 'dc=example,dc=org'
AUTH_LDAP_CHRIS_ADMIN_GROUP: 'chris-admin'

# Authentik usernames are exposed as the LDAP cn property
AUTH_LDAP_USER_SEARCH_FILTER: '(cn=%(user)s)'
# Workaround for https://github.com/goauthentik/authentik/issues/7522#issuecomment-2525303023
AUTH_LDAP_USER_FLAGS_BY_GROUP: ''
```

## Debugging

Enter a Python shell into any _ChRIS_ backend pod, e.g.

```shell
oc exec -it deploy/chris-server -- python -m manage.py shell
```

And try running these statements:

```python
import ldap
import os
l = ldap.initialize(os.getenv('AUTH_LDAP_SERVER_URI'))
l.simple_bind_s(os.getenv('AUTH_LDAP_BIND_DN'), os.getenv('AUTH_LDAP_BIND_PASSWORD'))
_, r = l.result(l.search(os.getenv('AUTH_LDAP_USER_SEARCH_ROOT'), ldap.SCOPE_SUBTREE, '(objectClass=user)', ['*']), 10)

for bn, user in r:
    print(f'{bn:<40s}{user["name"]}', flush=True)
```

