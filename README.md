# TopCoder Events Viewer

This codebase includes a NodeJS server (see `src/`) and a ReactJS UI (see `ui/`).

## Prerequisites

- NodeJS (v10)
- Kafka (v2)

## Configuration

### Server Configuration

Configuration for the application is at `src/config/default.js`.
The following parameters can be set in config file or in env variables:

- `LOG_LEVEL`: the log level
- `PORT`: the server port
- `KAFKA_URL`: comma separated Kafka hosts
- `KAFKA_GROUP_ID`: the Kafka group id
- `KAFKA_CLIENT_CERT`: Kafka connection certificate, optional;
    if not provided, then SSL connection is not used, direct insecure connection is used;
    if provided, it can be either path to certificate file or certificate content
- `KAFKA_CLIENT_CERT_KEY`: Kafka connection private key, optional;
    if not provided, then SSL connection is not used, direct insecure connection is used;
    if provided, it can be either path to private key file or private key content
- `CORONA_TOPIC`: corona topic to listen
- `CACHED_EVENTS_MAX_DAYS_BACK`: max days back to cache events
- `CACHED_EVENTS_CLEAR_PERIOD`: period to clear expired cached events, in milliseconds
- `CACHED_EVENTS_SEND_BATCH`: batch size of cached events to send to client
- `CACHED_EVENTS_SEND_PERIOD`: period to send cached events to client, in milliseconds
- `USER_COUNT_URL`: URL to get user count
- `CHALLENGE_COUNT_URL`: URL to get challenge count
- `TOTAL_PAYMENT_URL`: URL to get total payment

## UI Configuration

Configuration for the UI is at `ui/src/config/index.js`.
The following parameters can be set in config file or in env variables:

- `SERVER_URL`: The URL for the server
- `GOOGLE_MAP_KEY`: Google Map API key

Additionally, the config file includes the following UI working parameters (max days back of events displayed on the map, allowed event types, ignored event types, etc.).

New variables can added to the configuration file directly. But in order to make them configurable from the environment, the Webpack configuration needs to be updated (this is necessary because `process.env` doesn't exist in the browser). See Webpack configuration files in `ui/config/webpack/` to see how `SERVER_URL` is set.
Then the new variable can be added to the relevant NPM script (see how `SERVER_URL` is set in `ui/package.json` scripts).

## Local Kafka setup

- `http://kafka.apache.org/quickstart` contains details to setup and manage Kafka server,
  below provides details to setup Kafka server in Mac, Windows will use bat commands in bin/windows instead
- download kafka at `http://kafka.apache.org/downloads`
- extract out the doanlowded file
- go to extracted directory
- start ZooKeeper server:
  `bin/zookeeper-server-start.sh config/zookeeper.properties`
- use another terminal, go to same directory, start the Kafka server:
  `bin/kafka-server-start.sh config/server.properties`
- note that the zookeeper server is at localhost:2181, and Kafka server is at localhost:9092
- use another terminal, go to same directory, create some topics:
  `bin/kafka-topics.sh --create --zookeeper localhost:2181 --replication-factor 1 --partitions 1 --topic corona.saturate.create`
- verify that the topics are created:
  `bin/kafka-topics.sh --list --zookeeper localhost:2181`,
  it should list out the created topics

## NPM Commands

```bash
npm install # this installs both the server and UI dependencies

# Code Quality (server and UI have different linters)
npm run lint:server # Standard JS linter
npm run lint:fix:server
npm run lint:ui # Air BnB Linter
npm run lint:fix:ui
```

## UI Development

After proper configuration (see sections above) and running `npm install`:

```bash
npm run dev
```

This will build the development distribution for the UI. It will rebuild on change on the UI `src` files and also reload the browser on change (using BrowserSync).
This will also run the server. The two processes will run concurrently.
Because of the BrowserSync configuration, the UI will be available at `http://localhost:3100` (not `http://localhost:3000`).

## Local Deployment

After proper configuration (see sections above) and running `npm install`:

```bash
npm start
```

This will build the production distribution for the UI and run the server. The UI will be available at `http://localhost:3000`.

## Notes

- If consuming Kafka to get events for every client connection, this is inefficient if there are many concurrent users;
  Instead, in the src/app.js, there is a global cached events array holding the last 7 days events (configurable by `CACHED_EVENTS_MAX_DAYS_BACK`);
  Each client connection will at first retrieve the cached events, then for new event arrived later after client connected, it will be immediately sent to client;
  so the Kafka calls are minimal, there is only one consumer connection to Kafka, no matter how many concurrent users.

## Verification

- setup local kafka server as above
- start viewer app
- run `node script/init-events` to add some past events
- run `node script/send-event {index}`, where {index} is 0-4, to add some latest events
- check viewer UI
