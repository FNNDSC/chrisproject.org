---
title: LONK-WS
sidebar_position: 4
---

# LONK JSON WebSockets Protocol (LONK-WS)

**LONK-WS** is the protocol which _ChRIS\_ui_ uses to receive DICOM receive progress
notifications from _oxidicom_.

:::tip

The target audience of this page are [ChRIS\_ui](https://github.com/FNNDSC/ChRIS_ui) developers.

:::

_CUBE_ subscribes to [**LONK**](./lonk.md) messages and pushes them to _ChRIS\_ui_.
The data interchange is logcally the same as **LONK**, but is serialized as JSON
and sent over WebSockets instead of a binary encoding over NATS.

```
              binary            JSON
[oxidicom] --------> [CUBE] -----------> [ChRIS_ui]
               NATS          WebSockets
```

### Authentication and Initial Connection

First, the client (_ChRIS\_ui_) opens a WebSocket connection with _CUBE_ at the URI
`api/v1/pacs/ws/?token=ABC123` where `ABC123` is replaced with a JWT obtained from
`api/v1/downloadtokens/`.

### Subscription {#lonk-ws-subscription}

Once connected, _ChRIS\_ui_ subscribes to notifications for DICOM series by sending to _CUBE_ a `SubscriptionRequest` in JSON:

```json
{"pacs_name": "MyPACS", "SeriesInstanceUID": "1.2.345.67890", "action": "subscribe"}
```

And _CUBE_ responds with a confirmation message (`LonkWsSubscription`):

```json
{"pacs_name": "MyPACS", "SeriesInstanceUID": "1.2.345.67890", "message": {"subscription": "subscribed"}}
```

### Messages

All JSON messages from CUBE will satisfy the type:

```typescript
type LonkWsMessage = {
  pacs_name: string;
  SeriesInstanceUID: string;
  message: LonkMessageData
}
```

Where `LonkMessageData` is a union type with a variant corresponding to
[each type of **LONK** message](./lonk.md#lonk-message-encoding).

| Name     | Example                           |
|----------|-----------------------------------|
| done     | `{ "done": true }`                |
| progress | `{ "ndicom": 2 }`                 |
| error    | `{ "error": "stuck in chimney" }` |

### Complete Interaction

_CUBE_ will send to the client at least 4 messages:

1. [subscription confirmed](#lonk-ws-subscription)
2. first `progress`, ndicom=1
3. last `progress`, ndicom=N
4. `done`

#### Notes

- There will usually be more `progress` messages between the first and the last.
- The `progress` message for a series most recent to its `done` message (i.e., the last `progress` message)
  should be equal to `NumberOfSeriesRelatedInstances`.
- The value of `ndicom` will always increase.

#### Complete Interaction Example

```
-->  {"pacs_name": "MyPACS", "SeriesInstanceUID": "1.2.345.67890", "action": "subscribe"}
<--  {"pacs_name": "MyPACS", "SeriesInstanceUID": "1.2.345.67890", "message": {"subscription": "subscribed"}}
<--  {"pacs_name": "MyPACS", "SeriesInstanceUID": "1.2.345.67890", "message": {"ndicom": 1}}
<--  {"pacs_name": "MyPACS", "SeriesInstanceUID": "1.2.345.67890", "message": {"ndicom": 9}}
<--  {"pacs_name": "MyPACS", "SeriesInstanceUID": "1.2.345.67890", "message": {"ndicom": 34}}
<--  {"pacs_name": "MyPACS", "SeriesInstanceUID": "1.2.345.67890", "message": {"ndicom": 108}}
<--  {"pacs_name": "MyPACS", "SeriesInstanceUID": "1.2.345.67890", "message": {"ndicom": 192}}
<--  {"pacs_name": "MyPACS", "SeriesInstanceUID": "1.2.345.67890", "message": {"done": true}}
```

### Multiple Subscriptions

_ChRIS\_ui_ may subscribe to as many series as it wants to. Communication for \[0, N) series are multiplexed
over a single WebSocket connection.

For example, if you want notifications for all series of a study, the client needs to send multiple
[`SubscriptionRequest`](#lonk-ws-subscription).

```json
{"pacs_name": "MyPACS", "SeriesInstanceUID": "1.2.345.67890", "action": "subscribe"}
{"pacs_name": "MyPACS", "SeriesInstanceUID": "1.2.345.67890", "action": "subscribe"}
```

Notifications for different series might be interleaved, e.g. messages from _CUBE_:

```json
{"pacs_name": "MyPACS", "SeriesInstanceUID": "1.2.345.67890", "message": {"ndicom": 1}}
{"pacs_name": "MyPACS", "SeriesInstanceUID": "1.2.345.67890", "message": {"ndicom": 45}}
{"pacs_name": "MyPACS", "SeriesInstanceUID": "1.2.345.73667", "message": {"ndicom": 66}}
{"pacs_name": "MyPACS", "SeriesInstanceUID": "1.2.345.67890", "message": {"ndicom": 70}}
{"pacs_name": "MyPACS", "SeriesInstanceUID": "1.2.345.73667", "message": {"ndicom": 68}}
{"pacs_name": "MyPACS", "SeriesInstanceUID": "1.2.345.67890", "message": {"ndicom": 80}}
```

