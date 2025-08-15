import update from 'immutability-helper';
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

  return update(state, {
    actions: {
      [actionId]: {
        $set: newAction,
      },
    },
    phases: {
      [phaseId]: {
        actions: {
          $push: [actionId],
        },
      },
    },
  });
};

export const editActionReducer = (state, action) => {
  const { editedAction, actionId } = action.payload;

  return update(state, {
    actions: {
      [actionId]: {
        attributes: {
          $merge: editedAction.attributes,
        },
      },
    },
  });
};

export const editActionAttributeReducer = (state, action) => {
  const { actionId, attributeName, attributeValue } = action.payload;

  return update(state, {
    actions: {
      [actionId]: {
        attributes: {
          [attributeName]: {
            $set: attributeValue,
          },
        },
      },
    },
  });
};

export const removeActionReducer = (state, action) => {
  const { actionToRemove, phaseId } = action.payload;
  const updatedState = { ...state };

  const phaseActions = state.phases[phaseId].actions;
  const actionIndex = indexOf(phaseActions, actionToRemove);

  if (actionIndex > -1) {
    updatedState.phases = {
      ...updatedState.phases,
      [phaseId]: {
        ...updatedState.phases[phaseId],
        actions: [...phaseActions.slice(0, actionIndex), ...phaseActions.slice(actionIndex + 1)],
      },
    };
  }

  const recordsToRemove = [];
  if (updatedState.actions[actionToRemove]?.records) {
    recordsToRemove.push(...updatedState.actions[actionToRemove].records);
  }

  const remainingActions = {};
  Object.keys(updatedState.actions).forEach((key) => {
    if (key !== actionToRemove) {
      remainingActions[key] = updatedState.actions[key];
    }
  });
  updatedState.actions = remainingActions;

  const updatedRecords = { ...updatedState.records };
  recordsToRemove.forEach((recordId) => {
    delete updatedRecords[recordId];
  });
  updatedState.records = updatedRecords;

  return updatedState;
};

export const setActionVisibilityReducer = (state, action) => {
  const { actionId, visibility } = action.payload;

  return update(state, {
    actions: {
      [actionId]: {
        is_open: {
          $set: visibility,
        },
      },
    },
  });
};
