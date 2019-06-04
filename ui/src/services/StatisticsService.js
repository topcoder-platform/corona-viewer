/*
 * Statistics service
 */
import {
  SERVER_URL,
} from 'config/index';
import request from 'superagent';

/**
 * Get statistics data
 * @returns {Promise} promise to get statistics data
 */
const getStatistics = () => request
  .get(`${SERVER_URL}/statistics`)
  .set('Content-Type', 'application/json')
  .then(res => res.body);

export default getStatistics;
