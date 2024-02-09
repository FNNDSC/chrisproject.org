---
title: "Shrinking a PersistentVolumeClaim in Kubernetes"
authors: jennings
tags: [Kubernetes, OpenShift]
---

To shrink a PersistentVolumeClaim (PVC) in OpenShift or Kubernetes,
we need to:

1. pause our deployments
2. copy its data to a smaller, temporary PVC
3. delete the original PVC
4. create a new PVC with the original name
5. copy the data from the temporary PVC to the new PVC
6. restart our deployments

<!--truncate-->

First, we pause our deployments by scaling them down to zero replicas:

```shell
oc get deploy -o name -l app.kubernetes.io/instance=cube-fetalmri-org | xargs oc scale --replicas=0
```

Next, we need to create a temporary volume.

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: fetalmri-20240208-copy
spec:
  accessModes:
    - ReadWriteOnce
  volumeMode: Filesystem
  resources:
    requests:
      storage: 2Gi
```

To copy data between volumes, we need a container. The command here is `sleep 99999999` so that
we can use an interactive shell to do the copying instead.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: copy
spec:
  containers:
    - name: sleep
      image: 'docker.io/instrumentisto/rsync-ssh:latest'
      command:
      - sleep
      - "99999999"
      volumeMounts:
      - mountPath: /orig
        name: orig
      - mountPath: /copy
        name: copy
  volumes:
  - name: orig
    persistentVolumeClaim:
      claimName: cube-fetalmri-org-storebase
  - name: copy
    persistentVolumeClaim:
      claimName: fetalmri-20240208-copy
```

Do the copying in an interactive shell:

```shell
oc exec -it copy -- rsync -ar --info=progress2 /orig/ /copy/
```

And verify:

```shell
oc exec -it copy -- ls /orig /copy
oc exec -it copy -- du -hs /orig /copy
```

Delete the pod:

```shell
oc delete --grace-period=1 pod copy
```

Now we can delete the original PVC and recreate a smaller one with the same name.
The last steps are to copy the data back then restart our deployments.
We can reuse the `copy` pod definition to copy the data back.
