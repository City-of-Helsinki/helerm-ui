import fetch from 'isomorphic-fetch';
import update from 'immutability-helper';
import LTT from 'list-to-tree';
import { orderBy } from 'lodash';
// ------------------------------------
// Constants
// ------------------------------------
export const REQUEST_NAVIGATION = 'REQUEST_NAVIGATION';
export const RECEIVE_NAVIGATION = 'RECEIVE_NAVIGATION';
export const SET_NAVIGATION_VISIBILITY = 'SET_NAVIGATION_VISIBILITY';

export const REQUEST_TOS = 'REQUEST_TOS';
export const RECEIVE_TOS = 'RECEIVE_TOS';

export const SET_RECORD_VISIBILITY = 'SET_RECORD_VISIBILITY';

export const SET_PHASE_VISIBILITY = 'SET_PHASE_VISIBILITY';
export const SET_PHASES_VISIBILITY = 'SET_PHASES_VISIBILITY';

export const SET_DOCUMENT_STATE = 'SET_DOCUMENT_STATE';

export const RECEIVE_RECORDTYPES = 'RECEIVE_RECORDTYPES';
export const RECEIVE_ATTRIBUTES = 'RECEIVE_ATTRIBUTES';

// ------------------------------------
// Actions
// ------------------------------------
export function requestNavigation() {
  return {
    type: REQUEST_NAVIGATION
  };
}

export function receiveNavigation(items) {
  // ------------------------------------
  // Combine navigation number and names
  // and
  // Give each item in the navigation a level specific id for sorting
  // ------------------------------------
  items.results.map(item => {
    item.name = item.function_id + ' ' + item.name;
    item.sort_id = item.function_id.substring(item.function_id.length - 2, item.function_id.length);
    item.path = [];
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
      if (item.children !== undefined) {
        // ------------------------------------
        // Generate path to show when navigation is minimized and TOS is shown
        // ------------------------------------
        item.path.push(item.name);
        item.children.map(child => {
          item.path.map(path => child.path.push(path));
        });
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

export function setNavigationVisibility(value) {
  return {
    type: SET_NAVIGATION_VISIBILITY,
    value
  }
}
export function requestTOS() {
  return {
    type: REQUEST_TOS
  };
}

export function receiveTOS(tos, json) {
  json.phases.map(phase => {
    phase.actions.map(action => {
      action.records.map(record => {
        record.is_open = false;
      });
    });
  });
  return {
    type: RECEIVE_TOS,
    path: tos.path,
    data: json,
    receivedAt: Date.now()
  };
}

export function receiveRecordTypes(recordTypes) {
  const recordTypeList = {};
  recordTypes.results.map(result => {
    const trimmedResult = result.id.replace(/-/g, '');
    recordTypeList[trimmedResult] = result.value;
  });
  return {
    type: RECEIVE_RECORDTYPES,
    recordTypeList
  }
}

export function receiveAttributes(attributes) {
  const attributeList = {};
  attributes.results.map(result => {
    if(result.values) {
      attributeList[result.identifier] = {
        name: result.name,
        values: result.values
      };
    }
  });
  return {
    type: RECEIVE_ATTRIBUTES,
    attributeList
  }
}

export function fetchTOS(tos) {
  return function(dispatch) {
    dispatch(requestTOS());
    const url = 'https://api.hel.fi/helerm-test/v1/function/' + tos.id;
    return fetch(url)
      .then(response => response.json())
      .then(json =>
        dispatch(receiveTOS(tos, json))
      );
  };
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

export function fetchRecordTypes() {
  return function(dispatch) {
    return fetch('https://api.hel.fi/helerm-test/v1/record_type/?page_size=2000')
      .then(response => response.json())
      .then(json =>
        dispatch(receiveRecordTypes(json))
      );
  };
}

export function fetchAttributes() {
  return function(dispatch) {
    return fetch('https://api.hel.fi/helerm-test/v1/attribute/')
    .then(response => response.json())
    .then(json =>
    dispatch(receiveAttributes(json)))
  }
}
export function setPhaseVisibility(phase, current) {
  return {
    type: SET_PHASE_VISIBILITY,
    phase,
    newOpen: !current
  };
}
export function setRecordVisibility(record, value) {

  return {
    type: SET_RECORD_VISIBILITY,
    record,
    value: !value
  }
}

export function setPhasesVisibility(phases, value) {
  const allPhasesOpen = [];
  for (const key in phases) {
    if (phases.hasOwnProperty(key)) {
      allPhasesOpen.push(update(phases[key], {
        is_open: {
          $set: value
        }
      }));
    }
  };
  return {
    type: SET_PHASES_VISIBILITY,
    allPhasesOpen
  };
}

export function setDocumentState(state) {
  return {
    type: SET_DOCUMENT_STATE,
    state
  }
}
export const actions = {
  fetchNavigation,
  requestNavigation,
  receiveNavigation,
  requestTOS,
  receiveTOS,
  fetchTOS,
  setPhaseVisibility,
  setPhasesVisibility,
  fetchRecordTypes,
  setRecordVisibility
};

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [RECEIVE_NAVIGATION]: (state, action) => {
    return ({...state,
      navigation: {
        items: action.items,
        is_open: true
      }
    });
  },
  [REQUEST_NAVIGATION]: (state, action) => {
    return state;
  },
  [REQUEST_TOS]: (state, action) => {
    return update(state, {
      selectedTOS: {
        isFetching: {
          $set: true
        }
      }
    });
  },
  [RECEIVE_TOS]: (state, action) => {
    return update(state, {
      navigation: {
        is_open: {$set: false}
      },
      selectedTOS: {
        isFetching: {
          $set: false
        },
        data: {
          $set: action.data
        },
        path: {
          $set: action.path
        },
        lastUpdated: {
          $set: action.receivedAt
        }
      }
    });
  },
  [SET_PHASE_VISIBILITY]: (state, action) => {
    return update(state, {
      selectedTOS: {
        data: {
          phases: {
            [action.phase]: {
              is_open: {
                $set: action.newOpen
              }
            }
          }
        }
      }
    });
  },
  [SET_NAVIGATION_VISIBILITY]: (state, action) => {
    return update(state, {
      navigation: {
        is_open: { $set: action.value }
      }
    });
  },
  [SET_PHASES_VISIBILITY]: (state, action) => {
    return update(state, {
      selectedTOS: {
        data: {
          phases: {
            $set: action.allPhasesOpen
          }
        }
      }
    });
  },
  // [SET_RECORD_VISIBILITY]: (state, action) => {
  //   _.state.
  //   return update(state, {
  //     selectedTOS: {
  //       data: {
  //         phases: {
  //           id: {
  //             records: {
  //               [action.record]: {
  //                 is_open: {
  //                   $set: action.value
  //                 }
  //               }
  //             }
  //           }
  //         }
  //       }
  //     }
  //   });
  // },
  [SET_DOCUMENT_STATE]: (state, action) => {
    return update(state, {
      selectedTOS: {
        documentState: {
          $set: action.state
        }
      }
    });
  },
  [RECEIVE_RECORDTYPES]: (state, action) => {
    return update(state, {
      recordTypes: {
        $set: action.recordTypeList
      }
    });
  },
  [RECEIVE_ATTRIBUTES]: (state, action) => {
    return update(state, {
      attributes: {$set: action.attributeList}
    });
  }
};
// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
  navigation: {
    items: [],
    is_open: true
  },
  selectedTOS: {
    isFetching: false,
    data: {},
    path: [],
    documentState: 'view',
    lastUpdated: 0
  },
  recordTypes: {},
  attributes: {}
};

export default function homeReducer(state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type];
  return handler ? handler(state, action) : state;
}
