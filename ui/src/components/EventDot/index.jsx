import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import styles from './styles.scss';


const EventDot = ({ active, displayEventBox, eventLoc }) => (
  <button
    onClick={() => {
      if (active) {
        return;
      }
      displayEventBox(eventLoc);
    }}
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
  eventLoc: PropTypes.shape().isRequired,
};

export default EventDot;
