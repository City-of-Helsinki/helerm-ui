import fetch from 'isomorphic-fetch';
import update from 'immutability-helper';
import LTT from 'list-to-tree';
import { orderBy } from 'lodash';
// ------------------------------------
// Constants
// ------------------------------------
export const REQUEST_NAVIGATION = 'REQUEST_NAVIGATION';
export const RECEIVE_NAVIGATION = 'RECEIVE_NAVIGATION';

export const SELECT_TOS = 'SELECT_TOS';
export const REQUEST_TOS = 'REQUEST_TOS';
export const RECEIVE_TOS = 'RECEIVE_TOS';

export const TOGGLE_PHASE_VISIBILITY = 'TOGGLE_PHASE_VISIBILITY';
export const SET_PHASES_VISIBILITY = 'SET_PHASES_VISIBILITY';

export const SET_DOCUMENT_STATE = 'SET_DOCUMENT_STATE';

// ------------------------------------
// Actions
// ------------------------------------
export function requestNavigation () {
  return {
    type: REQUEST_NAVIGATION
  };
}

export function receiveNavigation (items) {
  // ------------------------------------
  // Combine navigation number and names
  // and
  // Give each item in the navigation a level specific id for sorting
  // ------------------------------------
  items.results.map(item => {
    item.name = item.function_id + ' ' + item.name;
    item.sort_id = item.function_id.substring(item.function_id.length-2, item.function_id.length);
  });
  const ltt = new LTT(items.results, {
    key_id: 'id',
    key_parent: 'parent',
    key_child: 'children'
  });
  const unOrderedTree = ltt.GetTree();
  // ------------------------------------
  // Sort the tree, as ltt doesnt automatically do it
  // ------------------------------------
  const sortTree = tree => {
    tree = _.orderBy(tree, ['sort_id'], 'asc');
    return tree.map(item => {
      if(item.children !== undefined) {
        item.children = _.orderBy(item.children, ['sort_id'], 'asc');
        sortTree(item.children);
      }
      return item;
    });
  }
  const orderedTree = sortTree(unOrderedTree);
  return {
    type: RECEIVE_NAVIGATION,
    items: orderedTree
  };
}

export function requestTOS () {
  return {
    type: REQUEST_TOS
  };
}

export function receiveTOS (tos, json) {
  return {
    type: RECEIVE_TOS,
    tos,
    data: json,
    receivedAt: Date.now()
  };
}

export function fetchTOS (tos) {
  return function (dispatch) {
    dispatch(requestTOS(tos));
    // placeholder fetch, will be changed
    const url = 'https://api.hel.fi/helerm-test/v1/function/'+tos;
    return fetch(url)
      .then(response => response.json())
      .then(json =>
      dispatch(receiveTOS(tos, json))
    );
  };
}

export function fetchNavigation () {
  return function (dispatch) {
    dispatch(requestNavigation());
    return fetch('https://api.hel.fi/helerm-test/v1/function/?page_size=2000')
    // return fetch('https://www.reddit.com/r/reactjs.json')
      .then(response => response.json())
      .then(json =>
      dispatch(receiveNavigation(json))
    );
  };
}

export function togglePhaseVisibility (phase, current) {
  return {
    type: TOGGLE_PHASE_VISIBILITY,
    phase,
    newOpen: !current
  };
}

export function setPhasesVisibility (phases, value) {
  const allPhasesOpen = [];
  for (const key in phases) {
    if (phases.hasOwnProperty(key)) {
      allPhasesOpen.push(update(phases[key], { is_open: { $set: value } }));
    }
  };
  return {
    type: SET_PHASES_VISIBILITY,
    allPhasesOpen
  };
}

export function setDocumentState (state) {
  return {
    type: SET_DOCUMENT_STATE,
    state
  }
}
export const actions = {
  fetchNavigation,
  requestNavigation,
  receiveNavigation,
  selectTOS,
  requestTOS,
  receiveTOS,
  fetchTOS,
  togglePhaseVisibility,
  setPhasesVisibility
};

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [RECEIVE_NAVIGATION] : (state, action) => {
    return ({ ...state, navigationMenuItems: action.items });
  },
  [REQUEST_NAVIGATION] : (state, action) => {
    return state;
  },
  [SELECT_TOS] : (state, action) => {
    return update(state, { selectedTOSId: { $set: action.tos } });
  },
  [REQUEST_TOS] : (state, action) => {
    return update(state, { selectedTOS: {
      isFetching: { $set: true }
    } });
  },
  [RECEIVE_TOS]: (state, action) => {
    return update(state, { selectedTOS: {
      isFetching: { $set: false },
      data: { $set: action.data },
      lastUpdated: { $set: action.receivedAt }
    } });
  },
  [TOGGLE_PHASE_VISIBILITY] : (state, action) => {
    return update(state, { selectedTOS: {
      data: {
        phases: {
          [action.phase]: {
            is_open: { $set: action.newOpen }
          }
        }
      }
    } });
  },
  [SET_PHASES_VISIBILITY] : (state, action) => {
    return update(state, { selectedTOS: {
      data: {
        phases: { $set: action.allPhasesOpen }
      }
    } });
  },
  [SET_DOCUMENT_STATE] : (state, action) => {
    return update(state, { selectedTOS: {
      documentState: { $set: action.state}
    } });
  }
};

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
  navigationMenuItems: [],
  selectedTOS: {
    isFetching: false,
    data: {},
    documentState: 'view',
    lastUpdated: 0
  }
};

export default function homeReducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type];
  return handler ? handler(state, action) : state;
}
