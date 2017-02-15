import fetch from 'isomorphic-fetch';
import update from 'immutability-helper';

import { convertToTree } from '../../../utils/helpers.js';

// ------------------------------------
// Constants
// ------------------------------------
export const REQUEST_NAVIGATION = 'navigation/REQUEST_NAVIGATION';
export const RECEIVE_NAVIGATION = 'navigation/RECEIVE_NAVIGATION';

export const SET_NAVIGATION_VISIBILITY = 'navigation/SET_NAVIGATION_VISIBILITY';

// ------------------------------------
// Actions
// ------------------------------------
export function requestNavigation() {
  return {
    type: REQUEST_NAVIGATION,
    isFetching: true
  };
}

export function receiveNavigation(items) {
  const orderedTree = convertToTree(items);
  return {
    type: RECEIVE_NAVIGATION,
    items: orderedTree
  };
}

export function setNavigationVisibility(value) {
  return {
    type: SET_NAVIGATION_VISIBILITY,
    value
  }
}

export function fetchNavigation() {
  return function(dispatch) {
    dispatch(requestNavigation());
    return fetch('https://api.hel.fi/helerm-test/v1/function/?page_size=2000')
      .then(response => response.json())
      .then(json =>
        dispatch(receiveNavigation(json))
      );
  };
}

export const actions = {
  requestNavigation,
  receiveNavigation,
  setNavigationVisibility,
  fetchNavigation
};

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [REQUEST_NAVIGATION]: (state, action) => {
    return update(state, {
      isFetching: {
        $set: true
      }
    });
  },
  [RECEIVE_NAVIGATION]: (state, action) => {
    return update(state, {
      navigation: {
        items: { $set: action.items },
        is_open: { $set: true }
      },
      isFetching: {
        $set: false
      }
    });
  },
  [SET_NAVIGATION_VISIBILITY]: (state, action) => {
    return update(state, {
      navigation: {
        is_open: { $set: action.value }
      }
    });
  }
};

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
  items: [],
  is_open: true
};

export default function navigationReducer(state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type];
  return handler ? handler(state, action) : state;
}
