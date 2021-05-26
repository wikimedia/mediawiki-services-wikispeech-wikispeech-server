Wikispeech-server will spin up on three ports.
(Default 10000) is the raw wikispeech-server server. Use this for non TTS-rendering actions.
(Default 10001) is backed by HAProxy with a connection queue for the resource heavy TTS actions,
(Default 10002) is the HAProxy /stats page. Use this to monitor server load.

## Environment variables

| Name                                                             | Default value  | Description                                                       |
| ---------------------------------------------------------------- |:--------------:| ----------------------------------------------------------------- |
| HAPROXY_QUEUE_SIZE                                               | 100            | Maximum number of connection in queue.                            |
| HAPROXY_TIMEOUT_CONNECT                                          | 60s            | Time before giving up a queued connection.                        |
| HAPROXY_TIMEOUT_CLIENT                                           | 60s            | Time before giving up on a non responding client.                 |
| HAPROXY_TIMEOUT_SERVER                                           | 60s            | Time before giving up on a non responding wikispeech-server.      |
| HAPROXY_WIKISPEECH_SERVER_FRONTEND_PORT                          | 10001          | HAProxy queued wikispeech-server port.                            |
| HAPROXY_WIKISPEECH_SERVER_BACKEND_PORT                           | 10000          | Raw wikispeech-server port as defined in server.conf.             |
| HAPROXY_WIKISPEECH_SERVER_BACKEND_MAXIMUM_CONCURRENT_CONNECTIONS | 4              | Number of active connections allowed on queued wikispeech-server. |
| HAPROXY_STATS_FRONTEND_REFRESH_RATE                              | 4s             | Refreshrate on HAProxy stats available on port 10002.             |


