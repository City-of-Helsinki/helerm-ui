import update from 'immutability-helper';
import { createAction, handleActions } from 'redux-actions';

import { default as api } from '../../utils/api';
import { fetchNavigation } from '../Navigation/reducer';

const initialState = {
  id: null,
  function: null,
  code: null,
  parent: null,
  title: null,
  description: null,
  description_internal: null,
  related_classification: null,
  additional_information: null,
  state: null,
  created_at: null,
  modified_at: null,
  isFetching: false
};

// ------------------------------------
// Constants
// ------------------------------------
export const REQUEST_CLASSIFICATION = 'requestClassificationAction';
export const RECEIVE_CLASSIFICATION = 'receiveClassificationAction';
export const CLEAR_CLASSIFICATION = 'clearClassificationAction';
export const CLASSIFICATION_ERROR = 'classificationErrorAction';
export const CREATE_TOS = 'createTosAction';
export const RECEIVE_NEW_TOS = 'receiveNewTosAction';
export const TOS_ERROR = 'tosErrorAction';

// ------------------------------------
// Actions
// ------------------------------------
export function receiveClassification (classification) {
  const data = Object.assign({}, initialState, classification);
  return createAction(RECEIVE_CLASSIFICATION)(data);
}

export function fetchClassification (classificationId, params = {}) {
  return function (dispatch) {
    dispatch(createAction(REQUEST_CLASSIFICATION)());
    return api
      .get(`classification/${classificationId}`, params)
      .then(res => {
        if (!res.ok) {
          dispatch(createAction(CLASSIFICATION_ERROR)());
          throw new URIError(res.statusText);
        }
        return res.json();
      })
      .then(json => dispatch(receiveClassification(json)));
  };
}

export function clearClassification () {
  return createAction(CLEAR_CLASSIFICATION)();
}

export function createTos () {
  return function (dispatch, getState) {
    dispatch(createAction(CREATE_TOS)());
    const classification = Object.assign({}, getState().classification);
    const newTos = Object.assign(
      {},
      {
        classification: classification.id
      }
    );

    return api
      .post('function', newTos)
      .then(res => {
        if (!res.ok) {
          dispatch(createAction(TOS_ERROR)());
          throw Error(res.statusText);
        }
        return res.json();
      })
      .then(json => {
        const includeRelated = getState().navigation.includeRelated;
        dispatch(fetchNavigation(includeRelated));
        return dispatch(receiveNewTOS(json));
      });
  };
}

export function receiveNewTOS (tos) {
  const data = Object.assign({}, tos);

  return createAction(RECEIVE_NEW_TOS)(data);
}

// ------------------------------------
// Action Handlers
// ------------------------------------
const requestClassificationAction = state => {
  return update(state, {
    isFetching: {
      $set: true
    }
  });
};

const receiveClassificationAction = (state, { payload }) => {
  return update(state, {
    $merge: payload
  });
};

const clearClassificationAction = () => {
  return initialState;
};

const classificationErrorAction = state => {
  return update(state, {
    classification: { $set: null }
  });
};

const createTosAction = state => {
  return update(state, {
    isFetching: {
      $set: true
    }
  });
};

const receiveNewTosAction = (state, { payload }) => {
  return update(state, {
    function: {
      $set: payload.id
    }
  });
};

const tosErrorAction = state => {
  return update(state, {
    function: {
      $set: null
    }
  });
};

export default handleActions(
  {
    requestClassificationAction,
    receiveClassificationAction,
    clearClassificationAction,
    classificationErrorAction,
    createTosAction,
    receiveNewTosAction,
    tosErrorAction
  },
  initialState
);
