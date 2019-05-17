/**
 * The configuration file.
 */

module.exports = {
  LOG_LEVEL: process.env.LOG_LEVEL || 'debug',
  PORT: process.env.PORT || 3000,

  KAFKA_URL: process.env.KAFKA_URL || 'localhost:9092',
  KAFKA_GROUP_ID: process.env.KAFKA_GROUP_ID || 'corona-viewer-group',
  // below two params are used for secure Kafka connection, they are optional
  // for the local Kafka, they are not needed
  KAFKA_CLIENT_CERT: process.env.KAFKA_CLIENT_CERT,
  KAFKA_CLIENT_CERT_KEY: process.env.KAFKA_CLIENT_CERT_KEY,

  // corona topic to listen
  CORONA_TOPIC: process.env.CORONA_TOPIC || 'corona.saturate.create',

  // max days back of cached events
  CACHED_EVENTS_MAX_DAYS_BACK: process.env.CACHED_EVENTS_MAX_DAYS_BACK || 7,
  // period to clear expired cached events, in milliseconds
  CACHED_EVENTS_CLEAR_PERIOD: process.env.CACHED_EVENTS_CLEAR_PERIOD || 5000, // 5 seconds

  // batch size of cached events to send to client
  CACHED_EVENTS_SEND_BATCH: process.env.CACHED_EVENTS_SEND_BATCH || 100,
  // period to send cached events to client, in milliseconds
  CACHED_EVENTS_SEND_PERIOD: process.env.CACHED_EVENTS_SEND_PERIOD || 1000 // 1 second
}
