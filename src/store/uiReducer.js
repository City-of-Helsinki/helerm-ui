import update from 'immutability-helper';

import { default as api } from '../utils/api';

// ------------------------------------
// Constants
// ------------------------------------
export const RECEIVE_ATTRIBUTE_TYPES = 'ui/RECEIVE_ATTRIBUTE_TYPES';

export const CLOSE_MESSAGE = 'ui/CLOSE_MESSAGE';
export const DISPLAY_MESSAGE = 'ui/DISPLAY_MESSAGE';

// ------------------------------------
// Actions
// ------------------------------------
export function receiveAttributeTypes (attributes, validationRules) {
  const attributeTypeList = {};
  attributes.results.map(result => {
    if (result.values) {
      let required = false;
      let requiredIn = [];
      let requiredIf = [];

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
            // We're only interested in required-keys
            const rules = oneOf[oneOfKey];
            const required = rules[0].required;

            required.map(requiredIndentifier => {
              Object.keys(rules[0].properties).map(property => {
                let values = [];
                Object.keys(rules[0].properties[property]).map(key => {
                  rules[0].properties[property][key].map(value => {
                    values.push(value);
                  });
                });

                const exists = !!requiredIf.find(reqObj => {
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
        name: result.name,
        values: result.values,
        requiredIf,
        requiredIn,
        required
      };
    }
  });
  return {
    type: RECEIVE_ATTRIBUTE_TYPES,
    attributeTypeList
  };
}

export function displayMessage (message) {
  return {
    type: DISPLAY_MESSAGE,
    message
  };
}

export function closeMessage () {
  return {
    type: CLOSE_MESSAGE
  };
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

export const actions = {
  closeMessage,
  fetchAttributeTypes,
  receiveAttributeTypes
};

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [RECEIVE_ATTRIBUTE_TYPES]: (state, action) => {
    const recordTypes = action.attributeTypeList.RecordType;
    const recordTypeList = {};
    recordTypes.values.map(result => {
      const trimmedResult = result.id.replace(/-/g, '');
      recordTypeList[trimmedResult] = result.value;
    });
    delete action.attributeTypeList.RecordType;
    return update(state, {
      attributeTypes: { $set: action.attributeTypeList },
      recordTypes: { $set: recordTypeList }
    });
  },
  [DISPLAY_MESSAGE]: (state, action) => {
    return update(state, {
      message: {
        active: { $set: true },
        text: { $set: action.message.text },
        success: { $set: action.message.success }
      }
    });
  },
  [CLOSE_MESSAGE]: (state, action) => {
    return update(state, {
      message: {
        active: { $set: false },
        text: { $set: '' },
        success: { $set: false }
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

export default function uiReducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type];
  return handler ? handler(state, action) : state;
}
