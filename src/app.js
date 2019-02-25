/**
 * The application entry point
 */

global.Promise = require('bluebird')

const config = require('config')
const express = require('express')
const cors = require('cors')
const path = require('path')
const http = require('http')
const logger = require('./common/logger')
const helper = require('./common/helper')

// setup express app
const app = express()
const server = http.Server(app)
const io = require('socket.io')(server)

app.set('port', config.PORT)
app.use(express.static(path.join(__dirname, '../ui/dist/ui')))
app.use(cors())
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../ui/dist/ui/index.html'))
})
app.use((req, res) => {
  res.status(404).json({ error: 'route not found' })
})

// global events, latest one is stored at the end of array
let globalEvents = []
// sync global events with Redis periodically
async function globalSync () {
  globalEvents = await helper.getLatestEvents()
}
setInterval(() => {
  logger.info('Start to sync global events.')
  globalSync()
    .then(() => logger.info('Successfully sync global events.'))
    .catch((error) => logger.logFullError(error))
}, Number(config.GLOBAL_EVENTS_SYNC_PERIOD))

io.on('connection', client => {
  const maxEvents = Number(config.MAX_CACHED_EVENTS)
  // client specific events, latest one is stored at the end of array,
  // initially it is a copy of global events
  let events = [].concat(globalEvents)
  // index of next event to send to client
  let index = 0

  // sync client specific events with global events periodically
  let clientSyncInterval = setInterval(() => {
    logger.info('Sync client events with global events.')
    // compare global events with client events to get new events
    const newEvents = helper.getNewEvents(events, globalEvents)
    // update client specific data
    if (newEvents.length > 0) {
      events = events.concat(newEvents)
      if (events.length > maxEvents) {
        let cutCount = events.length - maxEvents
        if (index < cutCount) {
          cutCount = index
        }
        if (cutCount > 0) {
          events = events.slice(cutCount)
          index -= cutCount
        }
      }
    }
  }, Number(config.CLIENT_EVENTS_SYNC_PERIOD))

  // send event to client periodically
  let sendEventInterval = setInterval(() => {
    if (index < events.length) {
      logger.info('Send event to client.')
      client.send(events[index])
      index += 1
    }
  }, Number(config.NEXT_CLIENT_EVENT_PERIOD))

  const cleanUp = () => {
    logger.info('Clean up client.')
    if (clientSyncInterval) {
      clearInterval(clientSyncInterval)
      clientSyncInterval = null
    }
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
