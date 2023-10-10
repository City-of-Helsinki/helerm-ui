/* eslint-disable no-underscore-dangle */
import { createBrowserHistory } from 'history';

import createStore from './store/createStore';

// ========================================================
// Store Instantiation
// ========================================================

export const browserHistory = createBrowserHistory();
const initialState = window.___INITIAL_STATE__;

export const store = createStore(browserHistory, initialState);
