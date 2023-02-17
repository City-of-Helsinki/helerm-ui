/** @jsxRuntime classic */
import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import 'fast-text-encoding';
import React from 'react';
import ReactDOM from 'react-dom';
import { createBrowserHistory } from 'history';
import PiwikReactRouter from 'piwik-react-router';
import * as Sentry from "@sentry/react";
import { BrowserTracing } from '@sentry/tracing';
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
Sentry.init({
  dsn: config.SENTRY_DSN,
  integrations: [new BrowserTracing()],
  tracesSampler: 1.0
});

// ========================================================
// Store Instantiation
// ========================================================
const browserHistory = createBrowserHistory();
const initialState = window.___INITIAL_STATE__;
export const store = createStore(browserHistory, initialState);
const history = piwik.connectToHistory(browserHistory);

// // ========================================================
// // Go!
// // ========================================================
const routes = require('./routes').default(store);

ReactDOM.render(
  <AppContainer history={history} store={store} routes={routes} />,
  document.getElementById('root')
);

