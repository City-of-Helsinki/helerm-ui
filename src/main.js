import React from 'react';
import ReactDOM from 'react-dom';
import { browserHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import PiwikReactRouter from 'piwik-react-router';
import Raven from 'raven-js';

import createStore from './store/createStore';
import AppContainer from './containers/AppContainer';

// Piwik Configuration
const piwik = PiwikReactRouter({
  url: process.env.PIWIK_URL,
  siteId: process.env.PIWIK_ID
});

// Sentry config
if (SENTRY_DSN) {
  Raven.config(SENTRY_DSN).install();
}

// ========================================================
// Store Instantiation
// ========================================================
const initialState = window.___INITIAL_STATE__;
export const store = createStore(initialState);
const history = syncHistoryWithStore(piwik.connectToHistory(browserHistory), store);
// ========================================================
// Render Setup
// ========================================================
const MOUNT_NODE = document.getElementById('root');

let render = () => {
  const routes = require('./routes').default(store);

  ReactDOM.render(
    <AppContainer history={history} store={store} routes={routes}/>,
    MOUNT_NODE
  );
};

// This code is excluded from production bundle
if (__DEV__) {
  if (module.hot) {
    // Development render functions
    const renderApp = render;
    const renderError = (error) => {
      const RedBox = require('redbox-react').default;

      ReactDOM.render(<RedBox error={error}/>, MOUNT_NODE);
    };

    // Wrap render in try/catch
    render = () => {
      try {
        renderApp();
      } catch (error) {
        renderError(error);
      }
    };

    // Setup hot module replacement
    module.hot.accept('./routes.js', () =>
      setImmediate(() => {
        ReactDOM.unmountComponentAtNode(MOUNT_NODE);
        render();
      })
    );
  }
}

// ========================================================
// Go!
// ========================================================
try {
  render();
} catch (err) {
  if (Raven.isSetup() && SENTRY_REPORT_DIALOG) {
    Raven.captureException(err);
    Raven.showReportDialog();
  } else {
    throw err;
  }
}
