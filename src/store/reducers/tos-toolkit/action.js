import { indexOf } from 'lodash';

import { randomActionId } from '../../../utils/helpers';

export const createNewAction = (typeSpecifier, actionType, actionAttributes, phaseIndex) => {
  const actionId = randomActionId();

  return {
    id: actionId,
    phase: phaseIndex,
    records: [],
    attributes: {
      TypeSpecifier: typeSpecifier,
      ActionType: actionType,
      ...actionAttributes,
    },
    is_open: false,
  };
};

export const addActionReducer = (state, action) => {
  const newAction = action.payload;
  const actionId = newAction.id;
  const phaseId = newAction.phase;

  if (!state.actions) {
    state.actions = {};
  }
  if (!state.phases) {
    state.phases = {};
  }

  if (state.phases[phaseId]) {
    if (!state.phases[phaseId].actions) {
      state.phases[phaseId].actions = [];
    }

    state.phases[phaseId].actions.push(actionId);
  }

  state.actions[actionId] = newAction;
};

export const editActionReducer = (state, action) => {
  const { editedAction, actionId } = action.payload;

  if (!state.actions) {
    state.actions = {};
  }
  if (!state.actions[actionId]) {
    return;
  }

  if (!state.actions[actionId].attributes) {
    state.actions[actionId].attributes = {};
  }
  Object.assign(state.actions[actionId].attributes, editedAction.attributes);
};

export const editActionAttributeReducer = (state, action) => {
  const { actionId, attributeName, attributeValue } = action.payload;

  if (!state.actions) {
    state.actions = {};
  }
  if (!state.actions[actionId]) {
    return;
  }
  if (!state.actions[actionId].attributes) {
    state.actions[actionId].attributes = {};
  }

  state.actions[actionId].attributes[attributeName] = attributeValue;
};

export const removeActionReducer = (state, action) => {
  const { actionToRemove, phaseId } = action.payload;

  if (!state.phases[phaseId]) {
    return;
  }

  const phaseActions = state.phases[phaseId].actions;
  const actionIndex = indexOf(phaseActions, actionToRemove);

  if (actionIndex > -1) {
    state.phases[phaseId].actions.splice(actionIndex, 1);
  }

  const recordsToRemove = [];
  if (state.actions[actionToRemove]?.records) {
    recordsToRemove.push(...state.actions[actionToRemove].records);
  }

  delete state.actions[actionToRemove];

  recordsToRemove.forEach((recordId) => {
    delete state.records[recordId];
  });
};

export const setActionVisibilityReducer = (state, action) => {
  const { actionId, visibility } = action.payload;

  if (!state.actions) {
    state.actions = {};
  }
  if (!state.actions[actionId]) {
    return;
  }

  state.actions[actionId].is_open = visibility;
};
