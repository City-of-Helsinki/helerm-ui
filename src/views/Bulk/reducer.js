import update from 'immutability-helper';
import { createAction, handleActions } from 'redux-actions';
import { isArray, orderBy } from 'lodash';

import { DEFAULT_PAGE_SIZE } from '../../constants';
import api from '../../utils/api';

const initialState = {
  selectedBulk: null,
  bulkUpdates: [],
  isFetching: false,
  isFetchingSelected: false,
  isSaving: false,
  isUpdating: false
};

export const APPROVE_BULK_UPDATE_REQUEST = 'approveBulkUpdateRequestAction';
export const APPROVE_BULK_UPDATE_RECEIVE = 'approveBulkUpdateReceiveAction';
export const APPROVE_BULK_UPDATE_ERROR = 'approveBulkUpdateErrorAction';
export const DELETE_BULK_UPDATE_REQUEST = 'deleteBulkUpdateRequestAction';
export const DELETE_BULK_UPDATE_RECEIVE = 'deleteBulkUpdateReceiveAction';
export const DELETE_BULK_UPDATE_ERROR = 'deleteBulkUpdateErrorAction';
export const FETCH_BULK_UPDATES_REQUEST = 'fetchBulkUpdatesRequestAction';
export const FETCH_BULK_UPDATES_RECEIVE = 'fetchBulkUpdatesReceiveAction';
export const FETCH_BULK_UPDATES_ERROR = 'fetchBulkUpdatesErrorAction';
export const FETCH_BULK_UPDATE_REQUEST = 'fetchBulkUpdateRequestAction';
export const FETCH_BULK_UPDATE_RECEIVE = 'fetchBulkUpdateReceiveAction';
export const FETCH_BULK_UPDATE_ERROR = 'fetchBulkUpdateErrorAction';
export const SAVE_BULK_UPDATE_REQUEST = 'saveBulkUpdateRequestAction';
export const SAVE_BULK_UPDATE_RECEIVE = 'saveBulkUpdateReceiveAction';
export const SAVE_BULK_UPDATE_ERROR = 'saveBulkUpdateErrorAction';
export const UPDATE_BULK_UPDATE_REQUEST = 'updateBulkUpdateRequestAction';
export const UPDATE_BULK_UPDATE_RECEIVE = 'updateBulkUpdateReceiveAction';
export const UPDATE_BULK_UPDATE_ERROR = 'updateBulkUpdateErrorAction';
export const CLEAR_SELECTED_BULK_UPDATE = 'clearSelectedBulkUpdateAction';

/**
 * Receives the response from the fetch bulk updates API call and returns an action with the received results.
 * @param {Object} resp - The response object from the API call.
 * @returns {Object} - The action object with the received results.
 */
export function receiveFetchBulkUpdates(resp) {
  const results = resp.results || [];
  return createAction(FETCH_BULK_UPDATES_RECEIVE)(results);
}

/**
 * Fetches bulk updates.
 *
 * @param {boolean} includeApproved - Whether to include approved updates.
 * @returns {Function} - A function that dispatches actions.
 */
export function fetchBulkUpdates(includeApproved = false) {
  return (dispatch) => {
    dispatch(createAction(FETCH_BULK_UPDATES_REQUEST));
    return api.get('bulk-update', includeApproved ? { include_approved: true, page_size: DEFAULT_PAGE_SIZE } : {})
      .then(response => response.json())
      .then(json =>
        dispatch(receiveFetchBulkUpdates(json))
      )
      .catch(() => dispatch(createAction(FETCH_BULK_UPDATES_ERROR)()));
  };
}

/**
 * Fetches bulk update data from the server.
 *
 * @param {string} id - The ID of the bulk update.
 * @returns {Function} A function that dispatches actions.
 */
export function fetchBulkUpdate(id) {
  return (dispatch) => {
    dispatch(createAction(FETCH_BULK_UPDATE_REQUEST));
    return api.get(`bulk-update/${id}`, { include_approved: true })
      .then(response => response.json())
      .then(json =>
        dispatch(createAction(FETCH_BULK_UPDATE_RECEIVE)(json))
      )
      .catch(() => dispatch(createAction(FETCH_BULK_UPDATE_ERROR)()));
  };
}

/**
 * Approves a bulk update.
 *
 * @param {string} id - The ID of the bulk update.
 * @returns {Function} A function that dispatches actions for approving the bulk update.
 */
export function approveBulkUpdate(id) {
  return (dispatch) => {
    dispatch(createAction(APPROVE_BULK_UPDATE_REQUEST));
    return api.post(`bulk-update/${id}/approve`)
      .then(res => {
        if (!res.ok) {
          throw Error(res.statusText);
        }
        return true;
      })
      .then(success => dispatch(createAction(APPROVE_BULK_UPDATE_RECEIVE)(success)))
      .catch(() => dispatch(createAction(APPROVE_BULK_UPDATE_ERROR)()));
  };
}

/**
 * Deletes a bulk update by its ID.
 *
 * @param {number} id - The ID of the bulk update to delete.
 * @returns {Promise<boolean>} A promise that resolves to true if the bulk update was deleted successfully.
 */
export function deleteBulkUpdate(id) {
  return (dispatch) => {
    dispatch(createAction(DELETE_BULK_UPDATE_REQUEST));
    return api.del(`bulk-update/${id}`)
      .then(res => {
        if (!res.ok) {
          throw Error(res.statusText);
        }
        return true;
      })
      .then(success =>
        dispatch(createAction(DELETE_BULK_UPDATE_RECEIVE)(success))
      )
      .catch(() => dispatch(createAction(DELETE_BULK_UPDATE_ERROR)()));
  };
}

/**
 * Saves a bulk update.
 *
 * @param {Object} bulkUpdate - The bulk update data.
 * @returns {Function} A function that dispatches actions for saving the bulk update.
 */
export function saveBulkUpdate(bulkUpdate) {
  return (dispatch) => {
    dispatch(createAction(SAVE_BULK_UPDATE_REQUEST)());
    return api.post('bulk-update', bulkUpdate)
      .then(response => response.json())
      .then(json => {
        dispatch(createAction(SAVE_BULK_UPDATE_RECEIVE)(json));
      })
      .catch(() => dispatch(createAction(SAVE_BULK_UPDATE_ERROR)()));
  };
}

/**
 * Updates a bulk update with the given ID.
 *
 * @param {string} id - The ID of the bulk update to be updated.
 * @param {object} bulkUpdate - The updated bulk update object.
 * @returns {function} - A function that dispatches actions to update the bulk update.
 */
export function updateBulkUpdate(id, bulkUpdate) {
  return (dispatch) => {
    dispatch(createAction(UPDATE_BULK_UPDATE_REQUEST)());
    return api.patch(`bulk-update/${id}`, bulkUpdate)
      .then(response => response.json())
      .then(json => {
        dispatch(createAction(UPDATE_BULK_UPDATE_RECEIVE)(json));
      })
      .catch(() => dispatch(createAction(UPDATE_BULK_UPDATE_ERROR)()));
  };
}

export function clearSelectedBulkUpdate() {
  return createAction(CLEAR_SELECTED_BULK_UPDATE)();
}

const setIsFetching = (state, fetching) => update(state, {
  isFetching: { $set: fetching }
});

const setIsSaving = (state, saving) => update(state, {
  isSaving: { $set: saving }
});

const approveBulkUpdateErrorAction = (state) => setIsFetching(state, false);

const approveBulkUpdateReceiveAction = (state) => setIsFetching(state, false);

const approveBulkUpdateRequestAction = (state) => setIsFetching(state, true);

const deleteBulkUpdateErrorAction = (state) => setIsFetching(state, false);

const deleteBulkUpdateReceiveAction = (state) => update(state, {
  selectedBulk: { $set: null },
  isFetching: { $set: false }
});

const deleteBulkUpdateRequestAction = (state) => setIsFetching(state, true);

const fetchBulkUpdatesErrorAction = (state) => setIsFetching(state, false);

const fetchBulkUpdatesRequestAction = (state) => setIsFetching(state, true);

const fetchBulkUpdatesReceiveAction = (state, { payload }) => {
  const sortedBulkUpdates = isArray(payload) ? orderBy(payload, ['created_at'], ['desc']) : [];
  return update(state, {
    bulkUpdates: { $set: sortedBulkUpdates },
    isFetching: { $set: false }
  });
};

const fetchBulkUpdateErrorAction = (state) => update(state, {
  isFetchingSelected: { $set: false }
});

const fetchBulkUpdateRequestAction = (state) => update(state, {
  isFetchingSelected: { $set: true }
});

const fetchBulkUpdateReceiveAction = (state, { payload }) => update(state, {
  selectedBulk: { $set: payload },
  isFetchingSelected: { $set: false }
});

const saveBulkUpdateErrorAction = (state) => setIsSaving(state, false)

const saveBulkUpdateRequestAction = (state) => setIsSaving(state, true)

const saveBulkUpdateReceiveAction = (state) => setIsSaving(state, false)

const updateBulkUpdateErrorAction = (state) => update(state, {
  isUpdating: { $set: false }
});

const updateBulkUpdateRequestAction = (state) => update(state, {
  isUpdating: { $set: true }
});

const updateBulkUpdateReceiveAction = (state, { payload }) => update(state, {
  selectedBulk: { $set: payload },
  isUpdating: { $set: false }
});

const clearSelectedBulkUpdateAction = (state) => update(state, {
  selectedBulk: { $set: null }
});

export default handleActions({
  approveBulkUpdateErrorAction,
  approveBulkUpdateReceiveAction,
  approveBulkUpdateRequestAction,
  clearSelectedBulkUpdateAction,
  deleteBulkUpdateErrorAction,
  deleteBulkUpdateRequestAction,
  deleteBulkUpdateReceiveAction,
  fetchBulkUpdateErrorAction,
  fetchBulkUpdateReceiveAction,
  fetchBulkUpdateRequestAction,
  fetchBulkUpdatesErrorAction,
  fetchBulkUpdatesReceiveAction,
  fetchBulkUpdatesRequestAction,
  saveBulkUpdateErrorAction,
  saveBulkUpdateRequestAction,
  saveBulkUpdateReceiveAction,
  updateBulkUpdateErrorAction,
  updateBulkUpdateReceiveAction,
  updateBulkUpdateRequestAction
}, initialState);
