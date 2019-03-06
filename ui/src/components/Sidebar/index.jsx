import React from 'react';
import Chart from 'components/Chart';
import Stats from 'components/Stats';
import TrackSelection from 'components/TrackSelection';
import OperationSelection from 'components/OperationSelection';
import logo from 'assets/logo.svg';
import styles from './styles.scss';

const Sidebar = () => (
  <aside className={styles.Sidebar}>
    <div className={styles.topSection}>
      <div className={styles.logo}>
        <img src={logo} alt="logo" />
      </div>
      <Chart />
      <Stats />
    </div>
    <TrackSelection />
    <OperationSelection />
  </aside>
);

export default Sidebar;
