/**
 * This file defines helper methods
 */
const _ = require('lodash')
const config = require('config')
const Redis = require('ioredis')

console.log(config.GLOBAL_EVENTS_SYNC_PERIOD)

const redis = new Redis(config.REDIS_CONNECTION)

/**
 * Get latest configured count of events from Redis. Latest one is stored at the end of array.
 * @returns {Array} the latest configured count of events from Redis
 */
async function getLatestEvents () {
  // get Redis list length
  const count = await redis.llen(config.REDIS_EVENT_LIST_KEY)
  if (count === 0) {
    return []
  }
  const max = Number(config.MAX_CACHED_EVENTS)
  let start = count - max
  if (start < 0) {
    start = 0
  }
  const end = count - 1
  const events = await redis.lrange(config.REDIS_EVENT_LIST_KEY, start, end)
  return events
}

/**
 * Compare client and global events to get new events.
 * For each events array, latest one is stored at the end of array.
 * New array is returned, input arrays won't change.
 *
 * @param {Array} clientEvents the client events
 * @param {Array} globalEvents the global events
 * @returns {Array} the new events
 */
function getNewEvents (clientEvents, globalEvents) {
  const oldOnes = clientEvents || []
  const newOnes = globalEvents || []
  if (oldOnes.length === 0) {
    return [].concat(newOnes)
  }
  const index = _.lastIndexOf(newOnes, oldOnes[oldOnes.length - 1])
  if (index < 0) {
    return [].concat(newOnes)
  }
  return newOnes.slice(index + 1)
}

module.exports = {
  getLatestEvents,
  getNewEvents
}
