import getProcessedAttributeValue from '../../../utils/attributeProcessing';
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

  if (!state.phases) {
    state.phases = {};
  }

  state.phases[phaseId] = newPhase;
};

export const editPhaseReducer = (state, action) => {
  const { editedAttributes, phaseId } = action.payload;

  if (!state.phases) {
    state.phases = {};
  }
  if (!state.phases[phaseId]) {
    return;
  }

  if (!state.phases[phaseId].attributes) {
    state.phases[phaseId].attributes = {};
  }
  Object.assign(state.phases[phaseId].attributes, editedAttributes);
};

export const editPhaseAttributeReducer = (state, action) => {
  const { phaseId, attributeName, attributeValue } = action.payload;

  if (!state.phases) {
    state.phases = {};
  }
  if (!state.phases[phaseId]) {
    return;
  }
  if (!state.phases[phaseId].attributes) {
    state.phases[phaseId].attributes = {};
  }

  // Process complex objects that might have { checked: true, value: 'something' } structure
  state.phases[phaseId].attributes[attributeName] = getProcessedAttributeValue(attributeValue);
};

export const removePhaseReducer = (state, action) => {
  const phaseId = action.payload;
  const phase = state.phases[phaseId];

  if (!phase) {
    return;
  }

  const actionsToRemove = phase.actions || [];
  const recordsToRemove = [];

  actionsToRemove.forEach((actionId) => {
    const actionToCheck = state.actions[actionId];
    if (actionToCheck?.records) {
      recordsToRemove.push(...actionToCheck.records);
    }
  });

  delete state.phases[phaseId];

  actionsToRemove.forEach((actionId) => {
    delete state.actions[actionId];
  });

  recordsToRemove.forEach((recordId) => {
    delete state.records[recordId];
  });
};

export const setPhaseAttributesVisibilityReducer = (state, action) => {
  const { phaseId, visibility } = action.payload;

  if (!state.phases) {
    state.phases = {};
  }
  if (!state.phases[phaseId]) {
    return;
  }

  state.phases[phaseId].is_attributes_open = visibility;
};

export const setPhaseVisibilityReducer = (state, action) => {
  const { phaseId, visibility } = action.payload;

  if (!state.phases) {
    state.phases = {};
  }
  if (!state.phases[phaseId]) {
    return;
  }

  state.phases[phaseId].is_open = visibility;
};

export const setPhasesVisibilityReducer = (state, action) => {
  const visibility = action.payload;

  if (!state.phases) {
    state.phases = {};
  }

  Object.keys(state.phases).forEach((phaseId) => {
    state.phases[phaseId].is_open = visibility;
  });
};
