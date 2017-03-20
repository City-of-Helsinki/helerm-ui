import update from 'immutability-helper';
import { createAction, handleActions } from 'redux-actions';

import { default as api } from '../utils/api';

const initialState = {
  isFetching: false,
  recordTypes: {},
  attributeTypes: {}
};

export const RECEIVE_ATTRIBUTE_TYPES = 'receiveAttributeTypesAction';

export function receiveAttributeTypes (attributes, validationRules) {
  const attributeTypeList = {};
  attributes.results.map(result => {
    if (result.values) {
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

  return createAction(RECEIVE_ATTRIBUTE_TYPES)(attributeTypeList);
}

export function fetchAttributeTypes () {
  return function (dispatch) {
    return api.get('attribute/schemas')
      .then(response => response.json())
      .then(validationRules => {
        return api.get('attribute')
          .then(response => response.json())
          .then(json =>
            dispatch(receiveAttributeTypes(json, validationRules)));
      });
  };
}

const receiveAttributeTypesAction = (state, { payload }) => {
  const recordTypes = payload.RecordType;
  const recordTypeList = {};
  recordTypes.values.map(result => {
    const trimmedResult = result.id.replace(/-/g, '');
    recordTypeList[trimmedResult] = {
      id: result.id,
      name: result.value
    };
  });
  delete payload.RecordType;
  return update(state, {
    attributeTypes: { $set: payload },
    recordTypes: { $set: recordTypeList }
  });
};

export default handleActions({
  receiveAttributeTypesAction
}, initialState);
