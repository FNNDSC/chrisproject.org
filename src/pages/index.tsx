import Link from "@docusaurus/Link";
import FnndscLogo from "@site/src/components/FnndscLogo";
import HomepageFeatures from "@site/src/components/HomepageFeatures";
import VideoJumbotron from "@site/src/components/VideoJumbotron";
import Layout from "@theme/Layout";
import clsx from "clsx";
import Zoom from "react-medium-image-zoom";
import useAckee from "use-ackee";
import "react-medium-image-zoom/dist/styles.css";
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
          <a
            href="https://app.chrisproject.org/signup"
            rel="noopener noreferrer"
          >
            <button
              type="button"
              className="button button--secondary button--lg"
            >
              Sign Up
            </button>
          </a>
          <Link to="/docs#getting-started">
            <button
              type="button"
              className="button button--secondary button--outline button--lg fix-on-dark-bg"
            >
              Read the docs
            </button>
          </Link>
        </div>
      </VideoJumbotron>
    </header>
  );
}

function SecondSection() {
  return (
    <div className={`${styles.blueBackground} ${styles.paddedSection}`}>
      <div className="container">
        <div className="row">
          <div className="col col--1">{/*  empty space  */}</div>
          <div className="col col--4">
            <div>
              <em>ChRIS</em> is democratizing computational medicine by creating
              a path from development environments to reproducible execution for
              scientist and clinician users. It empowers research developers to
              bring their work to production using Linux containers.
            </div>
          </div>
          <div className="col col--6">
            <div>
              <img
                src="/img/website/illus_containerize.png"
                alt="Illustration"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ThirdSection() {
  return (
    <div className={`${styles.paddedSection} ${styles.blueBackground}`}>
      <div className="container">
        <div className="row">
          <div className="col col--1">{/*  empty space  */}</div>
          <div className="col col--4">
            <div>
              <h2>
                <em>ChRIS</em> is for everyone
              </h2>
              <p>
                From citizen scientists to Harvard professors, <em>ChRIS</em>{" "}
                empowers anyone to use cloud computing and leverage research
                best practices such as reproducibility and data provenance.
              </p>
            </div>
          </div>
          <div className="col col--6">
            <Zoom classDialog="dark-zoom">
              {/* TODO get a light theme screenshot too */}
              <img
                src="/img/website/screenshot_chris_ui.png"
                alt="Screenshot of ChRIS_ui"
              />
            </Zoom>
          </div>
        </div>
      </div>
    </div>
  );
}

function FourthSection() {
  return (
    <div className={`${styles.paddedSection} ${styles.darkBlueBackground}`}>
      <div className="container">
        <div className="row">
          <div className="col col--12">
            We are a community of academic and industry partnerships between the
            Boston Children's Hospital, Red Hat, Boston University, and the MOC
            Alliance. Our community's development approach motivates us to
            prioritize interoperability of software components as well as
            research and education.
          </div>
        </div>
        <div className="row">
          <div className="col col--12">
            <div className={styles.rowOfLogos}>
              <FnndscLogo />
              <a
                href="https://www.childrenshospital.org/research"
                rel="noopener noreferrer"
              >
                <img src="/img/3rdparty/bch_logo_white.png" alt="BCH logo" />
              </a>
              <a
                href="https://research.redhat.com/partnerships/boston-university/"
                rel="noopener noreferrer"
              >
                <img src="/img/3rdparty/redhat_rev.png" alt="Red Hat logo" />
              </a>
              <a href="https://www.bu.edu/rhcollab/" rel="noopener noreferrer">
                <img src="/img/3rdparty/bu-logo.png" alt="BU logo" />
              </a>
              <a href="https://massopen.cloud/" rel="noopener noreferrer">
                <img src="/img/3rdparty/moc_white.png" alt="MOC logo" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home(): JSX.Element {
  useAckee(
    "/",
    {
      server: "https://ackee.chrisproject.org",
      domainId: "c4f71e33-cb14-452c-9203-020e102feec0",
    },
    {
      detailed: false,
      ignoreLocalhost: true,
      ignoreOwnVisits: true,
    },
  );

  return (
    <div id="app">
      <Layout
        title={"Website"}
        description="Webpage and documentation of the ChRIS project"
      >
        <HomepageHeader />
        <main>
          <SecondSection />
          <HomepageFeatures />
          <ThirdSection />
          <FourthSection />
        </main>
      </Layout>
    </div>
  );
}
