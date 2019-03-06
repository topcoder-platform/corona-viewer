import React from 'react';
import styles from './styles.scss';

const Stats = () => (
  <div className={styles.Stats}>
    <div className={styles.statistic}>
      <strong>1,34M</strong>
      <small>MEMBERS</small>
    </div>
    <div className={styles.statistic}>
      <strong>12,525</strong>
      <small>NEW REGISTRATIONS</small>
    </div>
    <div className={styles.statistic}>
      <strong>245</strong>
      <small>CHALLENGES</small>
    </div>
    <div className={styles.statistic}>
      <strong>$358,436</strong>
      <small>IN PRIZES // LAST 7 DAYS</small>
    </div>
  </div>
);

export default Stats;
