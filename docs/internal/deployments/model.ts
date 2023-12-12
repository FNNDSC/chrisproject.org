import { ReactElement } from "react";

enum SrcType {
  Path,
  OpenShift,
  GitHub,
}

type DeploymentInfo = {
  url: string;
  description: ReactElement;
  host: string;
  src: {
    type: SrcType;
    value: string;
  };
  isChris: boolean;
  public: boolean;
  notes?: ReactElement;
};

export { SrcType, DeploymentInfo };
