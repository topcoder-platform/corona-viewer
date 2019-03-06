import React from 'react';
import ReactDOM from 'react-dom';
import App from 'components/App';

// Import CSS reset and Global Styles
import 'styles/global.scss';

const MOUNT_NODE = document.getElementById('root');

ReactDOM.render(
  <App />,
  MOUNT_NODE,
);
