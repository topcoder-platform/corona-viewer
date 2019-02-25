# TopCoder Events Viewer

## Prerequisites

- NodeJS (v10)
- Redis (v5)


## Configuration

Configuration for the application is at `config/default.js`.
The following parameters can be set in config file or in env variables:

- LOG_LEVEL: the log level
- PORT: the server port
- REDIS_HOST: Redis host
- REDIS_PORT: Redis port
- REDIS_EVENT_LIST_KEY: Redis event list key
- MAX_CACHED_EVENTS: max count of events to cache
- GLOBAL_EVENTS_SYNC_PERIOD: period to sync global events with Redis events list, in milliseconds
- CLIENT_EVENTS_SYNC_PERIOD: period to sync client specific events with global events, in milliseconds
- NEXT_CLIENT_EVENT_PERIOD: period to send next event to client, in milliseconds


## Redis setup

- below are verified in Mac
- download Redis from `http://download.redis.io/releases/redis-5.0.3.tar.gz`
- extract out the content
- go to extracted folder
- run `make`
- go to `src` folder
- run `./redis-server` to start Redis server
- in the `src` folder, you may run `./redis-cli` to start a Redis client to interact with the server


## Local Deployment

- Install dependencies `npm install`
- Run lint `npm run lint`
- Run lint fix `npm run lint:fix`
- Start app `npm start`
- App is running at `http://localhost:3000`


## Verification

- follow corona/README.md to setup corona app
- this app and corona app should use same Redis server and same events list key in Redis
- start both corona app and this app
- follow corona/README.md to send messages to Kafka, then corona app will consume them and put coressponding events to Redis
  !!IMPORTANT!!:
  when sending messages to Kafka, timestamp fields should be incremented one by one;
  for messages of same timestamp, they must have some difference, NOT exactly same messages of same timestamp;
  otherwise this app may not detect the new message.
- then this app will consume the events in Redis and send events to front end via web socket
- browse front end UI (`http://localhost:3000`), it will show the events details; screen shot: `https://ibb.co/xJ03d5T`
- if the front end UI is opened via Chrome, the Chrome console will also show the got events details; screen shot: `https://ibb.co/41kVBHw`
- you may send more messages to Kafka, then finally the UI will show corresponding events one by one


## Notes

- If calling Redis to get events for every client connection, this is inefficient if there are many concurrent users;
  Instead, in the src/app.js, there is a global events array refreshed periodically to sync with Redis latest events,
  and each client connection will sync its local events with this global events,
  so the Redis calls are minimal, there is only global sync calls of Redis, no matter how many concurrent users.

