// NOTE: light.jpg is the original file, retrieved from
//       https://www.redhat.com/en/blog/introducing-red-hat-openshift-container-platform
//       then downsized. dark.png is edited from light.jpg and converted from
//       JPG to PNG to support background transparency.

import Dark from "./dark.png";
import Light from "./light.jpg";
import styles from "./styles.module.css";

const OpenshitLogo = ({ className, ...props }) => (
  <>
    <img
      alt="OpenShift Logo"
      src={Light}
      {...props}
      className={className ? `${className} ${styles.light}` : styles.light}
    />
    <img
      alt="OpenShift Logo"
      src={Dark}
      {...props}
      className={className ? `${className} ${styles.dark}` : styles.dark}
    />
  </>
);

export default OpenshitLogo;
