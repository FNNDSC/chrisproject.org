---
title: Deployment
sidebar_position: 2
---

## Environment Variables

Only `OXIDICOM_AMQP_ADDRESS` and `OXIDICOM_FILES_ROOT` are required. Those configure how oxidicom connects to _CUBE_.
The other variables are either for optional features or performance tuning.

| Name                             | Description                                                                           |
|----------------------------------|---------------------------------------------------------------------------------------|
| `OXIDICOM_AMQP_ADDRESS`          | (required) AMQP address of the RabbitMQ used by _CUBE_'s celery workers               |
| `OXIDICOM_FILES_ROOT`            | (required) Path to where _CUBE_'s storage is mounted                                  |
| `OXIDICOM_QUEUE_NAME`            | (optional) RabbitMQ queue name for the celery `register_pacs_series` task             |
| `OXIDICOM_NATS_ADDRESS`          | (optional) NATS server where to send progress messages                                |
| `OXIDICOM_PROGRESS_INTERVAL`     | Minimum delay between progress messages. Uses [humantime] syntax, e.g. `5ms`.         |
| `OXIDICOM_SCP_AET`               | DICOM AE title (PACS pushing to `oxidicom` should be configured to push to this name) |
| `OXIDICOM_SCP_STRICT`            | Whether receiving PDUs must not surpass the negotiated maximum PDU length.            |
| `OXIDICOM_SCP_UNCOMPRESSED_ONLY` | Only accept native/uncompressed transfer syntaxes                                     |                                                      
| `OXIDICOM_SCP_PROMISCUOUS`       | Whether to accept unknown abstract syntaxes.                                          |
| `OXIDICOM_SCP_MAX_PDU_LENGTH`    | Maximum PDU length                                                                    |
| `OXIDICOM_LISTENER_THREADS`      | Maximum number of concurrent SCU clients to handle. (see [Performance Tuning])        |
| `OXIDICOM_LISTENER_PORT`         | TCP port number to listen on                                                          |
| `OXIDICOM_VERBOSE`               | Set as `yes` to show debugging messages                                               |
| `TOKIO_WORKER_THREADS`           | Number of threads to use for the async runtime                                        |
| `OTEL_EXPORTER_OTLP_ENDPOINT`    | OpenTelemetry Collector gRPC endpoint                                                 |
| `OTEL_RESOURCE_ATTRIBUTES`       | Resource attributes, e.g. `service.name=oxidicom-test`                                |
| `RUST_LOG`                       | Logging verbosity, set `oxidicom=info` to turn on verbose messages.                   |

[humantime]: https://docs.rs/humantime/2.1.0/humantime/fn.parse_duration.html
[Performance Tuning]: #performance-tuning

See [src/settings.rs](https://github.com/FNNDSC/oxidicom/blob/master/src/settings.rs) for the source of truth on the table above and default values of optional settings.

## Performance Tuning

Behind the scenes, _oxidicom_ has three components connected by asynchronous channels:

1. listener: receives DICOM objects over TCP
2. writer: writes DICOM objects to storage
3. notifier: emits progress messages to NATS and series registration jobs to celery

`OXIDICOM_LISTENER_THREADS` controls the parallelism of the listener, whereas
`TOKIO_WORKER_THREADS` controls the async runtime's thread pool which is shared
between the writer and registerer. (The reason why we have two thread pools is
an implementation detail: the Rust ecosystem suffers from a sync/async divide.)

### Message Throttling

Increase the value for `OXIDICOM_PROGRESS_INTERVAL` to decrease the rate of messages.
Doing so will decrease load on _CUBE_'s ASGI web server and improve _ChRIS\_ui_ performance.

## Scaling

Large amounts of incoming data can be handled by horizontally scaling _oxidicom_.
It is easy to increase its number of replicas. However, the task queue for
registering the data to _CUBE_ will fill up. If you try to increase the number of
_CUBE_ celery workers, then the PostgreSQL database will get strained.

## Failure Modes

_oxidicom_ is designed to be fault-tolerant. For instance, an error with an individual
DICOM instance does not terminate the association (meaning, subsequent DICOM
instances will still have the chance to be received).

No assumptions are made about the PACS being well-behaved. _oxidicom_ does not care
if the PACS sends illegal data (e.g. the wrong number of DICOM instances for a series).

Receiving the same DICOM data more than once will overwrite the existing file in storage,
and another task to register the series will be sent to _CUBE_'s celery workers. _CUBE_'s
workers are going to throw an error when this happens. The overall behavior is idempotent.

### Observability

`oxidicom` exports traces to OpenTelemetry collector. There is a span for the association
(TCP connection from PACS server to send us DICOM objects).

