/* eslint-disable import/no-named-as-default-member */
/* eslint-disable consistent-return */
/* eslint-disable camelcase */
import update from 'immutability-helper';
import { createAction, handleActions } from 'redux-actions';

import config from '../../config';
import { convertToTree } from '../../utils/helpers';
import api from '../../utils/api';

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

export function requestNavigation(value) {
  return createAction(REQUEST_NAVIGATION)(value);
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

  return (dispatch, getState) => {
    const includeRelatedAlreadySet = getState().navigation.includeRelated;
    const { isFetching } = getState().navigation;
    if (
      includeRelatedAlreadySet &&
      !includeRelated &&
      isFetching &&
      page === 1
    ) {
      // If we are in the middle of a recursive fetch, prevent firing another
      // search (e.g. returning immediately from bulkview to main page,
      // navigation tries to construct the classification tree menu
      // and another state update from a finishing recursive fetch crashes it).
      return;
    }
    dispatch(requestNavigation({ includeRelated }));
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

const navigationErrorAction = (state) => update(state, {
  list: { $set: [] },
  isFetching: { $set: false },
  items: { $set: [] },
  timestamp: { $set: Date.now().toString() }
});

const parsedNavigationAction = (state, { payload }) => update(state, {
  isFetching: { $set: false },
  items: { $set: payload.items },
  timestamp: { $set: Date.now().toString() }
});

const requestNavigationAction = (state, { payload }) => {
  let newState = {
    isFetching: {
      $set: true
    }
  };
  if (payload?.includeRelated) {
    newState = {
      ...newState,
      includeRelated: { $set: payload?.includeRelated }
    };
  }
  return update(state, newState);
};

const receiveNavigationAction = (state, { payload }) => update(state, {
  includeRelated: { $set: payload.includeRelated },
  list: payload.page > 1 ? { $push: payload.items } : { $set: payload.items },
  page: { $set: payload.page }
});

const setNavigationVisibilityAction = (state, { payload }) => update(state, {
  is_open: { $set: payload }
});

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
