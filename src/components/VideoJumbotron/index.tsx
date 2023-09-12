import React from "react";
import styles from './styles.module.css';

/**
 * Provides a video background.
 */
export default function VideoJumbotron({ children, ...props }) {
  return (
    <div className="container">
      <div {...props}>
        <video
          playsInline loop muted
          className={styles.jumboVideo}
          onCanPlay={e => { // noinspection JSIgnoredPromiseFromCall
            e.currentTarget.play()}}
        >
          <source src={require('@site/static/video/jumbo-vid.mp4').default} type="video/mp4" />
          <source src={require('@site/static/video/jumbo-vid.webm').default} type="video/webm" />
          Your browser doesn't support the video element.
        </video>
        <div className={styles.jumboVideoShade} />

        <div className="row">
          {/* Adds space to the left for desktop layouts, no space on mobile */}
          <div className="col col--4"></div>
          <div className="col col--1"></div>

          <div className={`col col--6 ${styles.jumboContent}`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
