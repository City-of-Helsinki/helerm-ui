import update from 'immutability-helper';

import { randomActionId } from '../../../utils/helpers';

export const createNewPhase = ({ typeSpecifier, phaseType, phaseAttributes, parent }) => {
  const phaseId = randomActionId();

  const attributes = {
    TypeSpecifier: typeSpecifier,
    PhaseType: phaseType,
    ...phaseAttributes,
  };

  return {
    id: phaseId,
    function: parent,
    actions: [],
    attributes,
    is_attributes_open: false,
    is_open: false,
  };
};

export const addPhaseReducer = (state, action) => {
  const newPhase = action.payload;
  const phaseId = newPhase.id;

  return update(state, {
    phases: {
      [phaseId]: {
        $set: newPhase,
      },
    },
  });
};

export const editPhaseReducer = (state, action) => {
  const { editedAttributes, phaseId } = action.payload;

  return update(state, {
    phases: {
      [phaseId]: {
        attributes: {
          $merge: editedAttributes,
        },
      },
    },
  });
};

export const editPhaseAttributeReducer = (state, action) => {
  const { phaseId, attributeName, attributeValue } = action.payload;

  return update(state, {
    phases: {
      [phaseId]: {
        attributes: {
          [attributeName]: {
            $set: attributeValue,
          },
        },
      },
    },
  });
};

export const removePhaseReducer = (state, action) => {
  const phaseId = action.payload;
  const updatedState = { ...state };
  const phase = state.phases[phaseId];

  if (!phase) {
    return state;
  }

  const actionsToRemove = phase.actions || [];
  const recordsToRemove = [];

  actionsToRemove.forEach((actionId) => {
    const action = state.actions[actionId];
    if (action?.records) {
      recordsToRemove.push(...action.records);
    }
  });

  const remainingPhases = {};
  Object.keys(updatedState.phases).forEach((key) => {
    if (key !== phaseId) {
      remainingPhases[key] = updatedState.phases[key];
    }
  });
  updatedState.phases = remainingPhases;

  const updatedActions = { ...updatedState.actions };
  actionsToRemove.forEach((actionId) => {
    delete updatedActions[actionId];
  });
  updatedState.actions = updatedActions;

  const updatedRecords = { ...updatedState.records };
  recordsToRemove.forEach((recordId) => {
    delete updatedRecords[recordId];
  });
  updatedState.records = updatedRecords;

  return updatedState;
};

export const setPhaseAttributesVisibilityReducer = (state, action) => {
  const { phaseId, visibility } = action.payload;

  return update(state, {
    phases: {
      [phaseId]: {
        is_attributes_open: {
          $set: visibility,
        },
      },
    },
  });
};

export const setPhaseVisibilityReducer = (state, action) => {
  const { phaseId, visibility } = action.payload;

  return update(state, {
    phases: {
      [phaseId]: {
        is_open: {
          $set: visibility,
        },
      },
    },
  });
};

export const setPhasesVisibilityReducer = (state, action) => {
  const visibility = action.payload;
  const updatedPhases = {};

  Object.keys(state.phases).forEach((phaseId) => {
    updatedPhases[phaseId] = {
      ...state.phases[phaseId],
      is_open: visibility,
    };
  });

  return update(state, {
    phases: {
      $set: updatedPhases,
    },
  });
};
