/* eslint-disable sonarjs/todo-tag */
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

      // Add rules where attribute is allowed to be
      Object.keys(validationRules).forEach((rule) => {
        if (
          Object.hasOwn(validationRules, rule) &&
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
      const multiIn = Object.keys(validationRules)
        .filter((key) => validationRules[key].properties[result.identifier]?.anyOf)
        .filter((key) => find(validationRules[key].properties[result.identifier]?.anyOf, (item) => item.type === 'array'));

      // Add requiredIn attributes
      const requiredIn = Object.keys(validationRules)
        .filter((key) => validationRules[key]?.required)
        .filter((key) => validationRules[key]?.required.some((rule) => rule === result.identifier));

      // Add defaultIn attributes
      // hard coded now, todo: replace with backend definition
      Object.keys(validationRules).forEach((key) => {
        if (result.identifier === 'InformationSystem') {
          defaultIn.push(key);
        }
      });

      // Add conditional rules if any
      const requiredMap = Object.keys(validationRules)
        .filter((key) => validationRules[key]?.allOf)
        .map((key) => (validationRules[key]?.allOf))
        .flatMap((allOfs) => allOfs.flatMap((allOf) => allOf.oneOf))
        .filter((oneOf) => oneOf.required.length > 0)
        .filter((oneOf) => oneOf.required.some((requiredKey) => result.identifier === requiredKey))
        .map((oneOf) => oneOf.properties)
        .map((properties) => Object.keys(properties).map((propertyKey) => {
          const property = properties[propertyKey];
          // eslint-disable-next-line sonarjs/no-nested-functions
          const values = Object.keys(property).map((valueKey) => property[valueKey]).flatMap((value) => value)

          return { key: propertyKey, values }
        }))
        .flatMap((items) => items);

      const requiredIf = requiredMap
        .filter((value, index, self) => index === self.findIndex((item) => item.key === value.key));

      // Add allow values outside choices rule
      const allowValuesOutsideChoicesIn = Object.keys(validationRules)
        .filter((key) => validationRules[key].extra_validations)
        .filter((key) => validationRules[key].extra_validations?.allow_values_outside_choices)
        .filter((key) => validationRules[key].extra_validations?.allow_values_outside_choices?.some((field) => field === result.identifier));

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
