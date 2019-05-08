# TopCoder Events Viewer

This codebase includes a NodeJS server (see `src/`) and a ReactJS UI (see `ui/`).

## Prerequisites

- NodeJS (v10)
- Redis (v5)

## Configuration

**Server Configuration**

Configuration for the application is at `src/config/default.js`.
The following parameters can be set in config file or in env variables:

- `LOG_LEVEL`: the log level
- `PORT`: the server port
- `REDIS_HOST`: Redis host
- `REDIS_PORT`: Redis port
- `REDIS_EVENT_LIST_KEY`: Redis event list key
- `MAX_CACHED_EVENTS`: max count of events to cache
- `GLOBAL_EVENTS_SYNC_PERIOD`: period to sync global events with Redis events list, in milliseconds
- `CLIENT_EVENTS_SYNC_PERIOD`: period to sync client specific events with global events, in milliseconds
- `NEXT_CLIENT_EVENT_PERIOD`: period to send next event to client, in milliseconds

**UI Configuration**

Configuration for the UI is at `ui/src/config/index.js`.
The following parameters can be set in config file or in env variables:

- `SERVER_URL`: The URL for the server
- `GOOGLE_MAP_KEY`: Google Map API key

Additionally, the config file includes the following UI working parameters (max number of events displayed on the map, allowed event types, ignored event types, etc.).

*Adding UI Configuration Variables*

New variables can added to the configuration file directly. But in order to make them configurable from the environment, the Webpack configuration needs to be updated (this is necessary because `process.env` doesn't exist in the browser). See Webpack configuration files in `ui/config/webpack/` to see how `SERVER_URL` is set. 
Then the new variable can be added to the relevant NPM script (see how `SERVER_URL` is set in `ui/package.json` scripts).


## Redis setup

- below are verified in Mac
- download Redis from `http://download.redis.io/releases/redis-5.0.3.tar.gz`
- extract out the content
- go to extracted folder
- run `make`
- go to `src` folder
- run `./redis-server` to start Redis server
- in the `src` folder, you may run `./redis-cli` to start a Redis client to interact with the server


## NPM Commands

```bash
npm install					# this installs both the server and UI dependencies

# Code Quality (server and UI have different linters)
npm run lint:server 		# Standard JS linter
npm run lint:fix:server
npm run lint:ui 			# Air BnB Linter
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

- If calling Redis to get events for every client connection, this is inefficient if there are many concurrent users;
  Instead, in the src/app.js, there is a global events array refreshed periodically to sync with Redis latest events,
  and each client connection will sync its local events with this global events,
  so the Redis calls are minimal, there is only global sync calls of Redis, no matter how many concurrent users.
