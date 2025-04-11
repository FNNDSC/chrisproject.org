---
title: "Debugging Django in Production on Kubernetes"
authors: jennings
tags: [Kubernetes]
---

Sometimes, you come across an edge case in production that is just not feasible to reproduce
in a development environment. Or, it's more convenient to forego best practices and debug
against the real user data.

Debugging in production is a bad practice, furthermore a Kubernetes environment can make
things even harder. But for whatever reason, sometimes you have to do what you have to do.
Here are some tips on how to debug a Django application in production on Kubernetes.

<!--truncate-->

## Background

Traditional Python applications are easy to debug because you can directly open and modify
both source code and vendor packages in a text editor. In Kubernetes, that is not possible
for several reasons:

- Text editors are not usually available inside a container, and it might not be possible
  to install one.
- A `securityContext` can prevent code from being edited by setting the container user to
  be underprivileged, or making the filesystem read-only.

## Debugging a Django Container

Here we will be debugging the [ChRIS backend](https://github.com/FNNDSC/ChRIS_ultron_backEnd),
though the overall instructions are the same for any Django + PostgreSQL application.

Django applications are typically deployed as a Kubernetes
[Deployment](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/),
so there may be more than one replica of the Django server. We need to select one
pod by running `kubectl get pod`. A better practice would be to select the pod by label:

```shell
kubectl get pods -n chris -l app.kubernetes.io/name=chris-server,app.kubernetes.io/instance=chris -o jsonpath='{.items[0].metadata.name}'
```

In the examples below, the namespace will be `chris` and the pod name will be `chris-server-6ff9684b7c-twmnp`.

Check which version of the application is running, and check out the source code for it:

```shell
git clone https://github.com/FNNDSC/ChRIS_ultron_backEnd.git
cd ChRIS_ultron_backEnd
git checkout v6.3.0-beta.7
```

In my local copy of the source code, I can add print statements and change whatever I want.
Next, I copy the modified source code into the container:

```shell
kubectl cp chris_backend chris/chris-server-6ff9684b7c-twmnp:/tmp -c server
```

To run the modified code for debugging, first I open an interactive shell in the container:

```shell
kubectl exec -it -n chris chris-server-6ff9684b7c-twmnp -- bash
```

And I run a development server inside the container shell:

```shell
cd /tmp/chris_backend
python manage.py runserver 0.0.0.0:8888
```

:::note

The `runserver` command starts a _development_ server (with features such as live-reloading)
but using the production configuration (from the container's environment variables, which
connects the _development_ server to the _production_ database).

:::

The development server running out of `/tmp/chris_backend` can be interacted with from my
local computer using my preferred development tools using `kubectl port-forward`, e.g.

```shell
kubectl port-forward -n chris pod/chris-server-6ff9684b7c-twmnp 8888:8888
```

Now I can make ordinary HTTP requests from my local computer, to the development server
running in the container in the production Kubernetes cluster:

```shell
xh :8888/api/v1/
```

:::tip

[xh](https://github.com/ducaale/xh) is a command-line tool for sending HTTP requests.
It has the same usage as [httpie](https://httpie.io/) and is much more convenient than
[curl](https://curl.se/).

:::

More changes to the source code can be done easily by editing the files locally then
re-running the `kubectl cp` command from above. The `python manage.py runserver` command
is a live-reloading development server, so updates are automatic.

## Troubleshooting SQL Queries

Let's investigate a Django QuerySet which is causing timeouts. First, I need a Django
management shell:

```shell
kubectl exec -it -n chris deploy/chris-server -c server -- python manage.py shell
```

In the Django shell, I copy the code to construct the QuerySet, e.g.

```python
from django.contrib.auth.models import User

qs = User.objects.filter(username='rudolph')
print(qs.query)
```

The code above prints the SQL query for getting a user with the name "rudolph".
We can copy-and-paste the query into an interactive `psql` REPL for troubleshooting.
To use `psql`, get the database's connection URI from its Kubernetes secret.
This is easy to do when using
[Bitnami's `bitnami/postgresql` Helm chart](https://github.com/bitnami/charts/tree/main/bitnami/postgresql)
where the `serviceBindings.enabled` value is set as `true`:

```shell
kubectl exec -it -n chris chris-postgresql-0 -- psql "$(kubectl get secret -n chris chris-postgresql-svcbind-custo
m-user -o jsonpath='{.data.uri}' | base64 -d)"
```

