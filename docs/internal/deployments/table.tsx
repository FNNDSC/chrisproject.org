import * as React from "react";
import { DeploymentInfo, SrcType } from "@site/docs/internal/deployments/model";
import Link from "@docusaurus/Link";
import DataTable, {
  createTheme,
  ExpanderComponentProps,
  TableColumn,
} from "react-data-table-component";
import { CheckCircle, XCircle } from "react-feather";
import { useEffect, useState } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

// mutate dark theme of DataTable to have a transparent background instead of gray
createTheme("dark", {
  background: {
    default: "transparent",
  },
});

const columns: TableColumn<DeploymentInfo>[] = [
  {
    name: "url",
    cell: (row) => <Link to={row.url}>{row.url}</Link>,
    minWidth: "200px",
  },
  {
    name: "Description",
    cell: (row) => row.description,
    grow: 2,
    wrap: true,
  },
  {
    name: "Host",
    selector: (row) => row.host,
    wrap: true,
  },
  {
    name: "Public?",
    cell: (row) =>
      row.public ? <CheckCircle color="green" /> : <XCircle color="red" />,
    maxWidth: "24px",
  },
  {
    name: "ChRIS?",
    cell: (row) =>
      row.isChris ? (
        <img src="/img/logo/notext.png" height={24} width={24} />
      ) : (
        <div />
      ),
    maxWidth: "24px",
  },
];

const Expanded: React.FC<ExpanderComponentProps<DeploymentInfo>> = ({
  data,
}) => {
  let body = <span>{data.src.value}</span>;
  if (data.src.type === SrcType.OpenShift) {
    body = (
      <span>
        OpenShift console: <Link to={data.src.value}>{data.src.value}</Link>
      </span>
    );
  } else if (data.src.type === SrcType.Path) {
    body = (
      <span>
        Sources can be found on the host in <code>{data.src.value}</code>
      </span>
    );
  } else if (data.src.type === SrcType.GitHub) {
    body = (
      <span>
        Sources can be found on GitHub:{" "}
        <Link to={data.src.value}>{data.src.value}</Link>
      </span>
    );
  }
  return (
    <div style={{ padding: "1em" }}>
      {body}
      {data.notes && <p>{data.notes}</p>}
    </div>
  );
};

export default function DeploymentsTable({ data }: { data: DeploymentInfo[] }) {
  const { siteConfig } = useDocusaurusContext();
  const [docusaurusIsDark, setDocusaurusIsDark] = useState(
    siteConfig.themeConfig.colorMode.defaultMode === "dark",
  );

  useEffect(() => {
    setDocusaurusIsDark(
      document.documentElement.getAttribute("data-theme") === "dark",
    );
  }, []);

  return (
    <DataTable
      theme={docusaurusIsDark ? "dark" : "light"}
      columns={columns}
      data={data}
      expandableRows
      expandableRowsComponent={Expanded}
    />
  );
}
