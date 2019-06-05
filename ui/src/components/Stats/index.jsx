import React from 'react';
import _ from 'lodash';
import getStatistics from 'services/StatisticsService';
import styles from './styles.scss';

/**
 * The statistics component.
 */
class Stats extends React.Component {
  /**
   * Constructor.
   * @param {Object} props the component properties
   */
  constructor(props) {
    super(props);
    this.state = {
      data: {},
    };
  }

  /**
   * Called when component is mounted.
   */
  componentDidMount() {
    const that = this;
    getStatistics()
      .then(data => that.setState({ data }))
      // eslint-disable-next-line
      .catch(err => console.log(`Failed to get statistics: ${err.message}`));
  }

  /**
   * Render component.
   * @returns {Object} rendered component
   */
  render() {
    const {
      data,
    } = this.state;

    const formatNumber = (n) => {
      if (_.isNil(n)) {
        return '';
      }
      const v = Number(n);
      if (v >= 1000000) {
        return `${(v / 1000000).toFixed(2)}M`;
      }
      if (v >= 1000) {
        const s1 = `${Math.floor(v / 1000)},`;
        const s2 = String(v % 1000);
        let padLen;
        if (v % 1000 >= 100) {
          padLen = 0;
        } else if (v % 1000 >= 10) {
          padLen = 1;
        } else {
          padLen = 2;
        }
        return `${s1}${_.repeat('0', padLen)}${s2}`;
      }
      return String(v);
    };

    return (
      <div className={styles.Stats}>
        <div className={styles.statistic}>
          <strong>
            {formatNumber(data.userCount)}
          </strong>
          <small>MEMBERS</small>
        </div>
        <div className={styles.statistic}>
          <strong>{formatNumber(data.challengeCount)}</strong>
          <small>CHALLENGES</small>
        </div>
        <div className={styles.statistic}>
          <strong>
            {`$${formatNumber(data.totalPayment)}`}
          </strong>
          <small>IN PRIZES</small>
        </div>
      </div>
    );
  }
}

export default Stats;
