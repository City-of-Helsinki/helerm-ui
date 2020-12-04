import update from 'immutability-helper';
import { createAction, handleActions } from 'redux-actions';

import { config } from '../../config';
import { convertToTree } from '../../utils/helpers';
import { default as api } from '../../utils/api.js';

export const initialState = {
  includeRelated: false,
  isFetching: false,
  items: [],
  is_open: true,
  list: [],
  page: 1,
  timestamp: ''
};

export const PARSED_NAVIGATION = 'parsedNavigationAction';
export const REQUEST_NAVIGATION = 'requestNavigationAction';
export const RECEIVE_NAVIGATION = 'receiveNavigationAction';
export const SET_NAVIGATION_VISIBILITY = 'setNavigationVisibilityAction';
export const NAVIGATION_ERROR = 'navigationErrorAction';

export function requestNavigation() {
  return createAction(REQUEST_NAVIGATION)();
}

export function receiveNavigation(items, includeRelated, page) {
  return createAction(RECEIVE_NAVIGATION)({
    includeRelated,
    items,
    page
  });
}

export function parseNavigation(items) {
  const orderedTree = convertToTree(items);
  return createAction(PARSED_NAVIGATION)({
    items: orderedTree
  });
}

export function setNavigationVisibility(value) {
  return createAction(SET_NAVIGATION_VISIBILITY)(value);
}

export function fetchNavigation(includeRelated = false, page = 1) {
  const pageSize = includeRelated
    ? config.SEARCH_PAGE_SIZE
    : config.RESULTS_PER_PAGE;
  return function (dispatch, getState) {
    dispatch(requestNavigation());
    return api
      .get('classification', {
        include_related: includeRelated,
        page_size: pageSize,
        page
      })
      .then((response) => response.json())
      .then((json) => {
        dispatch(receiveNavigation(json.results, includeRelated, page));
        return json;
      })
      .then((json) => {
        const list = getState().navigation.list || [];
        return dispatch(
          json.next
            ? fetchNavigation(includeRelated, page + 1)
            : parseNavigation(list)
        );
      })
      .catch(() => dispatch(createAction(NAVIGATION_ERROR)()));
  };
}

const navigationErrorAction = (state) => {
  return update(state, {
    list: { $set: [] },
    isFetching: { $set: false },
    items: { $set: [] },
    timestamp: { $set: Date.now().toString() }
  });
};

const parsedNavigationAction = (state, { payload }) => {
  return update(state, {
    isFetching: { $set: false },
    items: { $set: payload.items },
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
    includeRelated: { $set: payload.includeRelated },
    list: payload.page > 1 ? { $push: payload.items } : { $set: payload.items },
    page: { $set: payload.page }
  });
};

const setNavigationVisibilityAction = (state, { payload }) => {
  return update(state, {
    is_open: { $set: payload }
  });
};

export default handleActions(
  {
    navigationErrorAction,
    parsedNavigationAction,
    requestNavigationAction,
    receiveNavigationAction,
    setNavigationVisibilityAction
  },
  initialState
);
