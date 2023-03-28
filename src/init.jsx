/* eslint-disable no-underscore-dangle */
import PiwikReactRouter from 'piwik-react-router';
import { createBrowserHistory } from 'history';

import config from './config';
import createStore from './store/createStore';

// ========================================================
// Store Instantiation
// ========================================================

// Piwik Configuration
const piwik = PiwikReactRouter({
    url: config.PIWIK_URL,
    siteId: config.PIWIK_ID,
  });

const browserHistory = createBrowserHistory();
const initialState = window.___INITIAL_STATE__;

export const store = createStore(browserHistory, initialState);

export const history = piwik.connectToHistory(browserHistory);