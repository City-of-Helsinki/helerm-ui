import fetch from 'isomorphic-fetch';
import update from 'immutability-helper';
import LTT from 'list-to-tree';
import { orderBy } from 'lodash';
import { normalize, Schema, arrayOf } from 'normalizr';

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

export const ADD_ACTION = 'ADD_ACTION';
export const ADD_RECORD = 'ADD_RECORD';
export const ADD_PHASE = 'ADD_PHASE';

export const COMMIT_ORDER_CHANGE = 'COMMIT_ORDER_CHANGE';

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
    phase.is_open = false;
    phase.actions.map(action => {
      action.records.map(record => {
        record.is_open = false;
      });
    });
  });
  const tosSchema = new Schema('tos');
  const phase = new Schema('phases');
  const action = new Schema('actions');
  const record = new Schema('records');

  tosSchema.define({
    phases: arrayOf(phase)
  });
  phase.define({
    actions: arrayOf(action),
  });
  action.define({
    records: arrayOf(record),
  });
  json = normalize(json, tosSchema);
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

export function receiveAttributes(attributes, validationRules) {
  const attributeList = {};
  attributes.results.map(result => {
    if(result.values) {
      let required;
      validationRules.record.required.map(rule => {
        if (rule === result.identifier) {
          required = true;
        }
      });
      if (required !== true) {
        required = false;
      }
      attributeList[result.identifier] = {
        name: result.name,
        values: result.values,
        required
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

export function fetchAttributes(validationRules) {
  return function(dispatch) {
    return fetch('https://api.hel.fi/helerm-test/v1/attribute/')
    .then(response => response.json())
    .then(json =>
    dispatch(receiveAttributes(json, validationRules)))
  }
}

export function fetchValidationRules() {
  return function(dispatch) {
    return fetch('https://api.hel.fi/helerm-test/v1/attribute/schemas/')
    .then(response => response.json())
    .then(json => {
      dispatch(fetchAttributes(json));
    })
  }
}

export function setPhaseVisibility(phase, visibility) {
  return {
    type: SET_PHASE_VISIBILITY,
    phase,
    visibility
  };
}

export function setPhasesVisibility(phases, value) {
  const allPhasesOpen = {};
  for (const key in phases) {
    if (phases.hasOwnProperty(key)) {
      allPhasesOpen[key] = update(phases[key], {
        is_open: {
          $set: value
        }
      });
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

export function addAction(phaseIndex, name) {
  const actionId = Math.random().toString(36).replace(/[^a-z]+/g, '');
  const newAction = {
    id: actionId,
    name: name,
    phase: phaseIndex,
    records: []
  }
  return {
    type: ADD_ACTION,
    newAction
  }
}

export function addRecord(phaseIndex, name) {
  const newRecord = {
    name: name,
    attributes: []
  }
  return {
    type: ADD_ACTION,
    phaseIndex,
    newAction: [newRecord]
  }
}

export function addPhase(name, parent) {
  const phaseId = Math.random().toString(36).replace(/[^a-z]+/g, '');
  const newPhase = {
    name: name,
    id: phaseId,
    function: parent,
    actions: [],
    attributes: {},
    is_open: false
  }
  return {
    type: ADD_PHASE,
    newPhase
  }
}

export function commitOrderChanges(newOrder, itemType, itemParent) {
  return {
    type: COMMIT_ORDER_CHANGE,
    newOrder,
    itemType,
    itemParent
  }
}

export const actions = {
  requestNavigation,
  receiveNavigation,
  setNavigationVisibility,
  requestTOS,
  receiveTOS,
  receiveRecordTypes,
  receiveAttributes,
  fetchTOS,
  fetchNavigation,
  fetchRecordTypes,
  fetchAttributes,
  fetchValidationRules,
  setPhaseVisibility,
  setPhasesVisibility,
  setDocumentState,
  addAction,
  addRecord,
  addPhase,
  commitOrderChanges
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
    return  update(state, {
      navigation: {
        items: { $set: action.items },
        is_open: { $set: true }
      },
      isFetching: {
        $set: false
      }
    });
  },
  [REQUEST_TOS]: (state, action) => {
    return update(state, {
      isFetching: {
        $set: true
      }
    });
  },
  [RECEIVE_TOS]: (state, action) => {
    return update(state, {
      navigation: {
        is_open: {$set: false}
      },
      selectedTOS: {
        tos: {
          $set: action.data.entities.tos[action.data.result]
        },
        actions: {
          $set: action.data.entities.actions
        },
        phases: {
          $set: action.data.entities.phases
        },
        records: {
          $set: action.data.entities.records
        },
        path: {
          $set: action.path
        },
        lastUpdated: {
          $set: action.receivedAt
        }
      },
      isFetching: {
        $set: false
      }
    });
  },
  [SET_PHASE_VISIBILITY]: (state, action) => {
    return update(state, {
      selectedTOS: {
        phases: {
          [action.phase]: {
            is_open: {
              $set: action.visibility
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
        phases: {
          $set: action.allPhasesOpen
        }
      }
    });
  },
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
      attributeTypes: {$set: action.attributeList}
    });
  },
  [ADD_ACTION]: (state, action) => {
    return update(state, {
      selectedTOS: {
        phases: {
          [action.newAction.phase]: {
            actions: {
              $push: [action.newAction.id]
            }
          }
        },
        actions: {
          [action.newAction.id]: {
            $set: action.newAction
          }
        }
      }
    });
  },
  [ADD_PHASE]: (state, action) => {
    return update(state, {
      selectedTOS: {
        tos: {
          phases: {
            $push : [action.newPhase.id]
          }
        },
        phases: {
          [action.newPhase.id]: {
            $set: action.newPhase
          }
        }
      }
    });
  },
  [COMMIT_ORDER_CHANGE]: (state, action) => {
    let parentLevel;
    let itemLevel;
    const affectedItems = action.newOrder;
    switch(action.itemType) {
      case 'action':
        parentLevel = 'phases';
        itemLevel = 'actions';
        break;
      case 'phase':
        parentLevel = 'tos';
        itemLevel = 'phases';
        break;
      case 'record':
        parentLevel = 'actions';
        itemLevel = 'records';
        break;
    }
    const newOrder = [];
    affectedItems.map(item => {
      newOrder.push(state.selectedTOS[itemLevel][item]);
    });
    const parentList = [];
    newOrder.map((item, index) => {
      item.index = index+1;
      parentList.push(item.id);
    });
    const itemList = Object.assign({}, state.selectedTOS[itemLevel]);
    for(const key in itemList) {
      if(itemList.hasOwnProperty(key)) {
        newOrder.map(item => {
          if(itemList[key].id === item.id) {
            itemList[key] = item;
          }
        });
      }
    }
    if(action.itemType === 'phase'){
      return update(state, {
        selectedTOS: {
          [parentLevel]: {
            [itemLevel]: {
              $set: parentList
            }
          },
          [itemLevel]: {
            $set: itemList
          }
        }
      });
    } else {
      return update(state, {
        selectedTOS: {
          [parentLevel]: {
            [action.itemParent]: {
              [itemLevel]: {
                $set: parentList
              }
            }
          },
          [itemLevel]: {
            $set: itemList
          }
        }
      });
    }
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
    tos: {},
    actions: {},
    phases: {},
    records: {},
    attributes: {},
    path: [],
    documentState: 'view',
    lastUpdated: 0
  },
  isFetching: false,
  recordTypes: {},
  attributeTypes: {}
};

export default function homeReducer(state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type];
  return handler ? handler(state, action) : state;
}
