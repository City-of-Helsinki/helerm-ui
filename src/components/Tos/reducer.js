/* eslint-disable sonarjs/todo-tag */
/* eslint-disable consistent-return */
/* eslint-disable no-alert */
/* eslint-disable no-param-reassign */
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
import { executeImportAction } from './ImportView/reducer';
import { receiveTemplateAction } from './CloneView/reducer';
import { executeOrderChangeAction } from './Reorder/reducer';
import api from '../../utils/api';
import { normalizeTosFromApi, normalizeTosForApi } from '../../utils/helpers';

export const initialState = {
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
  is_classification_open: false,
  is_open: false,
  is_version_open: false
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
export const SET_CLASSIFICATION_VISIBILITY =
  'setClassificationVisibilityAction';
export const SET_METADATA_VISIBILITY = 'setMetadataVisibilityAction';
export const SET_TOS_VISIBILITY = 'setTosVisibilityAction';
export const SET_VERSION_VISIBILITY = 'setVersionVisibilityAction';

// ------------------------------------
// Actions
// ------------------------------------
/**
 * Receives Terms of Service (TOS) and normalizes it from the API response.
 *
 * @param {Object} tos - The Terms of Service object received from the API.
 * @returns {Object} - The action object with the normalized TOS and receivedAt timestamp.
 */
export function receiveTOS(tos) {
  tos = normalizeTosFromApi(tos);
  const data = { ...tos, receivedAt: Date.now() };

  return createAction(RECEIVE_TOS)(data);
}

/**
 * Clears the Terms of Service (TOS).
 *
 * @returns {Action} The action object to clear the TOS.
 */
export function clearTOS() {
  return createAction(CLEAR_TOS)();
}

/**
 * Resets the Terms of Service (TOS) to its original state.
 *
 * @param {any} originalTos - The original TOS object.
 * @returns {Action} The action object with the type RESET_TOS and the originalTos payload.
 */
export function resetTOS(originalTos) {
  return createAction(RESET_TOS)(originalTos);
}

/**
 * Edits the metadata based on the provided attributes.
 *
 * @param {Object} attributes - The attributes to be edited.
 * @returns {Object} - The edited metadata.
 */
export function editMetaData(attributes) {
  let editedMetaData = {};

  Object.keys(attributes).forEach((key) => {
    if (Object.hasOwn(attributes, key) && attributes[key].checked) {
      editedMetaData = { ...editedMetaData, [key]: attributes[key].value };
    }
  });

  return createAction(EDIT_META_DATA)(editedMetaData);
}

/**
 * Edit valid dates.
 *
 * @param {Date} validDate - The valid date to be edited.
 * @returns {Action} The action object.
 */
export function editValidDates(validDate) {
  return createAction(EDIT_VALID_DATE)(validDate);
}

/**
 * Sets the document state.
 *
 * @param {Object} newState - The new state of the document.
 * @returns {Action} The action object.
 */
export function setDocumentState(newState) {
  return createAction(SET_DOCUMENT_STATE)(newState);
}

/**
 * Fetches the Terms of Service (TOS) with the specified TOS ID and optional parameters.
 *
 * @param {string} tosId - The ID of the TOS to fetch.
 * @param {Object} params - Optional parameters for the API request.
 * @returns {Function} A function that dispatches actions to request and receive the TOS data.
 */
export function fetchTOS(tosId, params = {}) {
  return (dispatch) => {
    dispatch(createAction(REQUEST_TOS)());
    return api
      .get(`function/${tosId}`, params)
      .then((res) => {
        if (!res.ok) {
          throw new URIError(res.statusText);
        }

        return res.json();
      })
      .then((json) => dispatch(receiveTOS(json)))
      .catch(() => dispatch(createAction(TOS_ERROR)()));
  };
}

/**
 * Saves the draft of the Terms of Service (TOS).
 *
 * @returns {Promise<Object>} A promise that resolves to the saved TOS object.
 * @throws {Error} If the saving of the draft fails.
 */
export function saveDraft() {
  return (dispatch, getState) => {
    dispatch(createAction(REQUEST_TOS)());
    const tos = cloneDeep(getState().selectedTOS);
    const newTos = cloneDeep(tos);
    const finalPhases = normalizeTosForApi(newTos);
    const denormalizedTos = update(tos, { phases: { $set: finalPhases } });
    const currentVersion = tos.version;

    return api
      .put(`function/${tos.id}`, denormalizedTos)
      .then((res) => {
        if (!res.ok) {
          return res.json().then((json) => {
            const message = !isEmpty(json)
              ? values(json).join(',')
              : res.statusText;

            throw Error(message);
          });
        }
        return res.json();
      })
      .then((json) => {
        if (json.version !== currentVersion + 1) {
          alert(
            `Muokkasit luonnoksen versiota ${currentVersion}, ` +
            `mutta tallennettaessa versionumero kasvoi enemmän ` +
            `kuin yhdellä. Tarkistathan, että tallentamasi luonnoksen (versio ${json.version
            }) tiedot ovat ajantasalla.`
          );
        }
        dispatch(receiveTOS(json));
        return json;
      })
      .catch(() => dispatch(createAction(TOS_ERROR)()));
  };
}

/**
 * Changes the status of the Terms of Service (TOS).
 *
 * @param {string} status - The new status of the TOS.
 * @returns {Function} A function that dispatches actions to change the status of the TOS.
 */
export function changeStatus(status) {
  return (dispatch, getState) => {
    dispatch(createAction(REQUEST_TOS)());
    const tos = { ...getState().selectedTOS };
    const { includeRelated } = getState().navigation;

    return api
      .patch(`function/${tos.id}`, { state: status })
      .then((res) => {
        if (!res.ok) {
          throw Error(res.statusText);
        }
        return res.json();
      })
      .then((json) => dispatch(receiveTOS(json)))
      .then(dispatch(fetchNavigation(includeRelated)))
      .catch(() => dispatch(createAction(TOS_ERROR)()));
  };
}

/**
 * Sets the visibility of the classification.
 *
 * @param {boolean} visibility - The visibility of the classification.
 * @returns {Action} The action object.
 */
export function setClassificationVisibility(visibility) {
  return createAction(SET_CLASSIFICATION_VISIBILITY)(visibility);
}

/**
 * Sets the visibility of metadata.
 *
 * @param {boolean} visibility - The visibility of metadata.
 * @returns {Action} The action object.
 */
export function setMetadataVisibility(visibility) {
  return createAction(SET_METADATA_VISIBILITY)(visibility);
}

/**
 * Sets the visibility of terms of service (TOS) components.
 *
 * @param {Object} tos - The TOS object containing actions, phases, and records.
 * @param {boolean} basicVisibility - The visibility status for basic components.
 * @param {boolean} metaDataVisibility - The visibility status for meta data components.
 * @returns {Object} - The action object with updated visibility settings.
 */
export function setTosVisibility(tos, basicVisibility, metaDataVisibility) {
  const allPhasesOpen = {};
  const allActionsOpen = {};
  const allRecordsOpen = {};
  const { actions, phases, records } = tos;
  Object.keys(phases).forEach((key) => {
    if (Object.hasOwn(phases, key)) {
      allPhasesOpen[key] = update(phases[key], {
        is_attributes_open: {
          $set: metaDataVisibility
        },
        is_open: {
          $set: basicVisibility
        }
      });
      Object.keys(actions).forEach((actionKey) => {
        if (Object.hasOwn(actions, actionKey)) {
          allActionsOpen[actionKey] = update(actions[actionKey], {
            is_open: {
              $set: metaDataVisibility
            }
          });
        }
        Object.keys(records).forEach((recordKey) => {
          if (Object.hasOwn(records, recordKey)) {
            allRecordsOpen[recordKey] = update(records[recordKey], {
              is_open: {
                $set: metaDataVisibility
              }
            });
          }
        });
      });
    }
  });
  return createAction(SET_TOS_VISIBILITY)({
    actions: allActionsOpen,
    phases: allPhasesOpen,
    records: allRecordsOpen,
    basicVisibility,
    metaDataVisibility
  });
}

/**
 * Sets the visibility of the version.
 *
 * @param {boolean} visibility - The visibility of the version.
 * @returns {Action} - The action object.
 */
export function setVersionVisibility(visibility) {
  return createAction(SET_VERSION_VISIBILITY)(visibility);
}

// ------------------------------------
// Action Handlers
// ------------------------------------
const requestTosAction = (state) => update(state, {
  isFetching: {
    $set: true
  }
});

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
    is_classification_open: {
      $set: false
    },
    is_open: {
      $set: false
    },
    is_version_open: {
      $set: false
    }
  });
};

const resetTosAction = (state, { payload }) => update(state, {
  $merge: payload,
  documentState: {
    $set: 'view'
  }
});

const clearTosAction = () => initialState;

const tosErrorAction = (state) => {
  // TODO: Find out what mutates store so hard...
  const actions = {};
  const phases = {};

  map(state.actions, (action) => {
    Object.assign(actions, { [action.id]: action });
    return map(action.records, (record, recordIndex) => {
      if (record && typeof record !== 'undefined') {
        const recordId = typeof record === 'string' ? record : record.id;
        return Object.assign(actions[action.id].records, {
          [recordIndex]: recordId
        });
      }
    });
  });

  map(state.phases, (phase) => {
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

const editMetaDataAction = (state, { payload }) => update(state, {
  attributes: {
    $set: payload
  }
});

const editValidDateAction = (state, { payload }) => update(state, {
  valid_from: {
    $set:
      payload.validFrom !== undefined ? payload.validFrom : state.valid_from
  },
  valid_to: {
    $set: payload.validTo !== undefined ? payload.validTo : state.valid_to
  }
});

const setDocumentStateAction = (state, { payload }) => update(state, {
  documentState: {
    $set: payload
  }
});

const setClassificationVisibilityAction = (state, { payload }) => update(state, {
  is_classification_open: { $set: payload }
});

const setMetadataVisibilityAction = (state, { payload }) => update(state, {
  is_open: { $set: payload }
});

const setTosVisibilityAction = (state, { payload }) => {
  const {
    actions,
    phases,
    records,
    basicVisibility,
    metaDataVisibility
  } = payload;
  return update(state, {
    actions: { $set: actions },
    is_classification_open: { $set: basicVisibility },
    is_open: { $set: metaDataVisibility },
    is_version_open: { $set: metaDataVisibility },
    phases: { $set: phases },
    records: { $set: records }
  });
};

const setVersionVisibilityAction = (state, { payload }) => update(state, {
  is_version_open: { $set: payload }
});

export default handleActions(
  {
    requestTosAction,
    receiveTosAction,
    resetTosAction,
    clearTosAction,
    receiveTemplateAction,
    tosErrorAction,
    setActionVisibilityAction,
    setClassificationVisibilityAction,
    setMetadataVisibilityAction,
    setPhaseAttributesVisibilityAction,
    setPhaseVisibilityAction,
    setPhasesVisibilityAction,
    setRecordVisibilityAction,
    setTosVisibilityAction,
    setVersionVisibilityAction,
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
  },
  initialState
);
