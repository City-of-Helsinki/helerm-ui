import update from 'immutability-helper';
import { createAction, handleActions } from 'redux-actions';
import { isArray, orderBy } from 'lodash';

import { DEFAULT_PAGE_SIZE } from '../../../config/constants';
import { default as api } from '../../utils/api.js';

const initialState = {
  selectedBulk: null,
  bulkUpdates: [],
  isFetching: false,
  isFetchingSelected: false,
  isSaving: false
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
export const CLEAR_SELECTED_BULK_UPDATE = 'clearSelectedBulkUpdateAction';

export function receiveFetchBulkUpdates (resp) {
  const results = resp.results || [];
  return createAction(FETCH_BULK_UPDATES_RECEIVE)(results);
}

export function fetchBulkUpdates (includeApproved = false) {
  return function (dispatch) {
    dispatch(createAction(FETCH_BULK_UPDATES_REQUEST));
    return api.get('bulk-update', includeApproved ? { include_approved: true, page_size: DEFAULT_PAGE_SIZE } : {})
      .then(response => response.json())
      .then(json =>
        dispatch(receiveFetchBulkUpdates(json))
      )
      .catch(() => dispatch(createAction(FETCH_BULK_UPDATES_ERROR)()));
  };
}

export function fetchBulkUpdate (id) {
  return function (dispatch) {
    dispatch(createAction(FETCH_BULK_UPDATE_REQUEST));
    return api.get(`bulk-update/${id}`, { include_approved: true })
      .then(response => response.json())
      .then(json =>
        dispatch(createAction(FETCH_BULK_UPDATE_RECEIVE)(json))
      )
      .catch(() => dispatch(createAction(FETCH_BULK_UPDATE_ERROR)()));
  };
}

export function approveBulkUpdate (id) {
  return function (dispatch) {
    dispatch(createAction(APPROVE_BULK_UPDATE_REQUEST));
    return api.post(`bulk-update/${id}/approve`)
      .then(res => {
        if (!res.ok) {
          dispatch(createAction(APPROVE_BULK_UPDATE_ERROR)());
          throw Error(res.statusText);
        }
        return true;
      })
      .then(success => {
        return dispatch(createAction(APPROVE_BULK_UPDATE_RECEIVE)(success));
      });
  };
}

export function deleteBulkUpdate (id) {
  return function (dispatch) {
    dispatch(createAction(DELETE_BULK_UPDATE_REQUEST));
    return api.del(`bulk-update/${id}`)
      .then(res => {
        if (!res.ok) {
          dispatch(createAction(DELETE_BULK_UPDATE_ERROR)());
          throw Error(res.statusText);
        }
        return true;
      })
      .then(success =>
        dispatch(createAction(DELETE_BULK_UPDATE_RECEIVE)(success))
      );
  };
}

export function receiveCreateBulkUpdate (resp) {
  return createAction(SAVE_BULK_UPDATE_RECEIVE)(resp);
}

export function saveBulkUpdate (bulkUpdate) {
  return function (dispatch) {
    dispatch(createAction(SAVE_BULK_UPDATE_REQUEST)());
    return api.post('bulk-update', bulkUpdate)
      .then(response => response.json())
      .then(json => {
        dispatch(receiveCreateBulkUpdate(json));
      })
      .catch(() => dispatch(createAction(SAVE_BULK_UPDATE_ERROR)()));
  };
}

export function clearSelectedBulkUpdate () {
  return createAction(CLEAR_SELECTED_BULK_UPDATE)();
}

const approveBulkUpdateErrorAction = (state) => {
  return update(state, {
    isFetching: { $set: false }
  });
};

const approveBulkUpdateReceiveAction = (state, { payload }) => {
  return update(state, {
    isFetching: { $set: false }
  });
};

const approveBulkUpdateRequestAction = (state) => {
  return update(state, {
    isFetching: { $set: true }
  });
};

const deleteBulkUpdateErrorAction = (state) => {
  return update(state, {
    isFetching: { $set: false }
  });
};

const deleteBulkUpdateReceiveAction = (state, { payload }) => {
  return update(state, {
    selectedBulk: { $set: null },
    isFetching: { $set: false }
  });
};

const deleteBulkUpdateRequestAction = (state) => {
  return update(state, {
    isFetching: { $set: true }
  });
};

const fetchBulkUpdatesErrorAction = (state) => {
  return update(state, {
    isFetching: { $set: false }
  });
};

const fetchBulkUpdatesRequestAction = (state) => {
  return update(state, {
    isFetching: { $set: true }
  });
};

const fetchBulkUpdatesReceiveAction = (state, { payload }) => {
  const sortedBulkUpdates = isArray(payload) ? orderBy(payload, ['created_at'], ['desc']) : [];
  return update(state, {
    bulkUpdates: { $set: sortedBulkUpdates },
    isFetching: { $set: false }
  });
};

const fetchBulkUpdateErrorAction = (state) => {
  return update(state, {
    isFetchingSelected: { $set: false }
  });
};

const fetchBulkUpdateRequestAction = (state) => {
  return update(state, {
    isFetchingSelected: { $set: true }
  });
};

const fetchBulkUpdateReceiveAction = (state, { payload }) => {
  return update(state, {
    selectedBulk: { $set: payload },
    isFetchingSelected: { $set: false }
  });
};

const saveBulkUpdateErrorAction = (state) => {
  return update(state, {
    isSaving: { $set: false }
  });
};

const saveBulkUpdateRequestAction = (state) => {
  return update(state, {
    isSaving: { $set: true }
  });
};

const saveBulkUpdateReceiveAction = (state, { payload }) => {
  return update(state, {
    isSaving: { $set: false }
  });
};

const clearSelectedBulkUpdateAction = (state) => {
  return update(state, {
    selectedBulk: { $set: null }
  });
};

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
  saveBulkUpdateReceiveAction
}, initialState);
