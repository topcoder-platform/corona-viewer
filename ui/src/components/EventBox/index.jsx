import React from 'react';
import PropTypes from 'prop-types';
import logo from 'assets/logo.svg';
import styles from './styles.scss';

const operationMap = {
  USER_REGISTRATION: ' registered for the contest ',
  ADD_RESOURCE: ' was added to contest ',
  'CONTEST SUBMISSION': ' has uploaded a submission for the contest ',
};

const getPrizeStr = (arr) => {
  const formatted = arr.map(i => `$${String(i)}`);
  return formatted.join(', ');
};

const EventBox = ({ event }) => (
  <div className={styles.EventBox}>
    <div
      className={styles.bubbleAnchor}
    >
      {
        (
          event.type === 'USER_REGISTRATION'
          || event.type === 'ADD_RESOURCE'
          || event.type === 'CONTEST SUBMISSION'
        ) ? (
          <div className={styles.content}>
            <strong>
              @
              {event.handle}
            </strong>
            {operationMap[event.type]}
            <strong>
              {`"${event.challengeName}"`}
            </strong>
            &nbsp;in the&nbsp;
            <strong>
              {event.challengeType}
            </strong>
            &nbsp;track
            <div className={styles.userDetails}>
              {
                event.photoURL ? (
                  <img src={event.photoURL} alt="user" />
                ) : null
              }
              <small>
                {event.createdAtStr}
                { /* Add separator only if both date and location */ }
                {(event.createdAtStr && event.locationStr) ? <span>&nbsp;-&nbsp;</span> : null}
                {event.locationStr}
              </small>
            </div>
          </div>
          ) : null
      }
      {
        event.type === 'ACTIVATE_CHALLENGE' ? (
          <div className={styles.content}>
            Contest
            <strong>
              {` "${event.challengeName}" `}
            </strong>
            has just been launched in the&nbsp;
            <strong>
              {event.challengeType}
            </strong>
            &nbsp;track. The prize(s) are&nbsp;
            <strong>
              {getPrizeStr(event.challengePrizes)}
            </strong>
            <div className={styles.userDetails}>
              <img src={logo} alt="logo" />
              <small>
                {event.createdAtStr}
                { /* Add separator only if both date and location */ }
                {(event.createdAtStr && event.locationStr) ? <span>&nbsp;-&nbsp;</span> : null}
                {event.locationStr}
              </small>
            </div>
          </div>
        ) : null
      }
      {
        event.topic === 'notifications.autopilot.events' ? (
          <div className={styles.content}>
            <strong>
              {event.phaseTypeName}
            </strong>
            &nbsp;phase for contest&nbsp;
            <strong>
              {event.challengeName}
            </strong>
            &nbsp;in&nbsp;
            <strong>
              {event.challengeType}
            </strong>
            &nbsp;track has&nbsp;
            {event.phaseState === 'START' ? 'started' : 'ended'}
            <div className={styles.userDetails}>
              <img src={logo} alt="logo" />
              <small>
                {event.createdAtStr}
                { /* Add separator only if both date and location */ }
                {(event.createdAtStr && event.locationStr) ? <span>&nbsp;-&nbsp;</span> : null}
                {event.locationStr}
              </small>
            </div>
          </div>
        ) : null
      }
    </div>
  </div>
);

EventBox.propTypes = {
  event: PropTypes.shape().isRequired,
};

export default EventBox;
