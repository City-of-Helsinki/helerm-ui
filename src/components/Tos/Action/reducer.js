import update from 'immutability-helper';
import { includes, indexOf } from 'lodash';
import { createAction } from 'redux-actions';

export const ADD_ACTION = 'addActionAction';
export const EDIT_ACTION = 'editActionAction';
export const EDIT_ACTION_ATTRIBUTE = 'editActionAttributeAction';
export const REMOVE_ACTION = 'removeActionAction';

export function addAction (typeSpecifier, actionType, phaseIndex) {
  const actionId = Math.random().toString(36).replace(/[^a-z]+/g, '');
  const newAction = {
    id: actionId,
    phase: phaseIndex,
    records: [],
    attributes: {
      TypeSpecifier: typeSpecifier,
      ActionType: actionType
    }
  };
  return createAction(ADD_ACTION)(newAction);
}

export function editAction (attributes, actionId) {
  let editedAttributes = {};

  for (const key in attributes) {
    if (attributes.hasOwnProperty(key)) {
      if (attributes[key].checked === true) {
        editedAttributes[key] = attributes[key].value;
      }
    }
  }

  const editedAction = Object.assign({}, {
    attributes: editedAttributes
  });

  return createAction(EDIT_ACTION)({ editedAction, actionId });
}

export function editActionAttribute (editedActionAttribute) {
  return createAction(EDIT_ACTION_ATTRIBUTE)(editedActionAttribute);
}

export function removeAction (actionToRemove, phaseId) {
  return createAction(REMOVE_ACTION)({ actionToRemove, phaseId });
}

export const addActionAction = (state, { payload }) => {
  return update(state, {
    phases: {
      [payload.phase]: {
        actions: {
          $push: [payload.id]
        }
      }
    },
    actions: {
      [payload.id]: {
        $set: payload
      }
    }
  });
};

export const editActionAction = (state, { payload }) => {
  console.log(payload);
  return update(state, {
    actions: {
      [payload.actionId]: {
        attributes: {
          $set: payload.editedAction.attributes
        }
      }
    }
  });
};

export const editActionAttributeAction = (state, { payload }) => {
  if (payload.hasOwnProperty('typeSpecifier')) {
    return update(state, {
      actions: {
        [payload.actionId]: {
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
      actions: {
        [payload.actionId]: {
          attributes: {
            ActionType: {
              $set: payload.type
            }
          }
        }
      }
    });
  } else {
    return update(state, {
      actions: {
        [payload.actionId]: {
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

export const removeActionAction = (state, { payload }) => {
  const stateCopy = Object.assign({}, state);
  const actionIndex = indexOf(
    stateCopy.phases[payload.phaseId].actions,
    payload.actionToRemove
  );

  const recordsUnderAction = stateCopy.actions[payload.actionToRemove].records;
  for (const record in stateCopy.records) {
    if (includes(recordsUnderAction, record)) {
      delete stateCopy.records[record];
    }
  }

  delete stateCopy.actions[payload.actionToRemove];
  return update(state, {
    actions: {
      $set: stateCopy.actions
    },
    phases: {
      [payload.phaseId]: {
        actions: {
          $splice: [[actionIndex, 1]]
        }
      }
    },
    records: {
      $set: stateCopy.records
    }
  });
};
