```promql
node_namespace_pod_container:container_cpu_usage_seconds_total:sum_irate{namespace="chris", container!=""}
* on (pod) group_left()
kube_pod_labels{namespace="chris", label_app_kubernetes_io_name="pfcon"}
```

```promql
irate(container_cpu_time{app_kubernetes_io_name="pfcon"}[30s])
```


openobserve vs grafana for dashboarding: openobserve does not have:

- embed panels as iframes in other web apps
- public dashboards
- more data sources which are supported directly, such as PostgreSQL
- grafana has better UI+UX design, its GUI feels more polished and easier to use

