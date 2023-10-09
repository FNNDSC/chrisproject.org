import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import HomepageFeatures from "@site/src/components/HomepageFeatures";
import Layout from "@theme/Layout";
import clsx from "clsx";
import React from "react";

import VideoJumbotron from "@site/src/components/VideoJumbotron";
import "./fixme.css";
import styles from "./index.module.css";

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
            <button
              type="button"
              className="button button--secondary button--lg"
            >
              View a demo
            </button>
          </a>
          <Link to="/docs#getting-started">
            <button
              type="button"
              className="button button--secondary button--outline button--lg fix-on-dark-bg"
            >
              Get Started
            </button>
          </Link>
        </div>
      </VideoJumbotron>
    </header>
  );
}

function WipNotice() {
  return (
    <div id="get-started">
      <div className="container">
        <div style={{ textAlign: "center" }}>
          <h1>🚧 Website under construction 🚧</h1>
          <p>
            In the meantime, please visit{" "}
            <a href="http://old-website.chrisproject.org/">
              http://old-website.chrisproject.org/
            </a>{" "}
            for information about <em>ChRIS</em>.
            <br />
            You can help me build this website:{" "}
            <a href="https://github.com/FNNDSC/chrisproject.org">
              https://github.com/FNNDSC/chrisproject.org
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={"Website"}
      description="Webpage and documentation of the ChRIS project"
    >
      <HomepageHeader />
      <main>
        <HomepageFeatures />
        <WipNotice />
      </main>
    </Layout>
  );
}
