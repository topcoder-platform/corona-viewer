/**
 * Controller for statistics endpoint
 */
const service = require('../services/StatisticsService')

/**
 * Get statistics
 * @param {Object} req the request
 * @param {Object} res the response
 */
async function getStatistics (req, res) {
  res.send(await service.getStatistics())
}

module.exports = {
  getStatistics
}
