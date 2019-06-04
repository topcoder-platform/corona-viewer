/**
 * This service provides operation to get statistics
 */
const _ = require('lodash')
const config = require('config')
const request = require('superagent')
const logger = require('../common/logger')

/**
 * Get statistics field value.
 * @param {String} url the URL to get data
 * @param {String} field the field name
 * @returns {Object} the statistics field value
 */
async function getStatisticsFieldValue (url, field) {
  const res = await request.get(url).set('Content-Type', 'application/json')
  const record = _.get(res.body, '[0]')
  return record ? record[field] : null
}

/**
 * Get statistics.
 * @returns {Object} the statistics data
 */
async function getStatistics () {
  const userCount = await getStatisticsFieldValue(config.USER_COUNT_URL, 'user.count')
  const challengeCount = await getStatisticsFieldValue(config.CHALLENGE_COUNT_URL, 'challenge.count')
  const totalPayment = await getStatisticsFieldValue(config.TOTAL_PAYMENT_URL, 'user_payment.gross_amount')
  const data = { userCount, challengeCount, totalPayment }
  logger.debug(`Statistics data: ${JSON.stringify(data, null, 4)}`)
  return data
}

module.exports = {
  getStatistics
}
