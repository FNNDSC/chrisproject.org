import {DeploymentInfo, SrcType} from "./model";
import * as React from "react";
import Link from "@docusaurus/Link";

const deployments: DeploymentInfo[] = [
  {
    url: "https://app1.chrisproject.org",
    src: {
      type: SrcType.OpenShift,
      value: "https://console.apps.shift.nerc.mghpcc.org/k8s/ns/hosting-of-medical-image-analysis-platform-dcb83b/buildconfigs/app1-chrisproject-org"
    },
    description: "ChRIS_ui for CUBE1",
    host: "NERC (OpenShift)",
    isChris: true,
    public: true
  },
  {
    url: "https://cube1.chrisproject.org/api/v1/",
    src: {
      type: SrcType.GitHub,
      value: "https://github.com/FNNDSC/NERC/tree/master/cube1"
    },
    description: (<span>Our first, 100% OpenShift deployment of <em>ChRIS</em>.</span>),
    notes: (
      <p>
        <em>CUBE</em>, <em>pfcon</em>, and all plugin instance jobs are confined to run on a single node.
        This is because ReadWriteMany filesystem volumes are not available.
        See <a href="https://github.com/nerc-project/operations/issues/171">"The Big Storage Issue."</a>
      </p>
    ),
    host: "NERC (OpenShift)",
    isChris: true,
    public: true
  },
  {
    url: "https://orthanc.chrisproject.org",
    src: {
      type: SrcType.GitHub,
      value: "https://github.com/FNNDSC/NERC/tree/master/cube1"
    },
    description: "Orthanc PACS server for CUBE1",
    notes: (<div>
      <p>
        Login account credentials can be obtained from{' '}
        <a
          href="https://console.apps.shift.nerc.mghpcc.org/k8s/ns/hosting-of-medical-image-analysis-platform-dcb83b/secrets/cube1-orthanc">
          OpenShift Console
        </a>.
      </p>
      <p>
        The GitHub repository also provides some helpful scripts:
      </p>
      <p>
        <ul>
          <li>
            <code>scripts/list_mrns.sh</code>: lists MRNs of patients in Orthanc
          </li>
          <li>
            <code>scripts/upload2orthanc.sh</code>: bulk upload of DICOM files to Orthanc
          </li>
        </ul>
      </p>
    </div>),
    host: "NERC (OpenShift)",
    isChris: false,
    public: true
  },
  {
    url: "https://ohif.chrisproject.org",
    src: {
      type: SrcType.GitHub,
      value: "https://github.com/FNNDSC/NERC/tree/master/cube1"
    },
    description: (<span>
      <a href="https://ohif.org/">
        <em>OHIF</em>
      </a>{' '}
      viewer for the <em>pfdcm</em> filesystem cache of CUBE1.
    </span>),
    notes: "Keep in mind that this OHIF displays data stored by PFDCM (which is mostly the same as but is not guaranteed to be the same data as CUBE PACSfiles).",
    host: "NERC (OpenShift)",
    isChris: false,
    public: true
  },
  {
    url: "https://cube.chrisproject.org/api/v1/",
    description: (
      <span>
        Public demo CUBE. <b>Very outdated</b>
      </span>
    ),
    host: "fnndsc.tch.harvard.edu (docker-compose)",
    src: {
      type: SrcType.Path,
      value: "/home/jorge.bernal/cube.chrisproject.org",
    },
    isChris: true,
    public: true,
  },
  {
    url: "https://app.chrisproject.org",
    description: "Public ChRIS_ui connected to https://cube.chrisproject.org",
    host: "NERC (OpenShift)",
    src: {
      type: SrcType.OpenShift,
      value:
        "https://console.apps.shift.nerc.mghpcc.org/k8s/ns/hosting-of-medical-image-analysis-platform-dcb83b/buildconfigs/chrisui",
    },
    isChris: true,
    public: true,
    notes: (
      <span>
        Automatic latest build of{" "}
        <Link to="https://github.com/FNNDSC/ChRIS_ui">
          https://github.com/FNNDSC/ChRIS_ui
        </Link>{" "}
        master branch.
      </span>
    ),
  },
  {
    url: "https://app.fetalmri.org",
    description: "Fetal MRI dataset browser",
    host: "NERC (OpenShift)",
    src: {
      type: SrcType.OpenShift,
      value:
        "https://console.apps.shift.nerc.mghpcc.org/k8s/ns/hosting-of-medical-image-analysis-platform-dcb83b/buildconfigs/app-fetalmri-org",
    },
    isChris: true,
    public: true,
    notes: (
      <span>
        Automatic build of{" "}
        <Link to="https://github.com/FNNDSC/ChRIS_ui">
          https://github.com/FNNDSC/ChRIS_ui
        </Link>{" "}
        <code>app-fetalmri-org</code> tag.
      </span>
    ),
  },
  {
    url: "https://fetalmri-cube.apps.shift.nerc.mghpcc.org/api/v1/",
    description: "Fetal MRI dataset CUBE",
    host: "NERC (OpenShift)",
    src: {
      type: SrcType.GitHub,
      value: "https://github.com/FNNDSC/NERC/tree/master/cube-fetalmri-org",
    },
    isChris: true,
    public: true,
    notes: (
      <span>
        Admin user username and passwords can be found on{" "}
        <Link to="https://console.apps.shift.nerc.mghpcc.org/k8s/ns/hosting-of-medical-image-analysis-platform-dcb83b/secrets/cube-fetalmri-org-chris-superuser">
          OpenShift Console
        </Link>
        .
      </span>
    ),
  },
  {
    url: "https://cube-for-testing-chrisui.apps.shift.nerc.mghpcc.org/api/v1/",
    description:
      "Public CUBE for testing against the CUBE API in CI environments.",
    host: "NERC (OpenShift)",
    src: {
      type: SrcType.OpenShift,
      value:
        "https://console.apps.shift.nerc.mghpcc.org/helm-releases/ns/hosting-of-medical-image-analysis-platform-dcb83b/release/public-testing",
    },
    isChris: true,
    public: true,
    notes: (
      <span>
        I plan to implement a cron job which deletes all users and all user data older than a week,
        excluding special users such as `fnndsc` (admin) and `chrisui` (test user reused in each test run).
      </span>
    )
  },
  {
    url: "http://chris-next.tch.harvard.edu",
    description: "BCH internal ChRIS_ui",
    host: "chris-next (docker-compose)",
    src: {
      type: SrcType.Path,
      value: "/neuro/labs/grantlab/research/prod/ChRIS_ui",
    },
    isChris: true,
    public: false,
  },
  {
    url: "http://rc-live.tch.harvard.edu:32000/api/v1/",
    description: (
      <span>
        BCH internal CUBE. <b>Very outdated</b>
      </span>
    ),
    host: "galena (Kubernetes)",
    src: {
      type: SrcType.Path,
      value: "/neuro/labs/grantlab/research/prod/galena/helm/kubesq",
    },
    isChris: true,
    public: false,
  },
  {
    url: "http://rc-live.tch.harvard.edu:32222/api/v1/",
    description: (
      <span>
        <em>New</em> BCH internal "high-performance" CUBE, i.e. innetwork
        filesystem pfcon.
      </span>
    ),
    host: "galena (Kubernetes)",
    src: {
      type: SrcType.Path,
      value: "/neuro/labs/grantlab/research/prod/galena/helm/chris2222",
    },
    isChris: true,
    public: false,
  },
  {
    url: "http://chris-next.tch.harvard.edu:2222",
    description: (
      <span>
        <em>New</em> BCH internal ChRIS_ui for the "high-performance" CUBE.
      </span>
    ),
    host: "chris-next (docker-compose)",
    src: {
      type: SrcType.Path,
      value: "/neuro/labs/grantlab/research/prod/ChRIS_ui_2222",
    },
    isChris: true,
    public: false,
  },
];

Object.freeze(deployments);

export { deployments };
