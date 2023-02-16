/** @jsxRuntime classic */
import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
// import 'fast-text-encoding/text';
import React from 'react';
import ReactDOM from 'react-dom';
import { createBrowserHistory } from 'history';
import PiwikReactRouter from 'piwik-react-router';
import Raven from 'raven-js';
import { registerLocale, setDefaultLocale } from 'react-datepicker';
import fi from 'date-fns/locale/fi';

import createStore from './store/createStore';
import AppContainer from './containers/AppContainer';
import { config } from './config';

// Piwik Configuration
const piwik = PiwikReactRouter({
  url: config.PIWIK_URL,
  siteId: config.PIWIK_ID
});

// Register a locale for all datepickers in the application
registerLocale('fi', fi);
setDefaultLocale('fi');

// Sentry config
if (config.SENTRY_DSN) {
  Raven.config(config.SENTRY_DSN).install();
}

// ========================================================
// Store Instantiation
// ========================================================
const browserHistory = createBrowserHistory();
const initialState = window.___INITIAL_STATE__;
export const store = createStore(browserHistory, initialState);
const history = piwik.connectToHistory(browserHistory);
// ========================================================
// Render Setup
// ========================================================
let render = () => {
  const routes = require('./routes').default(store);

  ReactDOM.render(
    <AppContainer history={history} store={store} routes={routes} />,
    document.getElementById('root')
  );
};

// ========================================================
// Go!
// ========================================================
try {
  render();
} catch (err) {
  if (Raven.isSetup() && config.SENTRY_REPORT_DIALOG) {
    Raven.captureException(err);
    Raven.showReportDialog();
  } else {
    throw err;
  }
}
