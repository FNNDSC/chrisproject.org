---
title: Deploy ChRIS_ui on OpenShift
sidebar_position: 4
---

### 1. Import the nodejs base image as an ImageStream

This command specifies which base image to use for
[source-to-image](https://github.com/openshift/source-to-image) (s2i).

```shell
oc import-image nodejs:20 --from=quay.io/fedora/nodejs-20 --confirm
```

### 2. Create BuildConfig and Deployment using `oc new-app`

The command `oc new-app` attempts to do the following: given a GitHub repo URL,
create a BuildConfig, Deployment, Service, and start a build.

```shell
oc new-app --name chrisui \
    --build-env=VITE_CHRIS_UI_URL='https://cube.chrisproject.org/api/v1/' \
    --build-env=VITE_CHRIS_UI_USERS_URL='https://cube.chrisproject.org/api/v1/users/' \
    --build-env=VITE_CHRIS_UI_AUTH_URL='https://cube.chrisproject.org/api/v1/auth-token/' \
    --build-env=VITE_PFDCM_URL='https://pfdcm-hosting-of-medical-image-analysis-platform-dcb83b.apps.shift.nerc.mghpcc.org/' \
    nodejs:20~https://github.com/FNNDSC/ChRIS_ui.git
```


### 3. Reconfigure the build

- Set ref=`refs/heads/master`, so that full commit history is cloned for the sake of
  being able to generate the version string. See https://github.com/FNNDSC/ChRIS_ui/pull/508
- Increase memory limit for build to 4GB
- (optional) Set RunPolicy=SerialLatestOnly
- (optional) Set `successfulBuildsHistoryLimit` and `failedBuildsHistoryLimit`

```shell
oc patch bc/chrisui --patch '{"spec":{"resources":{"limits":{"memory":"3814Mi"}},"runPolicy":"SerialLatestOnly","source":{"git":{"ref":"refs/heads/master"}}",successfulBuildsHistoryLimit":2,"failedBuildsHistoryLimit":2}}'
```

### 4. Create a Route

The easiest way to do this is through the OpenShift console.

To create a HTTPS route on a custom domain on the NERC, see [here](/docs/internal/nerc/https).

### 5. Add a GitHub Webhook for automatic updates

More information: https://docs.openshift.com/container-platform/4.11/cicd/builds/triggering-builds-build-hooks.html#builds-webhook-triggers_triggering-builds-build-hooks
