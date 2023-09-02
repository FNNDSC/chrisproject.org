---
title: Migration of data from a OpenStack Swift on a VM to NooBaa on OpenShift
authors: jennings
tags: [OpenShift, backend]
---

Currently, https://cube.chrisproject.org is being powered by a VM called `fnndsc.childrens.harvard.edu`
in the Boston Children Hospital network's DMZ. It's been working well for us through
the years, however its 480GB disk frequently runs out of space. For more
storage, easier deployments, and stability, we want to migrate this instance
of the _ChRIS_ backend to the [NERC](https://nerc.mghpcc.org)'s OpenShift cluster.

The data for CUBE are currently stored on the VM by an OpenStack Swift container using
[docker-swift-onlyone](https://github.com/FNNDSC/docker-swift-onlyone), which writes
to a local Docker volume. We need to move the data to an
[`ObjectBucketClaim`](https://access.redhat.com/documentation/en-us/red_hat_openshift_container_storage/4.6/html/managing_hybrid_and_multicloud_resources/object-bucket-claim)
in OpenShift.

## Other Options

It would've been easier to migrate data from the VM's Swift to NERC OpenStack Swift.
In the process of doing that, I realized that it wouldn't work without modifying CUBE's code.
CUBE only supports [Swift auth "v1"](https://docs.openstack.org/python-swiftclient/2023.1/swiftclient.html#module-swiftclient.authv1)
while NERC OpenStack must use "v3" given `storage_url` and `auth_token`.

Would it be that much more effort to go the extra mile and implement S3 support in CUBE,
paving the way to a 100% OpenShift architecture? Well yes... ok.

## Buckets in OpenShift

[NooBaa](https://www.noobaa.io/) gives OpenShift object storage.

```yaml
apiVersion: objectbucket.io/v1alpha1
kind: ObjectBucketClaim
metadata:
  name: cube-files
spec:
  generateBucketName: cube-files
  storageClassName: openshift-storage.noobaa.io
```

The `ObjectBucketClaim` creates a ConfigMap and Secret which detail how to connect to the bucket.

## Exposing the Bucket via `rinetd`

Now, the hard part: the bucket is only accessible from within OpenShift, and the Swift API is
only accessible from on the VM. How do we move data from the VM into OpenShift?

To make the bucket available to the VM:

1. Use [rinetd](https://github.com/samhocevar/rinetd) to make the bucket endpoint accessible from
   a pod in the OpenShift project namespace
2. `oc port-forward` to expose the pod container's port on the VM

The bucket endpoint `s3.openshift-storage.svc:443` comes from the ConfigMap `cube-files`.

```yaml
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: rinetd-nooba
data:
  rinetd.conf: |-
    0.0.0.0 4443 s3.openshift-storage.svc 443

---
apiVersion: v1
kind: Pod
metadata:
  name: rinetd-nooba
  labels:
    app: rinetd-nooba
spec:
  containers:
    - name: rinetd
      image: docker.io/vimagick/rinetd@sha256:b13986b635ac909ae9aa6ef12972fd7071c91fe538e985b26eee77ad248a6158
      ports:
        - containerPort: 443
      volumeMounts:
        - name: config
          subPath: rinetd.conf
          mountPath: /etc/rinetd/rinetd.conf
  volumes:
    - name: config
      configMap:
        name: rinetd-nooba
```

## Rclone Configuration

`access_key_id` and `secret_access_key` come from the Secret `cube-files`.
The endpoint URL is `localhost:4443` because later we'll be reaching it using `oc port-forward`.

```ini title=~/.config/rclone/rclone.conf
[swift]
type = swift
auth_version = 1
key = testing
user = chris:chris1234
auth = http://localhost:52525/auth/v1.0

[fw-rinetd-nooba]
type = s3
provider = Other
access_key_id = XXXXXXXXXXXXXXXXXXXX
secret_access_key = XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
endpoint = localhost:4443
```

## Doing the Copy

In one `tmux` pane I'm running

```shell
while sleep 1; do oc port-forward rinetd-nooba 4443:4443; done
```

and in the other, I have

```shell
rclone copy --progress --no-check-certificate swift:users fw-rinetd-nooba:cube-files-938a843c-3bef-4724-90d5-4e85ac3e30c4
```

`cube-files-938a843c-3bef-4724-90d5-4e85ac3e30c4` is the auto-generated bucket name,
obtained from the ConfigMap `cube-files`.

![Screenshot](./screenshot.png)

:::note

`--no-check-certificates` is necessary because the bucket endpoint uses a self-signed certificate.

:::

There were errors and disruptions to `oc port-forward`. So we do a second pass with `rclone sync`:

```shell
rclone sync --progress --no-check-certificate swift:users fw-rinetd-nooba:cube-files-938a843c-3bef-4724-90d5-4e85ac3e30c4
```
