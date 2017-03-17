import update from 'immutability-helper';
import indexOf from 'lodash/indexOf';
import includes from 'lodash/includes';
import { map } from 'lodash';
import { normalize, schema } from 'normalizr';

import { default as api } from '../../utils/api';
import { normalizeTosForApi } from '../../utils/helpers';

// ------------------------------------
// Constants
// ------------------------------------
export const REQUEST_TOS = 'tos/REQUEST_TOS';
export const RECEIVE_TOS = 'tos/RECEIVE_TOS';
export const TOS_ERROR = 'tos/TOS_ERROR';
export const RESET_TOS = 'tos/RESET_TOS';
export const CLEAR_TOS = 'tos/CLEAR_TOS';

export const SET_PHASE_VISIBILITY = 'tos/SET_PHASE_VISIBILITY';
export const SET_PHASES_VISIBILITY = 'tos/SET_PHASES_VISIBILITY';

export const ADD_ACTION = 'tos/ADD_ACTION';
export const ADD_PHASE = 'tos/ADD_PHASE';
export const ADD_RECORD = 'tos/ADD_RECORD';

export const EDIT_ACTION = 'tos/EDIT_ACTION';
export const EDIT_PHASE = 'tos/EDIT_PHASE';
export const EDIT_RECORD = 'tos/EDIT_RECORD';
export const EDIT_RECORD_ATTRIBUTE = 'tos/EDIT_RECORD_ATTRIBUTE';
export const EDIT_META_DATA = 'tos/EDIT_META_DATA';

export const REMOVE_ACTION = 'tos/REMOVE_ACTION';
export const REMOVE_PHASE = 'tos/REMOVE_PHASE';
export const REMOVE_RECORD = 'tos/REMOVE_RECORD';

export const SET_DOCUMENT_STATE = 'tos/SET_DOCUMENT_STATE';

export const EXECUTE_IMPORT = 'tos/EXECUTE_IMPORT';
export const EXECUTE_ORDER_CHANGE = 'tos/EXECUTE_ORDER_CHANGE';

// ------------------------------------
// Actions
// ------------------------------------

export function requestTOS () {
  return {
    type: REQUEST_TOS
  };
}

export function receiveTOS (json) {
  json.phases.map((phase, phaseIndex) => {
    phase.index = phase.index || phaseIndex;
    phase.is_open = false;
    phase.actions.map((action, actionIndex) => {
      action.index = action.index || actionIndex;
      action.records.map((record, recordIndex) => {
        record.index = record.index || recordIndex;
        record.is_open = false;
      });
    });
  });
  const tosSchema = new schema.Entity('tos');
  const phase = new schema.Entity('phases');
  const action = new schema.Entity('actions');
  const record = new schema.Entity('records');

  tosSchema.define({
    phases: [phase]
  });
  phase.define({
    actions: [action]
  });
  action.define({
    records: [record]
  });
  json = normalize(json, tosSchema);
  return {
    type: RECEIVE_TOS,
    data: json,
    receivedAt: Date.now()
  };
}

export function fetchTOS (tosId) {
  return function (dispatch) {
    dispatch(requestTOS());
    return api.get(`function/${tosId}`)
      .then(res => {
        if (!res.ok) {
          dispatch(TOSError());
          throw new URIError(res.statusText);
        }
        return res.json();
      })
      .then(json => dispatch(receiveTOS(json)));
  };
}

export function TOSError () {
  return {
    type: TOS_ERROR
  };
}

export function clearTOS () {
  return {
    type: CLEAR_TOS
  };
}

export function resetTOS (originalTos) {
  return {
    type: RESET_TOS,
    originalTos
  };
}

export function setPhaseVisibility (phase, visibility) {
  return {
    type: SET_PHASE_VISIBILITY,
    phase,
    visibility
  };
}

export function setPhasesVisibility (phases, value) {
  const allPhasesOpen = {};
  for (const key in phases) {
    if (phases.hasOwnProperty(key)) {
      allPhasesOpen[key] = update(phases[key], {
        is_open: {
          $set: value
        }
      });
    }
  }
  return {
    type: SET_PHASES_VISIBILITY,
    allPhasesOpen
  };
}

export function addRecord (actionIndex, recordName, recordType, attributes) {
  const recordId = Math.random().toString(36).replace(/[^a-z]+/g, '');
  let newAttributes = {};
  for (const key in attributes) {
    if (attributes.hasOwnProperty(key)) {
      if (attributes[key].checked === true) {
        newAttributes = Object.assign({}, newAttributes, { [key]: attributes[key].name });
      }
    }
  }
  const newRecord = Object.assign({}, {
    id: recordId,
    action: actionIndex,
    attributes: newAttributes,
    name: recordName,
    is_open: false
  });
  newRecord.attributes.RecordType = recordType;

  return {
    type: ADD_RECORD,
    actionIndex,
    recordId,
    newRecord
  };
}

export function addAction (phaseIndex, name) {
  const actionId = Math.random().toString(36).replace(/[^a-z]+/g, '');
  const newAction = {
    id: actionId,
    name: name,
    phase: phaseIndex,
    records: []
  };
  return {
    type: ADD_ACTION,
    newAction
  };
}

export function addPhase (name, parent) {
  const phaseId = Math.random().toString(36).replace(/[^a-z]+/g, '');
  const newPhase = {
    name: name,
    id: phaseId,
    function: parent,
    actions: [],
    attributes: {},
    is_open: false
  };
  return {
    type: ADD_PHASE,
    newPhase
  };
}

export function editRecord (recordId, recordName, recordType, attributes) {
  let editedAttributes = [];
  for (const key in attributes) {
    if (attributes.hasOwnProperty(key)) {
      if (attributes[key].checked === true) {
        editedAttributes = Object.assign({}, editedAttributes, { [key]: attributes[key].name });
      }
    }
  }
  const editedRecord = Object.assign({}, {
    attributes: editedAttributes,
    name: recordName
  });
  editedRecord.attributes.RecordType = recordType;

  return {
    type: EDIT_RECORD,
    editedRecord,
    recordId
  };
}

export function editRecordAttribute (editedRecord) {
  return {
    type: EDIT_RECORD_ATTRIBUTE,
    editedRecord
  };
}

export function editAction (editedAction) {
  return {
    type: EDIT_ACTION,
    editedAction
  };
}

export function editPhase (editedPhase) {
  return {
    type: EDIT_PHASE,
    editedPhase
  };
}

export function editMetaData (attributes) {
  let editedMetaData = [];
  for (const key in attributes) {
    if (attributes.hasOwnProperty(key)) {
      if (attributes[key].checked === true) {
        editedMetaData = Object.assign({}, editedMetaData, { [key]: attributes[key].name });
      }
    }
  }

  return {
    type: EDIT_META_DATA,
    editedMetaData
  };
}

export function removeRecord (recordToRemove, actionId) {
  return {
    type: REMOVE_RECORD,
    recordToRemove,
    actionId
  };
}

export function removeAction (actionToRemove, phaseId) {
  return {
    type: REMOVE_ACTION,
    actionToRemove,
    phaseId
  };
}

export function removePhase (phaseToRemove) {
  return {
    type: REMOVE_PHASE,
    phaseToRemove
  };
}

export function setDocumentState (newState) {
  return {
    type: SET_DOCUMENT_STATE,
    newState
  };
}

export function executeImport (newItem, level, itemParent, currentState) {
  const newId = Math.random().toString(36).replace(/[^a-z]+/g, '');
  let currentItems;
  let parentLevel;
  let itemLevel;
  switch (level) {
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
  let indexes = [];
  for (const key in currentItems) {
    if (currentItems.hasOwnProperty(key)) {
      indexes.push(currentItems[key].index);
    }
  }
  const newIndex = indexes.length > 0 ? Math.max.apply(null, indexes) + 1 : 1;
  const newName = currentItems[newItem].name + ' (KOPIO)';
  const newCopy = Object.assign({}, currentItems[newItem], { id: newId }, { index: newIndex }, { name: newName });
  const newItems = Object.assign({}, currentItems, { [newId]: newCopy });

  return {
    type: EXECUTE_IMPORT,
    level,
    itemParent,
    parentLevel,
    itemLevel,
    newId,
    newItems
  };
}

export function executeOrderChange (newOrder, itemType, itemParent, currentState) {
  let parentLevel;
  let itemLevel;
  const affectedItems = newOrder;
  switch (itemType) {
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
    item.index = index + 1;
    parentList.push(item.id);
  });
  let itemList = Object.assign({}, currentState.selectedTOS[itemLevel]);
  for (const key in itemList) {
    if (itemList.hasOwnProperty(key)) {
      reorderedList.map(item => {
        if (itemList[key].id === item.id) {
          itemList[key] = item;
        }
      });
    }
  }

  itemList = parentLevel === 'tos' ? reorderedList : itemList;

  return {
    type: EXECUTE_ORDER_CHANGE,
    itemList,
    itemType,
    itemParent,
    parentLevel,
    itemLevel,
    parentList
  };
}

export function importItems (newItem, level, itemParent) {
  return function (dispatch, getState) {
    dispatch(executeImport(newItem, level, itemParent, getState()));
  };
}

export function changeOrder (newOrder, itemType, itemParent) {
  return function (dispatch, getState) {
    dispatch(executeOrderChange(newOrder, itemType, itemParent, getState()));
  };
}

export function saveDraft () {
  return function (dispatch, getState) {
    dispatch(requestTOS());
    const tos = Object.assign({}, getState().selectedTOS);
    const newTos = Object.assign({}, tos);
    const finalPhases = normalizeTosForApi(newTos);
    const denormalizedTos = update(tos, { phases: { $set: finalPhases } });

    return api.put(`function/${tos.id}`, denormalizedTos)
      .then(res => {
        if (!res.ok) {
          dispatch(TOSError());
          throw Error(res.statusText);
        }
        return res.json();
      })
      .then(json => dispatch(receiveTOS(json)));
  };
}

export const actions = {
  requestTOS,
  receiveTOS,
  fetchTOS,
  clearTOS,
  setPhaseVisibility,
  setPhasesVisibility,
  addAction,
  addRecord,
  addPhase,
  editAction,
  editPhase,
  editRecord,
  editRecordAttribute,
  editMetaData,
  setDocumentState,
  executeImport,
  executeOrderChange,
  importItems,
  changeOrder
};

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [REQUEST_TOS]: (state) => {
    return update(state, {
      isFetching: {
        $set: true
      }
    });
  },
  [RECEIVE_TOS]: (state, action) => {
    const tos = action.data.entities.tos[action.data.result];
    return update(state, {
      $merge: tos,
      attributes: {
        $set: action.data.entities.tos[action.data.result].attributes
      },
      actions: {
        $set: action.data.entities.actions ? action.data.entities.actions : {}
      },
      phases: {
        $set: action.data.entities.phases ? action.data.entities.phases : {}
      },
      records: {
        $set: action.data.entities.records ? action.data.entities.records : {}
      },
      lastUpdated: {
        $set: action.receivedAt
      },
      documentState: {
        $set: 'view'
      },
      isFetching: {
        $set: false
      }
    });
  },
  [RESET_TOS]: (state, action) => {
    return update(state, {
      $merge: action.originalTos,
      documentState: {
        $set: 'view'
      }
    });
  },
  [CLEAR_TOS]: () => {
    return initialState;
  },
  [TOS_ERROR]: (state) => {
    // TODO: Find out what mutates store so hard...
    const actions = {};
    const phases = {};
    map(state.actions, action => {
      actions[action.id] = action;
      return map(action.records, (record, recordIndex) => {
        actions[action.id].records[recordIndex] = record.id;
      });
    });
    map(state.phases, phase => {
      phases[phase.id] = phase;
      return map(phase.actions, (action, actionIndex) => {
        phases[phase.id].actions[actionIndex] = action.id;
      });
    });

    return update(state, {
      actions: { $set: actions },
      phases: { $set: phases },
      isFetching: {
        $set: false
      }
    });
  },
  [SET_PHASE_VISIBILITY]: (state, action) => {
    return update(state, {
      phases: {
        [action.phase]: {
          is_open: {
            $set: action.visibility
          }
        }
      }
    });
  },
  [SET_PHASES_VISIBILITY]: (state, action) => {
    return update(state, {
      phases: {
        $set: action.allPhasesOpen
      }
    });
  },
  [ADD_ACTION]: (state, action) => {
    return update(state, {
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
    });
  },
  [ADD_PHASE]: (state, action) => {
    return update(state, {
      phases: {
        [action.newPhase.id]: {
          $set: action.newPhase
        }
      }
    });
  },
  [ADD_RECORD]: (state, action) => {
    return update(state, {
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
    });
  },
  [EDIT_ACTION]: (state, action) => {
    return update(state, {
      actions: {
        [action.editedAction.id]: {
          name: {
            $set: action.editedAction.name
          }
        }
      }
    });
  },
  [EDIT_PHASE]: (state, action) => {
    return update(state, {
      phases: {
        [action.editedPhase.id]: {
          name: {
            $set: action.editedPhase.name
          }
        }
      }
    });
  },
  [EDIT_RECORD]: (state, action) => {
    return update(state, {
      records: {
        [action.recordId]: {
          name: {
            $set: action.editedRecord.name
          },
          attributes: {
            $set: action.editedRecord.attributes
          }
        }
      }
    });
  },
  [EDIT_RECORD_ATTRIBUTE]: (state, action) => {
    if (action.editedRecord.name) {
      return update(state, {
        records: {
          [action.editedRecord.recordId]: {
            name: {
              $set: action.editedRecord.name
            }
          }
        }
      });
    } else if (action.editedRecord.type) {
      return update(state, {
        records: {
          [action.editedRecord.recordId]: {
            attributes: {
              RecordType: {
                $set: action.editedRecord.type
              }
            }
          }
        }
      });
    } else if (action.editedRecord.tosAttribute) {
      return update(state, {
        attributes: {
          [action.editedRecord.attributeIndex]: {
            $set: action.editedRecord.tosAttribute
          }
        }
      });
    } else {
      return update(state, {
        records: {
          [action.editedRecord.recordId]: {
            attributes: {
              [action.editedRecord.attributeIndex]: {
                $set: action.editedRecord.attribute
              }
            }
          }
        }
      });
    }
  },
  [EDIT_META_DATA]: (state, action) => {
    return update(state, {
      attributes: {
        $set: action.editedMetaData
      }
    });
  },
  [REMOVE_ACTION]: (state, action) => {
    const stateCopy = state;
    const actionIndex = indexOf(
      stateCopy.phases[action.phaseId].actions,
      action.actionToRemove
    );

    const recordsUnderAction = stateCopy.actions[action.actionToRemove].records;
    for (var record in stateCopy.records) {
      if (includes(recordsUnderAction, record)) {
        delete stateCopy.records[record];
      }
    }

    delete stateCopy.actions[action.actionToRemove];

    return update(state, {
      actions: {
        $set: stateCopy.actions
      },
      phases: {
        [action.phaseId]: {
          actions: {
            $splice: [[actionIndex, 1]]
          }
        }
      },
      records: {
        $set: stateCopy.records
      }
    });
  },
  [REMOVE_PHASE]: (state, action) => {
    const phasesCopy = state.phases;
    delete phasesCopy[action.phaseToRemove];

    return update(state, {
      phases: {
        $set: phasesCopy
      }
    });
  },
  [REMOVE_RECORD]: (state, action) => {
    const stateCopy = state;

    const recordIndex = indexOf(
      stateCopy.actions[action.actionId].records,
      action.recordToRemove
    );

    delete stateCopy.records[action.recordToRemove];

    return update(state, {
      records: {
        $set: stateCopy.records
      },
      actions: {
        [action.actionId]: {
          records: {
            $splice: [[recordIndex, 1]]
          }
        }
      }
    });
  },
  [SET_DOCUMENT_STATE]: (state, action) => {
    return update(state, {
      documentState: {
        $set: action.newState
      }
    });
  },
  [EXECUTE_IMPORT]: (state, action) => {
    if (action.level === 'phase') {
      return update(state, {
        [action.parentLevel]: {
          [action.itemLevel]: {
            $push: [action.newId]
          }
        },
        [action.itemLevel]: {
          $set: action.newItems
        }
      });
    } else {
      return update(state, {
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
      });
    }
  },
  [EXECUTE_ORDER_CHANGE]: (state, action) => {
    if (action.itemType === 'phase') {
      return update(state, {
        [action.itemLevel]: {
          $set: action.itemList
        }
      });
    } else {
      return update(state, {
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
      });
    }
  }
};

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
  id: null,
  function_id: null,
  parent: null,
  version: null,
  name: null,
  error_count: null,
  state: null,
  created_at: null,
  modified_at: null,
  actions: {},
  phases: {},
  records: {},
  attributes: {},
  documentState: 'view',
  lastUpdated: 0,
  isFetching: false
};

export default function tosReducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type];
  return handler ? handler(state, action) : state;
}
