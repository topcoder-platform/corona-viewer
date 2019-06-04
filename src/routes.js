/**
 * Contains all routes.
 */

module.exports = {
  '/statistics': {
    get: {
      controller: 'StatisticsController',
      method: 'getStatistics'
    }
  }
}
