---
title: Architecture
sidebar_position: 1
---

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
