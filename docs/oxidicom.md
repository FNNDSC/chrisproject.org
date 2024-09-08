---
title: Oxidicom
---

:::tip

This page is for an upcoming release of _ChRIS_. See https://github.com/FNNDSC/oxidicom/pull/3

:::

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
| `OXIDICOM_LISTENER_THREADS`      | Maximum number of concurrent SCU clients to handle. (see [Performance Tuning])        |
| `OXIDICOM_LISTENER_PORT`         | TCP port number to listen on                                                          |
| `OXIDICOM_VERBOSE`               | Set as `yes` to show debugging messages                                               |
| `TOKIO_WORKER_THREADS`           | Number of threads to use for the async runtime                                        |
| `OTEL_EXPORTER_OTLP_ENDPOINT`    | OpenTelemetry Collector gRPC endpoint                                                 |
| `OTEL_RESOURCE_ATTRIBUTES`       | Resource attributes, e.g. `service.name=oxidicom-test`                                |

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

## Light Oxidicom NotifiKations Encoding

_oxidicom_ sends to _CUBE_ via NATS messages about the progress of DICOM storage.
The encoding of these messages is called "Light Oxidicom NotifiKations" encoding, or **LONK** for short.

### Oxidicom NATS Subjects

There is a subject for each series. The subject name is

```
oxidicom.{pacs_name}.{SeriesInstanceUID}.ndicom
```

Where `{pacs_name}` is the AE title of the PACS which associated with _oxidicom_, and
`{SeriesInstanceUID}` is the `SeriesInstanceUID` **but with `.` replaced by `_`**.

### LONK Message Encoding

The messages take the form of a magic byte followed by data. Messages are one of:

| Type     | Magic Byte | Description                                                                                                                         |
|----------|------------|-------------------------------------------------------------------------------------------------------------------------------------|
| Done     | `0x00`     | `0x00` indicating no more messages will be sent for the DICOM series (for the current association).                                 |
| Progress | `0x01`     | `0x01` followed by a little-endian unsigned 32-bit integer, representing the number of DICOM files received for that series so far. |
| Error    | `0x02`     | `0x02` followed by a UTF-8 string, which is an error message.                                                                       |

#### Encoded Message Examples

##### Example: Typical Messages

```
0x01  0x01 0x00 0x00 0x00  | Received 1 DICOM file so far
0x01  0x02 0x00 0x00 0x00  | Received 2 DICOM files so far
0x01  0xc0 0x00 0x00 0x00  | Received 192 DICOM file so far
0x00                       | Done receiving DICOM files
```

#### Example: Error Message

```
0x01  0x01 0x00 0x00 0x00                                                              | Received 1 DICOM file so far
0x02  0x73 0x74 0x75 0x63 0x6b 0x20 0x69 0x6e 0x20 0x63 0x68 0x69 0x6d 0x6e 0x65 0x79  | error: "stuck in chimney"
0x00                                                                                   | Done receiving DICOM files
```
