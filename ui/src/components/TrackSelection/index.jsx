import React from 'react';
import styles from './styles.scss';

class TrackSelection extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      trackSelection: {
        design: true,
        development: true,
        dataScience: true,
        algorithm: true,
      },
    };
    this.toggleTrack = this.toggleTrack.bind(this);
  }

  toggleTrack(trackName) {
    const { trackSelection } = this.state;
    const log = `Toggling ${trackName} track (active: ${!trackSelection[trackName]})`;
    console.log(log); // eslint-disable-line
    this.setState((prevState) => {
      const newTrackSelection = { ...prevState.trackSelection };
      newTrackSelection[trackName] = !newTrackSelection[trackName];
      return { trackSelection: newTrackSelection };
    });
  }

  render() {
    const { trackSelection } = this.state;
    return (
      <div className={styles.TrackSelection}>
        <h3>TRACKS</h3>
        <ul className={styles.track}>
          <li className={styles.design}>
            <button
              onClick={() => this.toggleTrack('design')}
              className={trackSelection.design ? styles.active : null}
              type="button"
            >
              <i />
              <span>DESIGN</span>
            </button>
          </li>
          <li className={styles.development}>
            <button
              onClick={() => this.toggleTrack('development')}
              className={trackSelection.development ? styles.active : null}
              type="button"
            >
              <i />
              <span>DEVELOPMENT</span>
            </button>
          </li>
          <li className={styles.dataScience}>
            <button
              onClick={() => this.toggleTrack('dataScience')}
              className={trackSelection.dataScience ? styles.active : null}
              type="button"
            >
              <i />
              <span>DATA SCIENCE</span>
            </button>
          </li>
          <li className={styles.algorithm}>
            <button
              onClick={() => this.toggleTrack('algorithm')}
              className={trackSelection.algorithm ? styles.active : null}
              type="button"
            >
              <i />
              <span>ALGORITHM</span>
            </button>
          </li>
        </ul>
      </div>
    );
  }
}

export default TrackSelection;
