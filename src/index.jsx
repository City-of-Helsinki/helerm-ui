import 'fast-text-encoding';
import React from 'react';
import ReactDOM from 'react-dom/client';
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
if (config.SENTRY_DSN) {
  Sentry.init({
    dsn: config.SENTRY_DSN,
    environment: config.SENTRY_ENVIRONMENT,
    release: config.SENTRY_RELEASE,
    integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
    tracesSampleRate: parseFloat(config.SENTRY_TRACES_SAMPLE_RATE || '0'),
    tracePropagationTargets: (config.SENTRY_TRACE_PROPAGATION_TARGETS || '').split(','),
    replaysSessionSampleRate: parseFloat(config.SENTRY_REPLAYS_SESSION_SAMPLE_RATE || '0'),
    replaysOnErrorSampleRate: parseFloat(config.SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE || '0'),
  });
}

// // ========================================================
// // Go!
// // ========================================================
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(<AppContainer store={store} routes={routes(store)} />);
