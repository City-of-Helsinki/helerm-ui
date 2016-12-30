import fetch from 'isomorphic-fetch';
import update from 'immutability-helper';
import { normalize, Schema, arrayOf } from 'normalizr';

import { convertToTree } from '../../../utils/helpers.js';

// ------------------------------------
// Constants
// ------------------------------------
export const REQUEST_NAVIGATION = 'REQUEST_NAVIGATION';
export const RECEIVE_NAVIGATION = 'RECEIVE_NAVIGATION';

export const REQUEST_TOS = 'REQUEST_TOS';
export const RECEIVE_TOS = 'RECEIVE_TOS';

export const SET_NAVIGATION_VISIBILITY = 'SET_NAVIGATION_VISIBILITY';
export const SET_PHASE_VISIBILITY = 'SET_PHASE_VISIBILITY';
export const SET_PHASES_VISIBILITY = 'SET_PHASES_VISIBILITY';

export const ADD_ACTION = 'ADD_ACTION';
export const ADD_RECORD = 'ADD_RECORD';
export const ADD_PHASE = 'ADD_PHASE';

export const RECEIVE_RECORDTYPES = 'RECEIVE_RECORDTYPES';
export const RECEIVE_ATTRIBUTE_TYPES = 'RECEIVE_ATTRIBUTE_TYPES';

export const SET_DOCUMENT_STATE = 'SET_DOCUMENT_STATE';
export const CLOSE_MESSAGE = 'CLOSE_MESSAGE';

export const EXECUTE_IMPORT = 'EXECUTE_IMPORT';
export const EXECUTE_ORDER_CHANGE = 'EXECUTE_ORDER_CHANGE';


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

export function requestTOS() {
  return {
    type: REQUEST_TOS
  };
}

export function receiveTOS(tosPath, json) {
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
    path: tosPath,
    data: json,
    receivedAt: Date.now()
  };
}

export function setNavigationVisibility(value) {
  return {
    type: SET_NAVIGATION_VISIBILITY,
    value
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

export function addRecord(actionIndex, recordName, recordType, attributes) {
  const recordId = Math.random().toString(36).replace(/[^a-z]+/g, '');
  let newAttributes = [];
  for(const key in attributes) {
    if(attributes.hasOwnProperty(key)) {
      if (attributes[key].checked === true) {
        newAttributes = Object.assign({}, newAttributes, {[key]: attributes[key].name});
      }
    }
  }
  const newRecord = Object.assign({}, {
    id: recordId,
    action: actionIndex,
    attributes: newAttributes,
    name: recordName,
    type: recordType,
    is_open: false
  });
  return {
    type: ADD_RECORD,
    actionIndex,
    recordId,
    newRecord,
    message: {
      active: true,
      success: true,
      text: 'Lisäys onnistui'
    }
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

export function receiveAttributeTypes(attributes, validationRules) {
  const attributeTypeList = {};
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
      attributeTypeList[result.identifier] = {
        name: result.name,
        values: result.values,
        required
      };
    }
  });
  return {
    type: RECEIVE_ATTRIBUTE_TYPES,
    attributeTypeList
  }
}

export function setDocumentState(newState) {
  return {
    type: SET_DOCUMENT_STATE,
    newState
  }
}

export function closeMessage() {
  return {
    type: CLOSE_MESSAGE
  }
}

export function executeImport(newItem, level, itemParent, currentState) {
  const newId = Math.random().toString(36).replace(/[^a-z]+/g, '');
  let currentItems;
  let parentLevel;
  let itemLevel;
  switch(level) {
    case 'phase':
      currentItems = Object.assign({}, currentState.selectedTOS.phases);
      parentLevel = 'tos';
      itemLevel = 'phases';
      break;
    case 'action':
      currentItems = Object.assign({}, currentState.selectedTOS.actions);
      parentLevel = 'phases';
      itemLevel = 'actions';
      break;
    case 'record':
      currentItems = Object.assign({}, currentState.selectedTOS.records);
      parentLevel = 'actions';
      itemLevel = 'records';
      break;
    default:
      return currentState;
  }
  let indexes = []
  for (const key in currentItems) {
    if(currentItems.hasOwnProperty(key)) {
      indexes.push(currentItems[key].index);
    };
  }
  const newIndex = indexes.length > 0 ? Math.max.apply(null, indexes)+1 : 1
  const newName = currentItems[newItem].name+' (KOPIO)';
  const newCopy = Object.assign({}, currentItems[newItem], {id: newId}, {index: newIndex}, {name: newName});
  const newItems = Object.assign({}, currentItems, {[newId]: newCopy});

  return {
    type: EXECUTE_IMPORT,
    level,
    itemParent,
    parentLevel,
    itemLevel,
    newId,
    newItems
  }
}

export function executeOrderChange(newOrder, itemType, itemParent, currentState) {
  let parentLevel;
  let itemLevel;
  const affectedItems = newOrder;
  switch(itemType) {
    case 'phase':
      parentLevel = 'tos';
      itemLevel = 'phases';
      break;
    case 'action':
      parentLevel = 'phases';
      itemLevel = 'actions';
      break;
    case 'record':
      parentLevel = 'actions';
      itemLevel = 'records';
      break;
    default:
    return currentState;
  }
  const reorderedList = [];
  affectedItems.map(item => {
    reorderedList.push(currentState.selectedTOS[itemLevel][item]);
  });
  const parentList = [];
  reorderedList.map((item, index) => {
    item.index = index+1;
    parentList.push(item.id);
  });
  const itemList = Object.assign({}, currentState.selectedTOS[itemLevel]);
  for(const key in itemList) {
    if(itemList.hasOwnProperty(key)) {
      reorderedList.map(item => {
        if(itemList[key].id === item.id) {
          itemList[key] = item;
        }
      });
    }
  }
  return {
    type: EXECUTE_ORDER_CHANGE,
    itemList,
    itemType,
    itemParent,
    parentLevel,
    itemLevel,
    parentList
  }
}

export function fetchTOS(tosId, tosPath) {
  return function(dispatch) {
    dispatch(requestTOS());
    const url = 'https://api.hel.fi/helerm-test/v1/function/' + tosId;
    return fetch(url)
      .then(response => response.json())
      .then(json =>
        dispatch(receiveTOS(tosPath, json))
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

export function fetchAttributeTypes() {
  return function(dispatch) {
    return fetch('https://api.hel.fi/helerm-test/v1/attribute/schemas/')
    .then(response => response.json())
    .then(validationRules => {
        return fetch('https://api.hel.fi/helerm-test/v1/attribute/')
          .then(response => response.json())
          .then(json =>
          dispatch(receiveAttributeTypes(json, validationRules)))
      })
  }
}

export function importItems(newItem, level, itemParent) {
  return function(dispatch, getState) {
    dispatch(executeImport(newItem, level, itemParent, getState().home))
  }
}

export function changeOrder(newOrder, itemType, itemParent) {
    return function(dispatch, getState) {
      dispatch(executeOrderChange(newOrder, itemType, itemParent, getState().home))
    }
}

export const actions = {
  requestNavigation,
  receiveNavigation,
  requestTOS,
  receiveTOS,
  setNavigationVisibility,
  setPhaseVisibility,
  setPhasesVisibility,
  addAction,
  addRecord,
  addPhase,
  receiveRecordTypes,
  receiveAttributeTypes,
  setDocumentState,
  closeMessage,
  executeImport,
  executeOrderChange,
  fetchTOS,
  fetchNavigation,
  fetchRecordTypes,
  fetchAttributeTypes,
  importItems,
  changeOrder
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
          $set: action.newState
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
  [RECEIVE_ATTRIBUTE_TYPES]: (state, action) => {
    return update(state, {
      attributeTypes: {$set: action.attributeTypeList}
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
  [ADD_RECORD]: (state, action) => {
    return update(state, {
      selectedTOS: {
        actions: {
          [action.actionIndex]: {
            records: {
              $push: [action.recordId]
            }
          }
        },
        records: {
          [action.recordId]: {
            $set: action.newRecord
          }
        }
      },
      message: { $set: action.message }
    });
  },
  [EXECUTE_ORDER_CHANGE]: (state, action) => {
    if(action.itemType === 'phase'){
      return update(state, {
        selectedTOS: {
          [action.parentLevel]: {
            [action.itemLevel]: {
              $set: action.parentList
            }
          },
          [action.itemLevel]: {
            $set: action.itemList
          }
        }
      });
    } else {
      return update(state, {
        selectedTOS: {
          [action.parentLevel]: {
            [action.itemParent]: {
              [action.itemLevel]: {
                $set: action.parentList
              }
            }
          },
          [action.itemLevel]: {
            $set: action.itemList
          }
        }
      });
    }
  },
  [EXECUTE_IMPORT]: (state, action) => {
    if(action.level === 'phase'){
      return update(state, {
        selectedTOS: {
          [action.parentLevel]: {
            [action.itemLevel]: {
              $push: [action.newId]
            }
          },
          [action.itemLevel]: {
            $set: action.newItems
          }
        }
      });
    } else {
      return update(state, {
        selectedTOS: {
          [action.parentLevel]: {
            [action.itemParent]: {
              [action.itemLevel]: {
                $push: [action.newId]
              }
            }
          },
          [action.itemLevel]: {
            $set: action.newItems
          }
        }
      });
    }
  },
  [CLOSE_MESSAGE]: (state, action) => {
    return update(state, {
      message: {
        active: {$set: false},
        text: {$set: ''},
        success: {$set: false}
      }
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
  attributeTypes: {},
  message: {
    active: false,
    text: '',
    success: false
  }
};

export default function homeReducer(state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type];
  return handler ? handler(state, action) : state;
}
