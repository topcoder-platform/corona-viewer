import React from 'react';
import styles from './styles.scss';

class OperationSelection extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      operationSelection: {
        submissions: true,
        review: true,
        registration: true,
        forum: true,
        view: true,
        srm: true,
      },
    };
    this.toggleOperation = this.toggleOperation.bind(this);
  }

  toggleOperation(operationName) {
    const { operationSelection } = this.state;
    const log = `Toggling ${operationName} event operation (active: ${!operationSelection[operationName]})`;
    console.log(log); // eslint-disable-line
    this.setState((prevState) => {
      const newOperationSelection = { ...prevState.operationSelection };
      newOperationSelection[operationName] = !newOperationSelection[operationName];
      return { operationSelection: newOperationSelection };
    });
  }

  render() {
    const { operationSelection } = this.state;
    return (
      <div className={styles.OperationSelection}>
        <h3>SHOW ON MAP</h3>
        <ul className={styles.operation}>
          <li>
            <button
              onClick={() => this.toggleOperation('submissions')}
              className={operationSelection.submissions ? styles.active : null}
              type="button"
            >
              <span>SUBMISSIONS</span>
              <i />
            </button>
          </li>
          <li>
            <button
              onClick={() => this.toggleOperation('review')}
              className={operationSelection.review ? styles.active : null}
              type="button"
            >
              <span>REVIEW</span>
              <i />
            </button>
          </li>
          <li>
            <button
              onClick={() => this.toggleOperation('registration')}
              className={operationSelection.registration ? styles.active : null}
              type="button"
            >
              <span>REGISTRATION</span>
              <i />
            </button>
          </li>
          <li>
            <button
              onClick={() => this.toggleOperation('forum')}
              className={operationSelection.forum ? styles.active : null}
              type="button"
            >
              <span>FORUM</span>
              <i />
            </button>
          </li>
          <li>
            <button
              onClick={() => this.toggleOperation('view')}
              className={operationSelection.view ? styles.active : null}
              type="button"
            >
              <span>VIEW</span>
              <i />
            </button>
          </li>
          <li>
            <button
              onClick={() => this.toggleOperation('srm')}
              className={operationSelection.srm ? styles.active : null}
              type="button"
            >
              <span>SRM</span>
              <i />
            </button>
          </li>
        </ul>
      </div>
    );
  }
}

export default OperationSelection;
