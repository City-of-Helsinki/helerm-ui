import update from 'immutability-helper';
import { createAction, handleActions } from 'redux-actions';

import { DEFAULT_PAGE_SIZE } from '../../../config/constants';

import { convertToTree } from '../../utils/helpers';
import { default as api } from '../../utils/api.js';

const initialState = {
  includeRelated: false,
  isFetching: false,
  items: [],
  is_open: true,
  timestamp: ''
};

export const REQUEST_NAVIGATION = 'requestNavigationAction';
export const RECEIVE_NAVIGATION = 'receiveNavigationAction';
export const SET_NAVIGATION_VISIBILITY = 'setNavigationVisibilityAction';
export const NAVIGATION_ERROR = 'navigationErrorAction';

export function requestNavigation () {
  return createAction(REQUEST_NAVIGATION)();
}

export function receiveNavigation (items, includeRelated) {
  const orderedTree = convertToTree(items);
  return createAction(RECEIVE_NAVIGATION)({
    items: orderedTree,
    includeRelated
  });
}

export function setNavigationVisibility (value) {
  return createAction(SET_NAVIGATION_VISIBILITY)(value);
}

export function fetchNavigation (includeRelated = false) {
  return function (dispatch) {
    dispatch(requestNavigation());
    return api.get('classification', { include_related: includeRelated, page_size: RESULTS_PER_PAGE || DEFAULT_PAGE_SIZE })
      .then(response => response.json())
      .then(json =>
        dispatch(receiveNavigation(json, includeRelated))
      )
      .catch(() => dispatch(createAction(NAVIGATION_ERROR)()));
  };
}

const navigationErrorAction = (state) => {
  return update(state, {
    isFetching: { $set: false },
    items: { $set : [] },
    timestamp: { $set: Date.now().toString() }
  });
};

const requestNavigationAction = (state) => {
  return update(state, {
    isFetching: {
      $set: true
    }
  });
};

const receiveNavigationAction = (state, { payload }) => {
  return update(state, {
    items: { $set: payload.items },
    includeRelated: { $set: payload.includeRelated },
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
  navigationErrorAction,
  requestNavigationAction,
  receiveNavigationAction,
  setNavigationVisibilityAction
}, initialState);
