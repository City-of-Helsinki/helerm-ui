import 'fast-text-encoding';
import React from 'react';
import ReactDOM from 'react-dom';
import * as Sentry from '@sentry/react';
import { registerLocale, setDefaultLocale } from 'react-datepicker';
import fi from 'date-fns/locale/fi';

import AppContainer from './containers/AppContainer';
import config from './config';
import routes from './routes';
import { store } from './init';

// Register a locale for all datepickers in the application
registerLocale('fi', fi);
setDefaultLocale('fi');

// Sentry config
Sentry.init({
  dsn: config.SENTRY_DSN,
  integrations: [Sentry.browserTracingIntegration()],
  tracesSampler: 1.0,
});

// // ========================================================
// // Go!
// // ========================================================
ReactDOM.render(<AppContainer store={store} routes={routes(store)} />, document.getElementById('root'));
