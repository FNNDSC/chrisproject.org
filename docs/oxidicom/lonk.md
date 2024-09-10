---
title: LONK
sidebar_position: 3
---

# Light Oxidicom NotifiKations Encoding

_oxidicom_ sends to _CUBE_ via [NATS](https://nats.io) messages about the progress of DICOM storage.
The encoding of these messages is called "Light Oxidicom NotifiKations" encoding, or **LONK** for short.

:::tip

The target audience of this page are [ChRIS\_ultron\_backEnd](https://github.com/FNNDSC/ChRIS_ultron_backEnd) developers.

:::

### Oxidicom NATS Subjects

There is a subject for each series. The subject name is

```
oxidicom.{pacs_name}.{SeriesInstanceUID}.ndicom
```

Where `{pacs_name}` is the AE title of the PACS which associated with _oxidicom_, and
`{SeriesInstanceUID}` is the `SeriesInstanceUID` **but with `.` replaced by `_`**.

### LONK Message Encoding {#lonk-message-encoding}

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
