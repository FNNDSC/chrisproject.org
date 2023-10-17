# OpenObserve

We have a deployment of [OpenObserve](https://openobserve.ai) deployed on the NERC.
It is accessible here:

https://openobserve-hosting-of-medical-image-analysis-platform-dcb83b.apps.shift.nerc.mghpcc.org/web/

## Getting an Account

The root account's details can be obtained from OpenShift:

https://console.apps.shift.nerc.mghpcc.org/k8s/ns/hosting-of-medical-image-analysis-platform-dcb83b/secrets/openobserve-root-user

However, the best practice is to use your own account, which can be obtained by:

- Logging in as the root user and creating a personal account
- Messaging [Jennings](https://matrix.to/#/@jennydaman:fedora.im)

## Uses

We use OpenObserve to store logs for some of our GitHub Actions.

## Deployment

The source YAML is found here: https://github.com/FNNDSC/NERC/blob/master/openobserve/openobserve-small.yml

The route and `openobserve-root-user` were created manually.
