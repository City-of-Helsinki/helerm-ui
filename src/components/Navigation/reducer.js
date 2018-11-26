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

export function requestNavigation (includeRelated) {
  return createAction(REQUEST_NAVIGATION)(includeRelated);
}

export function receiveNavigation (items) {
  const orderedTree = convertToTree(items);
  return createAction(RECEIVE_NAVIGATION)(orderedTree);
}

export function setNavigationVisibility (value) {
  return createAction(SET_NAVIGATION_VISIBILITY)(value);
}

export function fetchNavigation (includeRelated = false) {
  return function (dispatch) {
    dispatch(requestNavigation(includeRelated));
    return api.get('classification', { include_related: includeRelated, page_size: RESULTS_PER_PAGE || DEFAULT_PAGE_SIZE })
      .then(response => {
        if (!response.ok) {
          dispatch(createAction(NAVIGATION_ERROR)());
          throw Error(`Virhe luokittelupuun haussa: ${response.statusText}`);
        }
        return response.json();
      })
      .then(json =>
        dispatch(receiveNavigation(json))
      );
  };
}

const navigationErrorAction = (state) => {
  return update(state, {
    isFetching: { $set: false },
    items: { $set : [] },
    timestamp: { $set : '' }
  });
};

const requestNavigationAction = (state, { payload }) => {
  return update(state, {
    includeRelated: { $set: payload },
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
  navigationErrorAction,
  requestNavigationAction,
  receiveNavigationAction,
  setNavigationVisibilityAction
}, initialState);
