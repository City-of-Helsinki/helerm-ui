import update from 'immutability-helper';

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

  return update(state, {
    actions: {
      [actionId]: {
        records: {
          $push: [recordId],
        },
      },
    },
    records: {
      [recordId]: {
        $set: newRecord,
      },
    },
  });
};

export const editRecordReducer = (state, action) => {
  const { editedRecord, recordId } = action.payload;

  return update(state, {
    records: {
      [recordId]: {
        attributes: {
          $merge: editedRecord.attributes,
        },
      },
    },
  });
};

export const editRecordAttributeReducer = (state, action) => {
  const { recordId, attributeName, attributeValue } = action.payload;

  return update(state, {
    records: {
      [recordId]: {
        attributes: {
          [attributeName]: {
            $set: attributeValue,
          },
        },
      },
    },
  });
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

  return update(state, {
    records: {
      [recordId]: {
        is_open: {
          $set: visibility,
        },
      },
    },
  });
};
