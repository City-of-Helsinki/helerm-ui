/* eslint-disable no-underscore-dangle */

import createStore from './store/createStore';

// ========================================================
// Store Instantiation
// ========================================================

const initialState = window.___INITIAL_STATE__;

// eslint-disable-next-line import/prefer-default-export
export const store = createStore(initialState);
