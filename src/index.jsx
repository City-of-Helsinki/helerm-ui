/* eslint-disable import/no-cycle */
/* eslint-disable import/prefer-default-export */
/* eslint-disable no-underscore-dangle */
/** @jsxRuntime classic */
import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import 'fast-text-encoding';
import React from 'react';
import ReactDOM from 'react-dom';
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/browser';
import { registerLocale, setDefaultLocale } from 'react-datepicker';
import fi from 'date-fns/locale/fi';

import AppContainer from './containers/AppContainer';
import config from './config';
import routes from './routes';
import { store, browserHistory } from './init'

// Register a locale for all datepickers in the application
registerLocale('fi', fi);
setDefaultLocale('fi');

// Sentry config
Sentry.init({
  dsn: config.SENTRY_DSN,
  integrations: [new BrowserTracing()],
  tracesSampler: 1.0,
});


// // ========================================================
// // Go!
// // ========================================================
ReactDOM.render(
  <AppContainer history={browserHistory} store={store} routes={routes(store)} />,
  document.getElementById('root'),
);
