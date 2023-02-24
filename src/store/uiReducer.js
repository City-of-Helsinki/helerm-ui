/* eslint-disable no-unused-expressions */
/* eslint-disable no-param-reassign */
/* eslint-disable import/no-named-as-default-member */
/* eslint-disable camelcase */
import update from 'immutability-helper';
import { createAction, handleActions } from 'redux-actions';
import find from 'lodash/find';

import api from '../utils/api';

export const initialState = {
  isFetching: false,
  phaseTypes: {},
  actionTypes: {},
  recordTypes: {},
  attributeTypes: {},
  templates: []
};

export const RECEIVE_ATTRIBUTE_TYPES = 'receiveAttributeTypesAction';
export const RECEIVE_TEMPLATES = 'receiveTemplatesAction';
export const ERROR_FROM_API = 'errorFromApiAction';

export function receiveAttributeTypes(attributes, validationRules) {
  const attributeTypeList = {};
  attributes.results.forEach((result) => {
    if (result.values) {
      const allowedIn = [];
      const defaultIn = [];
      let required = false;
      const requiredIn = [];
      const requiredIf = [];
      const multiIn = [];
      const allowValuesOutsideChoicesIn = [];

      // Add rules where attribute is allowed to be
      Object.keys(validationRules).forEach((rule) => {
        if (
          Object.prototype.hasOwnProperty.call(validationRules, rule) &&
          validationRules[rule].properties[result.identifier]
        ) {
          allowedIn.push(rule);
        }
      });

      // Add basic required if so
      validationRules.record.required.forEach((rule) => {
        if (rule === result.identifier) {
          required = true;
        }
      });

      // Add rules where multi selection is allowed
      Object.keys(validationRules).forEach((key) => {
        if (
          validationRules[key].properties[result.identifier] &&
          validationRules[key].properties[result.identifier].anyOf
        ) {
          const anyOfArray = find(
            validationRules[key].properties[result.identifier].anyOf,
            (anyOf) => anyOf.type === 'array'
          );
          if (anyOfArray) {
            multiIn.push(key);
          }
        }
      });

      // Add requiredIn attributes
      Object.keys(validationRules).forEach((key) => {
        validationRules[key].required &&
          validationRules[key].required.forEach((rule) => {
            if (rule === result.identifier) {
              requiredIn.push(key);
            }
          });
      });

      // Add defaultIn attributes
      // hard coded now, todo: replace with backend definition
      Object.keys(validationRules).forEach((key) => {
        if (result.identifier === 'InformationSystem') {
          defaultIn.push(key);
        }
      });

      // Add conditional rules if any
      Object.keys(validationRules).forEach((key) => {
        validationRules[key].allOf &&
          validationRules[key].allOf.forEach((oneOf) => {
            Object.keys(oneOf).forEach((oneOfKey) => {
              const rules = oneOf[oneOfKey];
              // We're only interested in required-keys
              const requiredKeys = rules[0].required;

              requiredKeys.forEach((requiredIndentifier) => {
                Object.keys(rules[0].properties).forEach((property) => {
                  const values = [];
                  Object.keys(rules[0].properties[property]).forEach((pkey) => {
                    rules[0].properties[property][pkey].forEach((value) => {
                      values.push(value);
                    });
                  });

                  const exists = !!find(requiredIf, (reqObj) => reqObj.key === property);

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

      // Add allow values outside choices rule
      Object.keys(validationRules).forEach((key) => {
        validationRules[key].extra_validations &&
          validationRules[key].extra_validations.allow_values_outside_choices &&
          validationRules[
            key
          ].extra_validations.allow_values_outside_choices.forEach((field) => {
            if (field === result.identifier) {
              allowValuesOutsideChoicesIn.push(key);
            }
          });
      });

      attributeTypeList[result.identifier] = {
        index: result.index,
        name: result.name,
        values: result.values,
        allowedIn,
        defaultIn,
        multiIn,
        requiredIf,
        requiredIn,
        required,
        allowValuesOutsideChoicesIn
      };
    }
  });

  return createAction(RECEIVE_ATTRIBUTE_TYPES)(attributeTypeList);
}

export function receiveTemplates({ results }) {
  const onlyIdAndName = results.map((item) => ({
    id: item.id,
    name: item.name
  }));
  return createAction(RECEIVE_TEMPLATES)(onlyIdAndName);
}

export function fetchAttributeTypes() {
  return (dispatch) => {
    dispatch(createAction('requestFromApiAction')());
    return api
      .get('attribute/schemas')
      .then((response) => response.json())
      .then((validationRules) => api
        .get('attribute', { page_size: 999 })
        .then((response) => response.json())
        .then((json) =>
          dispatch(receiveAttributeTypes(json, validationRules))
        ))
      .catch(() => dispatch(createAction(ERROR_FROM_API)()));
  };
}

export function fetchTemplates() {
  return (dispatch) => {
    dispatch(createAction('requestFromApiAction')());
    return api
      .get('template')
      .then((response) => response.json())
      .then((res) => {
        dispatch(receiveTemplates(res));
      })
      .catch(() => dispatch(createAction(ERROR_FROM_API)()));
  };
}

const requestFromApiAction = (state) => update(state, {
  isFetching: { $set: true }
});

const receiveAttributeTypesAction = (state, { payload }) => {
  const phaseTypes = payload.PhaseType;
  const actionTypes = payload.ActionType;
  const recordTypes = payload.RecordType;
  const phaseTypeList = {};
  const actionTypeList = {};
  const recordTypeList = {};

  const trimList = (types, list) => {
    types.values.forEach((result) => {
      const trimmedResult = result.id.replace(/-/g, '');
      list[trimmedResult] = {
        id: result.id,
        value: result.value
      };
    });
  };
  trimList(phaseTypes, phaseTypeList);
  trimList(actionTypes, actionTypeList);
  trimList(recordTypes, recordTypeList);

  return update(state, {
    attributeTypes: { $set: payload },
    phaseTypes: { $set: phaseTypeList },
    actionTypes: { $set: actionTypeList },
    recordTypes: { $set: recordTypeList },
    isFetching: { $set: false }
  });
};

const receiveTemplatesAction = (state, { payload }) => update(state, {
  templates: {
    $set: payload
  },
  isFetching: { $set: false }
});

const errorFromApiAction = (state) => update(state, {
  isFetching: { $set: false }
});

export default handleActions(
  {
    requestFromApiAction,
    receiveAttributeTypesAction,
    receiveTemplatesAction,
    errorFromApiAction
  },
  initialState
);
