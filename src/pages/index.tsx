import React from "react";
import clsx from "clsx";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import HomepageFeatures from "@site/src/components/HomepageFeatures";

import styles from "./index.module.css";
import "./fixme.css";
import VideoJumbotron from "@site/src/components/VideoJumbotron";

function HomepageHeader() {
  return (
    <header className={clsx("hero hero--primary", styles.heroBanner)}>
      <VideoJumbotron className={styles.jumbotron}>
        <h3 className="hero--title">
          <em>ChRIS</em> is an open-source platform for computational research
          and medicine.
        </h3>
        <p className="hero--subtitle">
          When open source meets passion and curiosity, it unleashes the
          potential to evolve research, integrate technology and inform better
          care.
        </p>
        <div className={styles.buttons}>
          <a href="https://app.chrisproject.org" rel="noopener noreferrer">
            <button className="button button--secondary button--lg">
              View a demo
            </button>
          </a>
          <Link to="#get-started">
            <button className="button button--secondary button--outline button--lg fix-on-dark-bg">
              Get Started
            </button>
          </Link>
        </div>
      </VideoJumbotron>
    </header>
  );
}

function GetStarted() {
  return (
    <div id="get-started">
      <div className="container">
        <h1>Getting Started</h1>
      </div>
    </div>
  );
}

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Webpage and documentation of the ChRIS project"
    >
      <HomepageHeader />
      <main>
        <HomepageFeatures />
        <GetStarted />
      </main>
    </Layout>
  );
}
