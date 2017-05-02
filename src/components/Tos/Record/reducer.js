import update from 'immutability-helper';
import { createAction } from 'redux-actions';
import { indexOf } from 'lodash';

export const ADD_RECORD = 'addRecordAction';
export const EDIT_RECORD = 'editRecordAction';
export const EDIT_RECORD_ATTRIBUTE = 'editRecordAttributeAction';
export const REMOVE_RECORD = 'removeRecordAction';

export function addRecord (attributes, actionId) {
  const recordId = Math.random().toString(36).replace(/[^a-z]+/g, '');
  const newAttributes = {};
  for (const key in attributes) {
    if (attributes.hasOwnProperty(key)) {
      if (attributes[key].checked === true) {
        newAttributes[key] = attributes[key].value;
      }
    }
  }

  const newRecord = Object.assign({}, {
    id: recordId,
    action: actionId,
    attributes: newAttributes,
    is_open: false
  });

  return createAction(ADD_RECORD)({ actionId, recordId, newRecord });
}

export function editRecord (attributes, recordId) {
  let editedAttributes = {};

  for (const key in attributes) {
    if (attributes.hasOwnProperty(key)) {
      if (attributes[key].checked === true) {
        editedAttributes[key] = attributes[key].value;
      }
    }
  }

  const editedRecord = Object.assign({}, {
    attributes: editedAttributes
  });

  return createAction(EDIT_RECORD)({ editedRecord, recordId });
}

export function editRecordAttribute (editedRecord) {
  return createAction(EDIT_RECORD_ATTRIBUTE)(editedRecord);
}

export function removeRecord (recordToRemove, actionId) {
  return createAction(REMOVE_RECORD)({ recordToRemove, actionId });
}

export const addRecordAction = (state, { payload }) => {
  return update(state, {
    actions: {
      [payload.actionId]: {
        records: {
          $push: [payload.recordId]
        }
      }
    },
    records: {
      [payload.recordId]: {
        $set: payload.newRecord
      }
    }
  });
};

export const editRecordAction = (state, { payload }) => {
  return update(state, {
    records: {
      [payload.recordId]: {
        attributes: {
          $set: payload.editedRecord.attributes
        }
      }
    }
  });
};

export const editRecordAttributeAction = (state, { payload }) => {
  if (payload.typeSpecifier) {
    return update(state, {
      records: {
        [payload.recordId]: {
          attributes: {
            TypeSpecifier: {
              $set: payload.typeSpecifier
            }
          }
        }
      }
    });
  } else if (payload.type) {
    return update(state, {
      records: {
        [payload.recordId]: {
          attributes: {
            RecordType: {
              $set: payload.type
            }
          }
        }
      }
    });
  } else if (payload.tosAttribute) {
    return update(state, {
      attributes: {
        [payload.attributeIndex]: {
          $set: payload.tosAttribute
        }
      }
    });
  } else {
    return update(state, {
      records: {
        [payload.recordId]: {
          attributes: {
            [payload.attributeIndex]: {
              $set: payload.attribute
            }
          }
        }
      }
    });
  }
};

export const removeRecordAction = (state, { payload }) => {
  // TODO: Removes a faulty one (index+1)
  const stateCopy = Object.assign({}, state);

  const recordIndex = indexOf(
    stateCopy.actions[payload.actionId].records,
    payload.recordToRemove
  );

  delete stateCopy.records[payload.recordToRemove];
  return update(state, {
    records: {
      $set: stateCopy.records
    },
    actions: {
      [payload.actionId]: {
        records: {
          $splice: [[recordIndex, 1]]
        }
      }
    }
  });
};
