/* eslint-disable import/no-named-as-default-member */
import update from 'immutability-helper';
import { createAction, handleActions } from 'redux-actions';

import api from '../../utils/api';
import { fetchNavigation } from '../../components/Navigation/reducer';

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
export function receiveClassification(classification) {
  const data = { ...initialState, ...classification };
  return createAction(RECEIVE_CLASSIFICATION)(data);
}

export function fetchClassification(classificationId, params = {}) {
  return (dispatch) => {
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

export function clearClassification() {
  return createAction(CLEAR_CLASSIFICATION)();
}

export function receiveNewTOS(tos) {
  const data = { ...tos };

  return createAction(RECEIVE_NEW_TOS)(data);
}

export function createTos() {
  return (dispatch, getState) => {
    dispatch(createAction(CREATE_TOS)());
    const classification = { ...getState().classification };
    const newTos = {

      classification: { id: classification.id, version: classification.version }
    };

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
        const { includeRelated } = getState().navigation;
        dispatch(fetchNavigation(includeRelated));
        return dispatch(receiveNewTOS(json));
      });
  };
}

const setIsFetching = (state) => update(state, {
  isFetching: {
    $set: true
  }
})


// ------------------------------------
// Action Handlers
// ------------------------------------
const requestClassificationAction = state => setIsFetching(state);

const receiveClassificationAction = (state, { payload }) => update(state, {
  $merge: payload
});

const clearClassificationAction = () => initialState;

const classificationErrorAction = state => update(state, {
  classification: { $set: null }
});

const createTosAction = state => setIsFetching(state);

const receiveNewTosAction = (state, { payload }) => update(state, {
  function: {
    $set: payload.id
  }
});

const tosErrorAction = state => update(state, {
  function: {
    $set: null
  }
});

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
