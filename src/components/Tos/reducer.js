import update from 'immutability-helper';
import { createAction, handleActions } from 'redux-actions';
import { cloneDeep, isEmpty, map, values } from 'lodash';

import { fetchNavigation } from '../Navigation/reducer';
import {
  addActionAction,
  editActionAction,
  editActionAttributeAction,
  removeActionAction,
  setActionVisibilityAction
} from './Action/reducer';

import {
  addPhaseAction,
  editPhaseAction,
  editPhaseAttributeAction,
  removePhaseAction,
  setPhaseAttributesVisibilityAction,
  setPhaseVisibilityAction,
  setPhasesVisibilityAction
} from './Phase/reducer';

import {
  addRecordAction,
  editRecordAction,
  editRecordAttributeAction,
  removeRecordAction,
  setRecordVisibilityAction
} from './Record/reducer';

import {
  executeImportAction
} from './ImportView/reducer';

import {
  receiveTemplateAction
} from './CloneView/reducer';

import { executeOrderChangeAction } from './Reorder/reducer';

import { default as api } from '../../utils/api';
import { normalizeTosFromApi, normalizeTosForApi } from '../../utils/helpers';

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
  modified_by: null,
  valid_from: null,
  valid_to: null,
  actions: {},
  phases: {},
  records: {},
  attributes: {},
  documentState: 'view',
  lastUpdated: 0,
  isFetching: false,
  is_open: false
};

// ------------------------------------
// Constants
// ------------------------------------
export const REQUEST_TOS = 'requestTosAction';
export const RECEIVE_TOS = 'receiveTosAction';
export const TOS_ERROR = 'tosErrorAction';
export const RESET_TOS = 'resetTosAction';
export const CLEAR_TOS = 'clearTosAction';
export const EDIT_META_DATA = 'editMetaDataAction';
export const EDIT_VALID_DATE = 'editValidDateAction';
export const SET_DOCUMENT_STATE = 'setDocumentStateAction';
export const SET_METADATA_VISIBILITY = 'setMetadataVisibilityAction';
export const SET_TOS_VISIBILITY = 'setTosVisibilityAction';

// ------------------------------------
// Actions
// ------------------------------------
export function receiveTOS (tos) {
  tos = normalizeTosFromApi(tos);
  const data = Object.assign({}, tos, { receivedAt: Date.now() });

  return createAction(RECEIVE_TOS)(data);
}

export function clearTOS () {
  return createAction(CLEAR_TOS)();
}

export function resetTOS (originalTos) {
  return createAction(RESET_TOS)(originalTos);
}

export function editMetaData (attributes) {
  let editedMetaData = {};

  for (const key in attributes) {
    if (attributes.hasOwnProperty(key)) {
      if (attributes[key].checked === true) {
        editedMetaData = Object.assign({}, editedMetaData, { [key]: attributes[key].value });
      }
    }
  }

  return createAction(EDIT_META_DATA)(editedMetaData);
}

export function editValidDates (validDate) {
  return createAction(EDIT_VALID_DATE)(validDate);
}

export function setDocumentState (newState) {
  return createAction(SET_DOCUMENT_STATE)(newState);
}

export function fetchTOS (tosId, params = {}) {
  return function (dispatch) {
    dispatch(createAction(REQUEST_TOS)());
    return api.get(`function/${tosId}`, params)
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

export function saveDraft () {
  return function (dispatch, getState) {
    dispatch(createAction(REQUEST_TOS)());
    const tos = cloneDeep(getState().selectedTOS);
    const newTos = cloneDeep(tos);
    const finalPhases = normalizeTosForApi(newTos);
    const denormalizedTos = update(tos, { phases: { $set: finalPhases } });
    const currentVersion = tos.version;

    return api.put(`function/${tos.id}`, denormalizedTos)
      .then(res => {
        if (!res.ok) {
          return res.json()
            .then(json => {
              const message = !isEmpty(json) ? values(json).join(',') : res.statusText;
              dispatch(createAction(TOS_ERROR)());
              throw Error(message);
            });
        }
        return res.json();
      })
      .then(json => {
        if (json.version !== currentVersion + 1) {
          alert(
            `Muokkasit luonnoksen versiota ${currentVersion}, ` +
              `mutta tallennettaessa versionumero kasvoi enemmän ` +
              `kuin yhdellä. Tarkistathan, että tallentamasi luonnoksen (versio ${
                json.version
              }) tiedot ovat ajantasalla.`
          );
        }
        dispatch(receiveTOS(json));
      });
  };
}

export function changeStatus (status) {
  return function (dispatch, getState) {
    dispatch(createAction(REQUEST_TOS)());
    const tos = Object.assign({}, getState().selectedTOS);
    const includeRelated = getState().navigation.includeRelated;

    return api.patch(`function/${tos.id}`, { state: status })
      .then(res => {
        if (!res.ok) {
          dispatch(createAction(TOS_ERROR)());
          throw Error(res.statusText);
        }
        return res.json();
      })
      .then(json => dispatch(receiveTOS(json)))
      .then(dispatch(fetchNavigation(includeRelated)));
  };
}

export function setMetadataVisibility (visibility) {
  return createAction(SET_METADATA_VISIBILITY)(visibility);
}

export function setTosVisibility (tos, visibility) {
  const allPhasesOpen = {};
  const allActionsOpen = {};
  const allRecordsOpen = {};
  const { actions, phases, records } = tos;
  for (const key in phases) {
    if (phases.hasOwnProperty(key)) {
      allPhasesOpen[key] = update(phases[key], {
        is_attributes_open: {
          $set: visibility
        },
        is_open: {
          $set: visibility
        }
      });
      for (const actionKey in actions) {
        if (actions.hasOwnProperty(actionKey)) {
          allActionsOpen[actionKey] = update(actions[actionKey], {
            is_open: {
              $set: visibility
            }
          });
        }
        for (const recordKey in records) {
          if (records.hasOwnProperty(recordKey)) {
            allRecordsOpen[recordKey] = update(records[recordKey], {
              is_open: {
                $set: visibility
              }
            });
          }
        }
      }
    }
  }
  return createAction(SET_TOS_VISIBILITY)({ actions: allActionsOpen, phases: allPhasesOpen, records: allRecordsOpen, visibility });
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
    },
    is_open: {
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
    Object.assign(actions, { [action.id]: action });
    return map(action.records, (record, recordIndex) => {
      if (record && typeof record !== 'undefined') {
        const recordId = typeof record === 'string' ? record : record.id;
        return Object.assign(actions[action.id].records, { [recordIndex]: recordId });
      }
    });
  });

  map(state.phases, phase => {
    Object.assign(phases, { [phase.id]: phase });
    return map(phase.actions, (action, actionIndex) => {
      if (action && typeof action !== 'undefined') {
        const actionId = typeof action === 'string' ? action : action.id;
        Object.assign(phases[phase.id].actions, { [actionIndex]: actionId });
      }
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

const editMetaDataAction = (state, { payload }) => {
  return update(state, {
    attributes: {
      $set: payload
    }
  });
};

const editValidDateAction = (state, { payload }) => {
  return update(state, {
    valid_from: { $set: payload.validFrom !== undefined ? payload.validFrom : state.valid_from },
    valid_to: { $set: payload.validTo !== undefined ? payload.validTo : state.valid_to }
  });
};

const setDocumentStateAction = (state, { payload }) => {
  return update(state, {
    documentState: {
      $set: payload
    }
  });
};

const setMetadataVisibilityAction = (state, { payload }) => {
  return update(state, {
    is_open: { $set: payload }
  });
};

const setTosVisibilityAction = (state, { payload }) => {
  const { actions, phases, records, visibility } = payload;
  return update(state, {
    actions: { $set: actions },
    is_open: { $set: visibility },
    phases: { $set: phases },
    records: { $set: records }
  });
};

export default handleActions({
  requestTosAction,
  receiveTosAction,
  resetTosAction,
  clearTosAction,
  receiveTemplateAction,
  tosErrorAction,
  setActionVisibilityAction,
  setMetadataVisibilityAction,
  setPhaseAttributesVisibilityAction,
  setPhaseVisibilityAction,
  setPhasesVisibilityAction,
  setRecordVisibilityAction,
  setTosVisibilityAction,
  addActionAction,
  addPhaseAction,
  addRecordAction,
  editActionAction,
  editActionAttributeAction,
  editPhaseAction,
  editPhaseAttributeAction,
  editRecordAction,
  editRecordAttributeAction,
  editMetaDataAction,
  editValidDateAction,
  removeActionAction,
  removePhaseAction,
  removeRecordAction,
  setDocumentStateAction,
  executeImportAction,
  executeOrderChangeAction
}, initialState);
