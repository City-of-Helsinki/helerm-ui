import update from 'immutability-helper';
import { createAction } from 'redux-actions';
import { indexOf } from 'lodash';

export const ADD_RECORD = 'addRecordAction';
export const EDIT_RECORD = 'editRecordAction';
export const EDIT_RECORD_ATTRIBUTE = 'editRecordAttributeAction';
export const REMOVE_RECORD = 'removeRecordAction';
export const SET_RECORD_VISIBILITY = 'setRecordVisibilityAction';

export function addRecord(attributes, actionId) {
  const recordId = Math.random().toString(36).replace(/[^a-z]+/g, '');
  const newAttributes = {};
  Object.keys(attributes).forEach(key => {
    if (Object.prototype.hasOwnProperty.call(attributes, key) && attributes[key].checked) {
      newAttributes[key] = attributes[key].value;
    }
  });

  const newRecord = {
    id: recordId,
    action: actionId,
    attributes: newAttributes,
    is_open: false
  };

  return createAction(ADD_RECORD)({ actionId, recordId, newRecord });
}

export function editRecord(attributes, recordId) {
  const editedAttributes = {};

  Object.keys(attributes).forEach(key => {
    if (Object.prototype.hasOwnProperty.call(attributes, key) && attributes[key].checked) {
      editedAttributes[key] = attributes[key].value;
    }
  });

  const editedRecord = { attributes: editedAttributes };

  return createAction(EDIT_RECORD)({ editedRecord, recordId });
}

export function editRecordAttribute(editedRecord) {
  return createAction(EDIT_RECORD_ATTRIBUTE)(editedRecord);
}

export function removeRecord(recordToRemove, actionId) {
  return createAction(REMOVE_RECORD)({ recordToRemove, actionId });
}

export function setRecordVisibility(record, visibility) {
  return createAction(SET_RECORD_VISIBILITY)({ record, visibility });
}

// ------------------------------------
// Action Handlers
// ------------------------------------

export const addRecordAction = (state, { payload }) => update(state, {
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

export const editRecordAction = (state, { payload }) => update(state, {
  records: {
    [payload.recordId]: {
      attributes: {
        $set: payload.editedRecord.attributes
      }
    }
  }
});

export const editRecordAttributeAction = (state, { payload }) => {
  if (Object.prototype.hasOwnProperty.call(payload, 'typeSpecifier')) {
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
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'type')) {
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
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'tosAttribute')) {
    return update(state, {
      attributes: {
        [payload.attributeIndex]: {
          $set: payload.tosAttribute
        }
      }
    });
  }

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

};

export const removeRecordAction = (state, { payload }) => {
  const stateCopy = JSON.parse(JSON.stringify(state));

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

export const setRecordVisibilityAction = (state, { payload }) => update(state, {
  records: {
    [payload.record]: {
      is_open: {
        $set: payload.visibility
      }
    }
  }
});
