import React from "react";
import styles from "./styles.module.css";

export default function FnndscLogo({ ...props }): JSX.Element {
  return (
    <div {...props}>
      <div>
        <a
          href="https://fnndsc.org"
          rel="noopener noreferrer"
          className={styles.fnndscLogo}
        >
          <div>
            <img src="/img/3rdparty/brain_gears.svg" alt="FNNDSC Logo" />
            <h5>FNNDSC</h5>
            <p>
              Fetal&#8209;Neonatal&nbsp;Neuroimaging
              <br />
              Development&nbsp;Science&nbsp;Center
            </p>
          </div>
        </a>
      </div>
    </div>
  );
}
