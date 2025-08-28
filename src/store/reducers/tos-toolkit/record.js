import { randomActionId } from '../../../utils/helpers';

export const createNewRecord = ({ attributes, actionId }) => {
  const recordId = randomActionId();

  const newAttributes = {};
  Object.keys(attributes).forEach((key) => {
    if (Object.hasOwn(attributes, key) && attributes[key].checked) {
      newAttributes[key] = attributes[key].value;
    }
  });

  const newRecord = {
    id: recordId,
    action: actionId,
    attributes: newAttributes,
    is_open: false,
  };

  return { actionId, recordId, newRecord };
};

export const addRecordReducer = (state, action) => {
  const { actionId, recordId, newRecord } = action.payload;

  if (!state.actions) {
    state.actions = {};
  }
  if (!state.records) {
    state.records = {};
  }

  if (state.actions[actionId]) {
    if (!state.actions[actionId].records) {
      state.actions[actionId].records = [];
    }
    state.actions[actionId].records.push(recordId);
  }

  state.records[recordId] = newRecord;
};

export const editRecordReducer = (state, action) => {
  const { editedRecord, recordId } = action.payload;

  if (!state.records) {
    state.records = {};
  }
  if (!state.records[recordId]) {
    return;
  }

  if (!state.records[recordId].attributes) {
    state.records[recordId].attributes = {};
  }
  Object.assign(state.records[recordId].attributes, editedRecord.attributes);
};

export const editRecordAttributeReducer = (state, action) => {
  const { recordId, attributeName, attributeValue } = action.payload;

  if (!state.records) {
    state.records = {};
  }
  if (!state.records[recordId]) {
    return;
  }
  if (!state.records[recordId].attributes) {
    state.records[recordId].attributes = {};
  }

  state.records[recordId].attributes[attributeName] = attributeValue;
};

export const removeRecordReducer = (state, action) => {
  const { recordId, actionId } = action.payload;
  const updatedState = { ...state };

  if (updatedState.actions[actionId]?.records) {
    const actionRecords = updatedState.actions[actionId].records;
    const recordIndex = actionRecords.indexOf(recordId);

    if (recordIndex > -1) {
      updatedState.actions = {
        ...updatedState.actions,
        [actionId]: {
          ...updatedState.actions[actionId],
          records: [...actionRecords.slice(0, recordIndex), ...actionRecords.slice(recordIndex + 1)],
        },
      };
    }
  }

  const remainingRecords = {};
  Object.keys(updatedState.records).forEach((key) => {
    if (key !== recordId) {
      remainingRecords[key] = updatedState.records[key];
    }
  });
  updatedState.records = remainingRecords;

  return updatedState;
};

export const setRecordVisibilityReducer = (state, action) => {
  const { recordId, visibility } = action.payload;

  if (!state.records) {
    state.records = {};
  }
  if (!state.records[recordId]) {
    return;
  }

  state.records[recordId].is_open = visibility;
};
