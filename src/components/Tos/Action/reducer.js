/* eslint-disable camelcase */
import update from 'immutability-helper';
import { includes, indexOf } from 'lodash';
import { createAction } from 'redux-actions';

export const ADD_ACTION = 'addActionAction';
export const EDIT_ACTION = 'editActionAction';
export const EDIT_ACTION_ATTRIBUTE = 'editActionAttributeAction';
export const REMOVE_ACTION = 'removeActionAction';
export const SET_ACTION_VISIBILITY = 'setActionVisibilityAction';

export function addAction(typeSpecifier, actionType, actionAttibutes, phaseIndex) {
  const actionId = Math.random().toString(36).replace(/[^a-z]+/g, '');
  const attributes = {

    TypeSpecifier: typeSpecifier, ActionType: actionType,
    ...actionAttibutes
  };
  const newAction = {
    id: actionId,
    phase: phaseIndex,
    records: [],
    attributes,
    is_open: false
  };
  return createAction(ADD_ACTION)(newAction);
}

export function editAction(attributes, actionId) {
  const editedAttributes = {};

  Object.keys(attributes).forEach(key => {
    if (Object.prototype.hasOwnProperty.call(attributes, key) && attributes[key].checked) {
      editedAttributes[key] = attributes[key].value;
    }
  });

  const editedAction = { attributes: editedAttributes };

  return createAction(EDIT_ACTION)({ editedAction, actionId });
}

export function editActionAttribute(editedActionAttribute) {
  return createAction(EDIT_ACTION_ATTRIBUTE)(editedActionAttribute);
}

export function removeAction(actionToRemove, phaseId) {
  return createAction(REMOVE_ACTION)({ actionToRemove, phaseId });
}

export function setActionVisibility(action, visibility) {
  return createAction(SET_ACTION_VISIBILITY)({ action, visibility });
}

// ------------------------------------
// Action Handlers
// ------------------------------------

export const addActionAction = (state, { payload }) => update(state, {
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

export const editActionAction = (state, { payload }) => update(state, {
  actions: {
    [payload.actionId]: {
      attributes: {
        $set: payload.editedAction.attributes
      }
    }
  }
});

export const editActionAttributeAction = (state, { payload }) => {
  if (Object.prototype.hasOwnProperty.call(payload, 'typeSpecifier')) {
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
  } if (Object.prototype.hasOwnProperty.call(payload, 'type')) {
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
  }
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

};

export const removeActionAction = (state, { payload }) => {
  const stateCopy = { ...state };
  const actionIndex = indexOf(
    stateCopy.phases[payload.phaseId].actions,
    payload.actionToRemove
  );

  const recordsUnderAction = stateCopy.actions[payload.actionToRemove].records;
  Object.keys(stateCopy.records).forEach(key => {
    if (includes(recordsUnderAction, key)) {
      delete stateCopy.records[key];
    }
  });

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

export const setActionVisibilityAction = (state, { payload }) => update(state, {
  actions: {
    [payload.action]: {
      is_open: {
        $set: payload.visibility
      }
    }
  }
});
