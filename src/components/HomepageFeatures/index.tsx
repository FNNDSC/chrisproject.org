import Link from "@docusaurus/Link";
import clsx from "clsx";
import type React from "react";
import styles from "./styles.module.css";

type FeatureItem = {
  title: string;
  description: JSX.Element;
  Svg?: React.ComponentType<React.ComponentProps<"svg">>;
  picture?: string;
};

const FeatureList: FeatureItem[] = [
  {
    title: "Built by researchers, for researchers.",
    picture: "/img/website/illus_collaborate.png",
    description: (
      <>
        Servers, drivers, compilation, installation... Let us handle that for
        you. Focus on the science, not the plumbing. Jumpstart development using
        our{" "}
        <a href="https://github.com/FNNDSC/python-chrisapp-template">
          Python app template
        </a>{" "}
        which includes an optimized <code>Dockerfile</code>. By automating the
        boring stuff using{" "}
        <Link to="/docs/plugins/github_actions">GitHub Actions</Link>, bringing
        your science to the multi-cloud has never been easier.
      </>
    ),
  },
  {
    title: '"There\'s a plugin for that."',
    picture: "/img/website/illus_data.png",
    description: (
      <>
        Many popular neuroimaging software and pipelines are already available
        as <em>ChRIS plugins</em> such as{" "}
        <a href="https://app.chrisproject.org/plugin/21">FreeSurfer</a>,{" "}
        <a href="https://app.chrisproject.org/plugin/47">FastSurfer</a>,{" "}
        <a href="https://app.chrisproject.org/plugin/90">CIVET</a>,{" "}
        <a href="https://app.chrisproject.org/plugin/55">dcm2niix</a>,{" "}
        <a href="https://app.chrisproject.org/plugin/6">ANTs</a>, ... to name a
        few. More <em>ChRIS plugins</em> can be found from our{" "}
        <a
          href="https://app.chrisproject.org/catalog"
          rel="noopener noreferrer"
        >
          catalog
        </a>
        , which is a list that keeps growing.
      </>
    ),
  },
  {
    title: "Works right where you are.",
    Svg: require("@site/static/img/3rdparty/cncf-distribution-icon-color.svg")
      .default,
    description: (
      <>
        <em>ChRIS</em> is <span className="text--bold">vendor neutral</span>,
        supporting many clouds, hardware architectures, and container engines.
        Run it locally on <Link to="/docs/run/docker">Docker</Link> or{" "}
        <Link to="/docs/run/podman">Podman</Link>, or scale up with{" "}
        <Link to="/docs/run/helm">Kubernetes</Link>. One instance of{" "}
        <em>ChRIS</em> can dispatch jobs to any of the above, as well as SLURM
        for integration with your existing HPC.
      </>
    ),
  },
];

function Feature({ title, Svg, description, picture }: FeatureItem) {
  return (
    <div className={clsx("col col--4")}>
      <div className="text--center">
        <div className={styles.featurePicContainer}>
          {Svg ? (
            <Svg className={styles.featurePic} role="img" />
          ) : (
            <img
              src={picture}
              className={styles.featurePic}
              alt="Illustration"
            />
          )}
        </div>
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, _idx) => (
            <Feature key={props.title} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
