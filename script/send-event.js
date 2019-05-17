/**
 * Send one event to in Kafka
 */
const config = require('config')
const util = require('util')
const Kafka = require('no-kafka')

const helper = require('../src/common/helper')
const logger = require('../src/common/logger')

const sampleEvents = require('./events.json')

const idx = process.argv[2]
const event = sampleEvents[idx]

if (!event) {
  logger.error(`Only accept event index in [0, ${sampleEvents.length - 1}]`)
  process.exit(1)
}

// Use current timestamp
const timestamp = new Date().toISOString()
event.timestamp = event.payload.createdAt = timestamp

const producer = new Kafka.Producer(helper.getKafkaOptions())

producer.init()
  .then(() => producer.send({
    topic: config.CORONA_TOPIC,
    message: { value: JSON.stringify(event) }
  }))
  .then(() => {
    logger.debug(`Produced event ${util.inspect(event)}`)
  })
  .then(() => process.exit(0))
  .catch((err) => {
    logger.error(err)
    process.exit(1)
  })
