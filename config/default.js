/**
 * The configuration file.
 */

module.exports = {
  LOG_LEVEL: process.env.LOG_LEVEL || 'debug',
  PORT: process.env.PORT || 3000,
  REDIS_CONNECTION: process.env.REDIS_CONNECTION,
  REDIS_EVENT_LIST_KEY: process.env.REDIS_EVENT_LIST_KEY || 'events',
  MAX_CACHED_EVENTS: process.env.MAX_CACHED_EVENTS || 10,
  // period to sync global events with Redis events list, in milliseconds
  GLOBAL_EVENTS_SYNC_PERIOD: process.env.GLOBAL_EVENTS_SYNC_PERIOD || 5000, // 5 seconds
  // period to sync client specific events with global events, in milliseconds
  CLIENT_EVENTS_SYNC_PERIOD: process.env.CLIENT_EVENTS_SYNC_PERIOD || 3000, // 3 seconds
  // period to send next event to client, in milliseconds
  NEXT_CLIENT_EVENT_PERIOD: process.env.NEXT_CLIENT_EVENT_PERIOD || 2000 // 2 seconds
}
