import React from 'react';
import chartData from './chartdata.json';
import styles from './styles.scss';

const Chart = () => (
  <div className={styles.Chart}>
    <div className={styles.inner}>
      {
        chartData.map((d, index) => (
          <div
            key={index} // eslint-disable-line react/no-array-index-key
            className={d.value === 0 ? styles.zero : null}
            style={{ height: `${d.value !== 0 ? d.value : null}%` }}
          >
            &nbsp;
          </div>
        ))
      }
    </div>
  </div>
);

export default Chart;
