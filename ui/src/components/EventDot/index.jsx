import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import styles from './styles.scss';


const EventDot = ({ active, displayEventBox, event }) => (
  <button
    onClick={() => displayEventBox(event)}
    className={classNames({
      [`${styles.EventDot}`]: true,
      [`${styles.active}`]: active,
    })}
    type="button"
  >
    <div className={styles.inner} />
  </button>
);

EventDot.defaultProps = {
  active: false,
};

EventDot.propTypes = {
  active: PropTypes.bool,
  displayEventBox: PropTypes.func.isRequired,
  event: PropTypes.shape().isRequired,
};

export default EventDot;
