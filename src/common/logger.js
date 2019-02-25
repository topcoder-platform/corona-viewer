/**
 * This module contains the winston logger configuration.
 */

const util = require('util')
const config = require('config')
const { createLogger, format, transports } = require('winston')

const logger = createLogger({
  level: config.LOG_LEVEL,
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      )
    })
  ]
})

/**
 * Log error details with signature
 * @param err the error
 * @param signature the signature
 */
logger.logFullError = (err, signature) => {
  if (!err) {
    return
  }
  if (signature) {
    logger.error(`Error happened in ${signature}`)
  }
  logger.error(util.inspect(err))
  if (!err.logged) {
    logger.error(err.stack)
    err.logged = true
  }
}

module.exports = logger
