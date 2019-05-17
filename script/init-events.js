/**
 * Init events in Kafka
 */
const config = require('config')
const Kafka = require('no-kafka')
const _ = require('lodash')

const helper = require('../src/common/helper')
const logger = require('../src/common/logger')

const sampleEvents = require('./events.json')
const countries = ['CHN', 'IND', 'RUS', 'BIH', 'POL', 'BRA', 'ESP', 'SAU', 'NGA']

const producer = new Kafka.Producer(helper.getKafkaOptions())

producer.init()
  .then(async () => {
    const events = []
    const minDate = helper.getMinDate()

    // Produce 100 events for each day back
    for (let i = 0; i < config.CACHED_EVENTS_MAX_DAYS_BACK + 1; i++) {
      for (let j = 0; j < 100; j++) {
        const event = _.cloneDeep(sampleEvents[j % sampleEvents.length])

        let k = j % 3 === 0 ? j : j - 1
        if (j % 10 < 3) {
          k = j - j % 10
        }
        const ts = minDate + i * 24 * 60 * 60 * 1000 +
          (k % 24) * 60 * 60 * 1000 + (k % 60) * 60 * 1000
        if (ts > Date.now()) {
          break
        }

        const timestamp = new Date(ts).toISOString()

        event.timestamp = event.payload.createdAt = timestamp

        if (event.payload.location) {
          event.payload.location = countries[((i + 1) * j) % countries.length]
        }
        events.push(event)
      }
    }
    _.sortBy(events, 'timestamp')

    events.unshift({
      ...sampleEvents[0],
      timestamp: new Date(0).toISOString(),
      payload: {
        ...sampleEvents[0].payload,
        createdAt: new Date(0).toISOString()
      }
    })

    const messages = events.map(e => ({
      topic: config.CORONA_TOPIC,
      message: { value: JSON.stringify(e) }
    }))
    await producer.send(messages)
  })
  .then(() => {
    logger.debug('Inited events')
  })
  .then(() => process.exit(0))
  .catch((err) => {
    logger.error(err)
    process.exit(1)
  })
