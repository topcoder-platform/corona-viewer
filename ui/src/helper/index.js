import {
  MAX_DAYS_BACK,
} from 'config/index';

export const cacheDateSpan = 24 * 60 * 60 * 1000 * Number(MAX_DAYS_BACK);

/**
 * Get the min date elegible to cache
 * @returns {Number} min date in milliseconds
 */
export const getMinDate = () => {
  const current = new Date();
  return (new Date(current.getFullYear(), current.getMonth(), current.getDate())).getTime()
    - cacheDateSpan;
};
