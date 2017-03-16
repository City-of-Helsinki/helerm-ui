import update from 'immutability-helper';
import { createAction, handleActions } from 'redux-actions';
import { map, indexOf, includes } from 'lodash';
import { normalize, schema } from 'normalizr';

import { default as api } from '../../../utils/api';
import { normalizeTosForApi } from '../../../utils/helpers';

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

// ------------------------------------
// Constants
// ------------------------------------
export const REQUEST_TOS = 'requestTosAction';
export const RECEIVE_TOS = 'receiveTosAction';
export const TOS_ERROR = 'tosErrorAction';
export const RESET_TOS = 'resetTosAction';
export const CLEAR_TOS = 'clearTosAction';

export const SET_PHASE_VISIBILITY = 'setPhaseVisibilityAction';
export const SET_PHASES_VISIBILITY = 'setPhasesVisibilityAction';

export const ADD_ACTION = 'addActionAction';
export const ADD_PHASE = 'addPhaseAction';
export const ADD_RECORD = 'addRecordAction';

export const EDIT_ACTION = 'editActionAction';
export const EDIT_PHASE = 'editPhaseAction';
export const EDIT_RECORD = 'editRecordAction';
export const EDIT_RECORD_ATTRIBUTE = 'editRecordAttributeAction';
export const EDIT_META_DATA = 'editMetaDataAction';

export const REMOVE_ACTION = 'removeActionAction';
export const REMOVE_PHASE = 'removePhaseAction';
export const REMOVE_RECORD = 'removeRecordAction';

export const SET_DOCUMENT_STATE = 'setDocumentStateAction';

export const EXECUTE_IMPORT = 'executeImportAction';
export const EXECUTE_ORDER_CHANGE = 'executeOrderChangeAction';

// ------------------------------------
// Actions
// ------------------------------------

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
  const data = Object.assign({}, json, { receivedAt: Date.now() });

  return createAction(RECEIVE_TOS)(data);
}

export function fetchTOS (tosId) {
  return function (dispatch) {
    dispatch(createAction(REQUEST_TOS)());
    return api.get(`function/${tosId}`)
      .then(res => {
        if (!res.ok) {
          dispatch(createAction(TOS_ERROR)());
          throw new URIError(res.statusText);
        }
        return res.json();
      })
      .then(json => dispatch(receiveTOS(json)));
  };
}

export function clearTOS () {
  return createAction(CLEAR_TOS)();
}

export function resetTOS (originalTos) {
  return createAction(RESET_TOS)(originalTos);
}

export function setPhaseVisibility (phase, visibility) {
  return createAction(SET_PHASE_VISIBILITY)({ phase, visibility });
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
  return createAction(SET_PHASES_VISIBILITY)(allPhasesOpen);
}

export function addRecord (actionIndex, recordName, recordType, attributes) {
  const recordId = Math.random().toString(36).replace(/[^a-z]+/g, '');
  let newAttributes = [];
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

  return createAction(ADD_RECORD)({ actionIndex, recordId, newRecord });
}

export function addAction (phaseIndex, name) {
  const actionId = Math.random().toString(36).replace(/[^a-z]+/g, '');
  const newAction = {
    id: actionId,
    name: name,
    phase: phaseIndex,
    records: []
  };
  return createAction(ADD_ACTION)(newAction);
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

  return createAction(ADD_PHASE)(newPhase);
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

  return createAction(EDIT_RECORD)({ editedRecord, recordId });
}

export function editRecordAttribute (editedRecord) {
  return createAction(EDIT_RECORD_ATTRIBUTE)(editedRecord);
}

export function editAction (editedAction) {
  return createAction(EDIT_ACTION)(editedAction);
}

export function editPhase (editedPhase) {
  return createAction(EDIT_PHASE)(editedPhase);
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

  return createAction(EDIT_META_DATA)(editedMetaData);
}

export function removeRecord (recordToRemove, actionId) {
  return createAction(REMOVE_RECORD)({ recordToRemove, actionId });
}

export function removeAction (actionToRemove, phaseId) {
  return createAction(REMOVE_ACTION)({ actionToRemove, phaseId });
}

export function removePhase (phaseToRemove) {
  return createAction(REMOVE_PHASE)(phaseToRemove);
}

export function setDocumentState (newState) {
  return createAction(SET_DOCUMENT_STATE)(newState);
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

  return createAction(EXECUTE_IMPORT)({ level, itemParent, parentLevel, itemLevel, newId, newItems });
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

  itemList = parentLevel === 'tos'
    ? reorderedList.reduce((result, item) => {
      const key = item.id;
      result[key] = item;
      return result;
    }, {})
    : itemList;

  return createAction(EXECUTE_ORDER_CHANGE)({ itemList, itemType, itemParent, parentLevel, itemLevel, parentList });
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
    dispatch(createAction(REQUEST_TOS)());
    const tos = Object.assign({}, getState().selectedTOS);
    const newTos = Object.assign({}, tos);
    const finalPhases = normalizeTosForApi(newTos);
    const denormalizedTos = update(tos, { phases: { $set: finalPhases } });

    return api.put(`function/${tos.id}`, denormalizedTos)
      .then(res => {
        if (!res.ok) {
          dispatch(createAction(TOS_ERROR)());
          throw Error(res.statusText);
        }
        return res.json();
      })
      .then(json => dispatch(receiveTOS(json)));
  };
}

// ------------------------------------
// Action Handlers
// ------------------------------------
const requestTosAction = (state) => {
  return update(state, {
    isFetching: {
      $set: true
    }
  });
};

const receiveTosAction = (state, { payload }) => {
  const tos = payload.entities.tos[payload.result];
  return update(state, {
    $merge: tos,
    attributes: {
      $set: payload.entities.tos[payload.result].attributes
    },
    actions: {
      $set: payload.entities.actions ? payload.entities.actions : {}
    },
    phases: {
      $set: payload.entities.phases ? payload.entities.phases : {}
    },
    records: {
      $set: payload.entities.records ? payload.entities.records : {}
    },
    lastUpdated: {
      $set: payload.receivedAt
    },
    documentState: {
      $set: 'view'
    },
    isFetching: {
      $set: false
    }
  });
};

const resetTosAction = (state, { payload }) => {
  return update(state, {
    $merge: payload,
    documentState: {
      $set: 'view'
    }
  });
};

const clearTosAction = () => {
  return initialState;
};

const tosErrorAction = (state) => {
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
};

const setPhaseVisibilityAction = (state, { payload }) => {
  return update(state, {
    phases: {
      [payload.phase]: {
        is_open: {
          $set: payload.visibility
        }
      }
    }
  });
};

const setPhasesVisibilityAction = (state, { payload }) => {
  return update(state, {
    phases: {
      $set: payload
    }
  });
};

const addActionAction = (state, { payload }) => {
  return update(state, {
    phases: {
      [payload.phase]: {
        actions: {
          $push: [payload.id]
        }
      }
    },
    actions: {
      [payload.id]: {
        $set: payload
      }
    }
  });
};

const addPhaseAction = (state, { payload }) => {
  return update(state, {
    phases: {
      [payload.id]: {
        $set: payload
      }
    }
  });
};

const addRecordAction = (state, { payload }) => {
  return update(state, {
    actions: {
      [payload.actionIndex]: {
        records: {
          $push: [payload.recordId]
        }
      }
    },
    records: {
      [payload.recordId]: {
        $set: payload.newRecord
      }
    }
  });
};

const editActionAction = (state, { payload }) => {
  return update(state, {
    actions: {
      [payload.id]: {
        name: {
          $set: payload.name
        }
      }
    }
  });
};

const editPhaseAction = (state, { payload }) => {
  return update(state, {
    phases: {
      [payload.id]: {
        name: {
          $set: payload.name
        }
      }
    }
  });
};

const editRecordAction = (state, { payload }) => {
  return update(state, {
    records: {
      [payload.recordId]: {
        name: {
          $set: payload.editedRecord.name
        },
        attributes: {
          $set: payload.editedRecord.attributes
        }
      }
    }
  });
};

const editRecordAttributeAction = (state, { payload }) => {
  if (payload.name) {
    return update(state, {
      records: {
        [payload.recordId]: {
          name: {
            $set: payload.name
          }
        }
      }
    });
  } else if (payload.type) {
    return update(state, {
      records: {
        [payload.recordId]: {
          attributes: {
            RecordType: {
              $set: payload.type
            }
          }
        }
      }
    });
  } else if (payload.tosAttribute) {
    return update(state, {
      attributes: {
        [payload.attributeIndex]: {
          $set: payload.tosAttribute
        }
      }
    });
  } else {
    return update(state, {
      records: {
        [payload.recordId]: {
          attributes: {
            [payload.attributeIndex]: {
              $set: payload.attribute
            }
          }
        }
      }
    });
  }
};

const editMetaDataAction = (state, { payload }) => {
  return update(state, {
    attributes: {
      $set: payload
    }
  });
};

const removeActionAction = (state, { payload }) => {
  const stateCopy = Object.assign({}, state);
  const actionIndex = indexOf(
    stateCopy.phases[payload.phaseId].actions,
    payload.actionToRemove
  );

  const recordsUnderAction = stateCopy.actions[payload.actionToRemove].records;
  for (const record in stateCopy.records) {
    if (includes(recordsUnderAction, record)) {
      delete stateCopy.records[record];
    }
  }

  delete stateCopy.actions[payload.actionToRemove];
  return update(state, {
    actions: {
      $set: stateCopy.actions
    },
    phases: {
      [payload.phaseId]: {
        actions: {
          $splice: [[actionIndex, 1]]
        }
      }
    },
    records: {
      $set: stateCopy.records
    }
  });
};

const removePhaseAction = (state, { payload }) => {
  const phasesCopy = Object.assign({}, state.phases);
  delete phasesCopy[payload];

  return update(state, {
    phases: {
      $set: phasesCopy
    }
  });
};

const removeRecordAction = (state, { payload }) => {
  // TODO: Removes a faulty one (index+1)
  const stateCopy = Object.assign({}, state);

  const recordIndex = indexOf(
    stateCopy.actions[payload.actionId].records,
    payload.recordToRemove
  );

  delete stateCopy.records[payload.recordToRemove];
  return update(state, {
    records: {
      $set: stateCopy.records
    },
    actions: {
      [payload.actionId]: {
        records: {
          $splice: [[recordIndex, 1]]
        }
      }
    }
  });
};

const setDocumentStateAction = (state, { payload }) => {
  return update(state, {
    documentState: {
      $set: payload
    }
  });
};

const executeImportAction = (state, { payload }) => {
  if (payload.level === 'phase') {
    return update(state, {
      [payload.itemLevel]: {
        $set: payload.newItems
      }
    });
  } else {
    return update(state, {
      [payload.parentLevel]: {
        [payload.itemParent]: {
          [payload.itemLevel]: {
            $push: [payload.newId]
          }
        }
      },
      [payload.itemLevel]: {
        $set: payload.newItems
      }
    });
  }
};

const executeOrderChangeAction = (state, { payload }) => {
  if (payload.itemType === 'phase') {
    return update(state, {
      [payload.itemLevel]: {
        $set: payload.itemList
      }
    });
  } else {
    return update(state, {
      [payload.parentLevel]: {
        [payload.itemParent]: {
          [payload.itemLevel]: {
            $set: payload.parentList
          }
        }
      },
      [payload.itemLevel]: {
        $set: payload.itemList
      }
    });
  }
};

export default handleActions({
  requestTosAction,
  receiveTosAction,
  resetTosAction,
  clearTosAction,
  tosErrorAction,
  setPhaseVisibilityAction,
  setPhasesVisibilityAction,
  addActionAction,
  addPhaseAction,
  addRecordAction,
  editActionAction,
  editPhaseAction,
  editRecordAction,
  editRecordAttributeAction,
  editMetaDataAction,
  removeActionAction,
  removePhaseAction,
  removeRecordAction,
  setDocumentStateAction,
  executeImportAction,
  executeOrderChangeAction
}, initialState);
