---
title: Oxidicom
---

_oxidicom_ is a high-performance DICOM receiver for the
[_ChRIS_ backend](https://github.com/FNNDSC/ChRIS_ultron_backEnd) (CUBE).

More technically, _oxidicom_ implements a DICOM C-STORE service class provider (SCP),
meaning it is a "server" which receives DICOM data over TCP. Received data are
stored in _CUBE_.

## Architecture

1. _oxidicom_ receives DICOM data from PACS. This event is called an _association_.
2. For every DICOM file received, _oxidicom_ stores the file in _CUBE_'s storgae. 
2. _oxidicom_ sends messages about DICOM study reception progress to NATS. _ChRIS\_ui_
   gets the messages over websockets, which is tunneled through _CUBE_'s ASGI web server.
3. When the association is complete, _oxidicom_ sends a task to _RabbitMQ_.
4. The task is delivered to _CUBE_'s celery worker, which registers received DICOM data to the database.

### Architecture Diagram

```
                                                                    ┌────────────┐                              
                                                                    │  ChRIS_ui  │                              
                                                                    └────────────┘                              
                                                                         ▲                                      
                                                                         │websocket                             
                                                                         │message                               
                                                                         │                                      
                                                                    ┌────┴────────┐                             
                                progress message ┌────────┐ message │    CUBE     │                             
                          ┌─────────────────────►│  NATS  ├────────►│ ASGI server │                             
                          │                      └────────┘         └─────────────┘                             
   ┌────────┐  DICOM  ┌───┴────┐       send task ┌────────┐ consume ┌─────────────┐                             
   │  PACS  ┼────────►│oxidicom┼────────────────►│RabbitMQ├────────►│             │          ┌──────────┐       
   └────────┘         └───┬────┘                 └────────┘         │    CUBE     │ register │PostgreSQL│       
                          │                write ┌────────┐ read    │celery worker├─────────►│ Database │       
                          └─────────────────────►│Storage │◄────────┤             │          └──────────┘       
                                                 └────────┘         └─────────────┘                             
```

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
| `OXIDICOM_PACS_ADDRESS`          | PACS server addresses (recommended, see [PACS address configuration])                 |
| `OXIDICOM_LISTENER_THREADS`      | Maximum number of concurrent SCU clients to handle. (see [Performance Tuning])        |
| `OXIDICOM_LISTENER_PORT`         | TCP port number to listen on                                                          |
| `OXIDICOM_VERBOSE`               | Set as `yes` to show debugging messages                                               |
| `TOKIO_WORKER_THREADS`           | Number of threads to use for the async runtime                                        |
| `OTEL_EXPORTER_OTLP_ENDPOINT`    | OpenTelemetry Collector gRPC endpoint                                                 |
| `OTEL_RESOURCE_ATTRIBUTES`       | Resource attributes, e.g. `service.name=oxidicom-test`                                |

[humantime]: https://docs.rs/humantime/2.1.0/humantime/fn.parse_duration.html
[PACS address configuration]: #pacs-address-configuration
[Performance Tuning]: #performance-tuning

See [src/settings.rs](https://github.com/FNNDSC/oxidicom/blob/v2.0.0/src/settings.rs) for the source of truth on the table above and default values of optional settings.

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

## PACS Address Configuration

The environment variable `OXIDICOM_PACS_ADDRESS` should be a dictionary of AE titles to their IPv4 sockets
(IP address and port number).

The PACS server address for a client AE title is used to look up the `NumberOfSeriesRelatedInstances`.
For example, suppose `OXIDICOM_PACS_ADDRESS={BCH="1.2.3.4:4242"}`. When we receive DICOMs from `BCH`, `oxidicom`
will do a C-FIND to `1.2.3.4:4242`, asking them what is the `NumberOfSeriesRelatedInstances` for the
received DICOMs. When we receive DICOMs from `MGH`, the PACS address is unknown, so `oxidicom` will set
`NumberOfSeriesRelatedInstances=unknown`.

### Observability

`oxidicom` exports traces to OpenTelemetry collector. There is a span for the association
(TCP connection from PACS server to send us DICOM objects).

