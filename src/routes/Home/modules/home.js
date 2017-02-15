import fetch from 'isomorphic-fetch';
import update from 'immutability-helper';
import { normalize, Schema, arrayOf } from 'normalizr';

import { convertToTree } from '../../../utils/helpers.js';

// ------------------------------------
// Constants
// ------------------------------------
export const RECEIVE_RECORDTYPES = 'home/RECEIVE_RECORDTYPES';
export const RECEIVE_ATTRIBUTE_TYPES = 'home/RECEIVE_ATTRIBUTE_TYPES';

export const CLOSE_MESSAGE = 'home/CLOSE_MESSAGE';

// ------------------------------------
// Actions
// ------------------------------------
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

export function closeMessage() {
  return {
    type: CLOSE_MESSAGE
  }
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

export const actions = {
  receiveRecordTypes,
  receiveAttributeTypes,
  closeMessage,
  fetchRecordTypes,
  fetchAttributeTypes
};

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
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
