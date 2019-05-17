/**
 * The application entry point
 */

global.Promise = require('bluebird')

const config = require('config')
const express = require('express')
const cors = require('cors')
const path = require('path')
const http = require('http')
const Kafka = require('no-kafka')
const moment = require('moment')
const _ = require('lodash')

const logger = require('./common/logger')
const helper = require('./common/helper')

// setup express app
const app = express()
const server = http.Server(app)
const io = require('socket.io')(server)

app.set('port', config.PORT)
app.use(express.static(path.join(__dirname, '../ui/dist')))
app.use(cors())
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../ui/dist/index.html'))
})
app.use((req, res) => {
  res.status(404).json({ error: 'route not found' })
})

// cached events, latest one is stored at the end of array
const CACHED_EVENTS = []

// start Kafka consumer
logger.info('Start Kafka consumer.')
// create consumer
const options = helper.getKafkaOptions()
// start from beginning if there is no commit offset yet
options.startingOffset = Kafka.EARLIEST_OFFSET
const consumer = new Kafka.GroupConsumer(options)

// data handler
const dataHandler = (messageSet, topic, partition) => {
  let offsetToCommit

  const minDate = helper.getMinDate()

  for (const m of messageSet) {
    const messageStr = m.message.value.toString('utf8')
    logger.info(`Handle Kafka event message; Topic: ${topic}; Partition: ${partition}; Offset: ${
      m.offset}; Message: ${messageStr}.`)
    let messageJSON
    try {
      messageJSON = JSON.parse(messageStr)
    } catch (e) {
      logger.error('Invalid message JSON.')
      logger.logFullError(e)
      // ignore the message
      continue
    }
    if (messageJSON.topic !== topic) {
      logger.error(`The message topic ${messageJSON.topic} doesn't match the Kafka topic ${topic}.`)
      // ignore the message
      continue
    }

    const payload = messageJSON.payload
    if (payload && payload.createdAt) {
      const date = moment.utc(payload.createdAt).toDate()
      if (date.getTime() < minDate) {
        // The event is too old, don't need it anymore, commit offset so it will not be consumed again
        offsetToCommit = m.offset
      } else {
        // immediately send to all connected clients
        io.sockets.send(JSON.stringify(payload))

        // cache the event
        CACHED_EVENTS.push({
          topic,
          partition,
          offset: m.offset,
          payload
        })
      }
    }
  }

  if (offsetToCommit) {
    logger.info(`Commit offset, Topic: ${topic}; Partition: ${partition}; Offset: ${offsetToCommit}.`)
    return consumer.commitOffset({ topic, partition, offset: offsetToCommit })
  } else {
    return Promise.resolve()
  }
}

// init consumer
consumer
  .init([{
    subscriptions: [config.CORONA_TOPIC],
    handler: dataHandler
  }])
  .catch((err) => logger.logFullError(err))

// clear expired cached events periodically
async function clearCachedEvents () {
  const expiredEvents = []
  let cutPosition

  const minDate = helper.getMinDate()

  for (let i = 0; i < CACHED_EVENTS.length; i++) {
    const date = moment.utc(CACHED_EVENTS[i].payload.createdAt).toDate()
    if (date.getTime() < minDate) {
      expiredEvents.push(CACHED_EVENTS[i])
      cutPosition = i
    } else {
      break
    }
  }

  if (_.isNumber(cutPosition)) {
    CACHED_EVENTS.splice(0, cutPosition + 1)
  }

  for (const e of expiredEvents) {
    logger.info(`Commit expired event offset, Topic: ${e.topic}; Partition: ${e.partition}; Offset: ${e.offset}.`)
    await consumer.commitOffset(_.pick(e, 'topic', 'partition', 'offset'))
  }
}
setInterval(() => {
  logger.info('Start to clear expired cached events.')
  clearCachedEvents()
    .then(() => logger.info('Successfully clear expired cached events.'))
    .catch((error) => logger.logFullError(error))
}, Number(config.CACHED_EVENTS_CLEAR_PERIOD))

io.on('connection', client => {
  // when a new client connects, we need send the cached events to it
  // (while for new event arrived later after client connected, it will be immediately sent to client)

  const events = [].concat(CACHED_EVENTS) // make a shallow copy of the cached events

  // send cached events to client periodically
  let sendEventInterval = setInterval(() => {
    const toSend = events.splice(0, config.CACHED_EVENTS_SEND_BATCH)
    if (toSend.length) {
      logger.info('Send cached events to client.')
      client.send(JSON.stringify(toSend.map(s => s.payload)))
    }
    if (!events.length) {
      cleanUp() // Finished sending cached events
    }
  }, Number(config.CACHED_EVENTS_SEND_PERIOD))

  const cleanUp = () => {
    logger.info('Clean up client.')
    if (sendEventInterval) {
      clearInterval(sendEventInterval)
      sendEventInterval = null
    }
  }
  client.on('disconnect', (reason) => {
    logger.info(`Disconnect client, ${reason}`)
    cleanUp()
  })
  client.on('error', (error) => {
    logger.error('Got error:')
    logger.logFullError(error)
    cleanUp()
  })
})

server.listen(app.get('port'), () => {
  logger.info(`Express server listening on port ${app.get('port')}`)
})
