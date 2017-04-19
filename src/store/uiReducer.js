import update from 'immutability-helper';
import { createAction, handleActions } from 'redux-actions';
import find from 'lodash/find';

import { default as api } from '../utils/api';

const initialState = {
  isFetching: false,
  recordTypes: {},
  attributeTypes: {},
  templates: []
};

export const RECEIVE_ATTRIBUTE_TYPES = 'receiveAttributeTypesAction';
export const RECEIVE_TEMPLATES = 'receiveTemplatesAction';

export function receiveAttributeTypes (attributes, validationRules) {
  const attributeTypeList = {};
  attributes.results.map(result => {
    if (result.values) {
      let allowedIn = [];
      let required = false;
      let requiredIn = [];
      let requiredIf = [];

      // Add rules where attribute is allowed to be
      for (const rule in validationRules) {
        if (validationRules[rule].properties[result.identifier]) {
          allowedIn.push(rule);
        }
      }

      // Add basic required if so
      validationRules.record.required.map(rule => {
        if (rule === result.identifier) {
          required = true;
        }
      });

      // Add requiredIn attributes
      Object.keys(validationRules).map(key => {
        validationRules[key].required && validationRules[key].required.map(rule => {
          if (rule === result.identifier) {
            requiredIn.push(key);
          }
        });
      });

      // Add conditional rules if any
      Object.keys(validationRules).map(key => {
        validationRules[key].allOf && validationRules[key].allOf.map(oneOf => {
          Object.keys(oneOf).map(oneOfKey => {
            const rules = oneOf[oneOfKey];
            // We're only interested in required-keys
            const required = rules[0].required;

            required.map(requiredIndentifier => {
              Object.keys(rules[0].properties).map(property => {
                let values = [];
                Object.keys(rules[0].properties[property]).map(key => {
                  rules[0].properties[property][key].map(value => {
                    values.push(value);
                  });
                });

                const exists = !!find(requiredIf, (reqObj) => {
                  return reqObj.key === property;
                });

                if (requiredIndentifier === result.identifier && !exists) {
                  requiredIf.push({
                    key: property,
                    values
                  });
                }
              });
            });
          });
        });
      });

      attributeTypeList[result.identifier] = {
        index: result.index,
        name: result.name,
        values: result.values,
        allowedIn,
        requiredIf,
        requiredIn,
        required
      };
    }
  });

  return createAction(RECEIVE_ATTRIBUTE_TYPES)(attributeTypeList);
}

export function receiveTemplates ({ results }) {
  const onlyIdAndName = results.map(item => ({ id: item.id, name: item.name }));
  return createAction(RECEIVE_TEMPLATES)(onlyIdAndName);
}

export function fetchAttributeTypes () {
  return function (dispatch) {
    dispatch(createAction('requestFromApiAction')());
    return api.get('attribute/schemas')
      .then(response => response.json())
      .then(validationRules => {
        return api.get('attribute', { page_size: 999 })
          .then(response => response.json())
          .then(json =>
            dispatch(receiveAttributeTypes(json, validationRules)));
      });
  };
}

export function fetchTemplates () {
  return function (dispatch) {
    dispatch(createAction('requestFromApiAction')());
    return api.get('template')
      .then(response => response.json())
      .then(res => {
        dispatch(receiveTemplates(res));
      });
  };
}

const requestFromApiAction = (state) => {
  return update(state, {
    isFetching: { $set: true }
  });
};

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
    recordTypes: { $set: recordTypeList },
    isFetching: { $set: false }
  });
};

const receiveTemplatesAction = (state, { payload }) => {
  return update(state, {
    templates: {
      $set: payload
    },
    isFetching: { $set: false }
  });
};

export default handleActions({
  requestFromApiAction,
  receiveAttributeTypesAction,
  receiveTemplatesAction
}, initialState);
