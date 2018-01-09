import update from 'immutability-helper';
import { createAction, handleActions } from 'redux-actions';

import { convertToTree } from '../../utils/helpers';
import { default as api } from '../../utils/api.js';

const initialState = {
  isFetching: false,
  items: [],
  is_open: true,
  timestamp: ''
};

export const REQUEST_NAVIGATION = 'requestNavigationAction';
export const RECEIVE_NAVIGATION = 'receiveNavigationAction';
export const SET_NAVIGATION_VISIBILITY = 'setNavigationVisibilityAction';

export function requestNavigation () {
  return createAction(REQUEST_NAVIGATION)();
}

export function receiveNavigation (items) {
  const orderedTree = convertToTree(items);
  return createAction(RECEIVE_NAVIGATION)(orderedTree);
}

export function setNavigationVisibility (value) {
  return createAction(SET_NAVIGATION_VISIBILITY)(value);
}

export function fetchNavigation () {
  return function (dispatch) {
    dispatch(requestNavigation());
    return api.get('classification', { page_size: RESULTS_PER_PAGE })
      .then(response => response.json())
      .then(json =>
        dispatch(receiveNavigation(json))
      );
  };
}

const requestNavigationAction = (state) => {
  return update(state, {
    isFetching: {
      $set: true
    }
  });
};

const receiveNavigationAction = (state, { payload }) => {
  return update(state, {
    items: { $set: payload },
    isFetching: { $set: false },
    timestamp: { $set: Date.now().toString() }
  });
};

const setNavigationVisibilityAction = (state, { payload }) => {
  return update(state, {
    is_open: { $set: payload }
  });
};

export default handleActions({
  requestNavigationAction,
  receiveNavigationAction,
  setNavigationVisibilityAction
}, initialState);
