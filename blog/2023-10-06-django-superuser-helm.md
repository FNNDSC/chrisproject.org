---
title: Django Superuser Creation using Helm
authors: jennings
tags: [backend, kubernetes]
---

Creating the superuser of a Django-based application is usually done by running the command
`manage.py createsuperuser`, hence it requires shell access. This makes sense as shell access
implies the person should also have admin privileges. However, shell access can be clunky
(think of how to run something in a container, `kubectl get pods -n chris && kubectl exec -it -n chris <pod_name> python manage.py createsuperuser`...).
We would prefer a declarative approach.

<!--truncate-->

In production, _ChRIS_ is deployed using [Helm](https://helm.sh/). Our Helm chart has a feature
for automatically creating the superuser.

https://github.com/FNNDSC/charts/pull/2

## Configuration

The superuser's username and password can be configured by values. That means either creating a
`values.yaml` file containing

```yaml
chris_admin:
  username: admin
  password: chris1234
```

or by passing the values via command-line arguments:

```shell
helm upgrade --install --set chris_admin.username=admin --set chris_admin.password=chris1234 chris fnndsc/chris
```

The default superuser username is `khris`. If unspecified, the chart will either:

1. If a password was set by a previous release, reuse the same password 
2. Randomly generate a password and save it as a Kubernetes Secret

After running `helm install` or `helm upgrade`, a copy-pastable command for reading the password is printed out:

```
NAME: khris
LAST DEPLOYED: Thu Oct  5 08:44:41 2023
NAMESPACE: chris
STATUS: deployed
REVISION: 1
NOTES:
The ChRIS backend is being deployed. Please wait for it to be ready.
You can run this command to block while the server is starting up:

    kubectl wait --for=condition=ready pod -n chris -l app.kubernetes.io/instance=khris-heart --timeout=300s

After that, try logging in as the admin user. The username is "khris".
The password can be revealed by running the command

    kubectl get secret -n chris khris-chris-superuser -o jsonpath='{.data.password}' | base64 --decode
```

## Creating the User using an initContainer

`initContainers` are defined to create the superuser during application startup.

https://github.com/FNNDSC/charts/pull/2/files#diff-5ae1708e2a54ff96752691d3e98d17706ee3fdb840e9c89ad5305d77f666cad6R36-R86

```yaml
initContainers:
- name: wait-db
  image: docker.io/bitnami/postgresql:16.0.0-debian-11-r3
  imagePullPolicy: IfNotPresent
  command:
  - /bin/sh
  - -c
  - until pg_isready -U postgres -h {{ .Release.Name }}-postgresql -p 5432; do sleep 1; done
  # envFrom: not shown
- name: migratedb
  command: ["python", "manage.py", "migrate", "--noinput"]
  # envFrom: not shown
- name: create-superuser
  command:
  - python
  - manage.py
  - shell
  - -c
  - |
    import os
    from django.contrib.auth.models import User
    user_config = {
        'username': os.environ['CHRIS_SUPERUSER_USERNAME'],
        'password': os.environ['CHRIS_SUPERUSER_PASSWORD'],
        'email': os.environ['CHRIS_SUPERUSER_EMAIL']
    }
    if (existing_user := User.objects.filter(username=user_config['username']).first()) is not None:
        existing_user.set_password(user_config['password'])
        existing_user.save()
        print(f'Updated password for user "{existing_user.username}"')
    else:
        created_user = User.objects.create_superuser(**user_config)
        print(f'Created superuser "{created_user.username}"')
  env:
  - name: CHRIS_SUPERUSER_USERNAME
    valueFrom:
      secretKeyRef:
        name: {{ .Release.Name }}-chris-superuser
        key: username
  - name: CHRIS_SUPERUSER_PASSWORD
    valueFrom:
      secretKeyRef:
        name: {{ .Release.Name }}-chris-superuser
        key: password
  - name: CHRIS_SUPERUSER_EMAIL
    valueFrom:
      secretKeyRef:
        name: {{ .Release.Name }}-chris-superuser
        key: email
```
