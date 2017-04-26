import update from 'immutability-helper';
import { includes, indexOf } from 'lodash';
import { createAction } from 'redux-actions';

export const ADD_ACTION = 'addActionAction';
export const EDIT_ACTION = 'editActionAction';
export const REMOVE_ACTION = 'removeActionAction';

export function addAction (typeSpecifier, phaseIndex) {
  const actionId = Math.random().toString(36).replace(/[^a-z]+/g, '');
  const newAction = {
    id: actionId,
    phase: phaseIndex,
    records: [],
    attributes: { TypeSpecifier: typeSpecifier }
  };
  return createAction(ADD_ACTION)(newAction);
}

export function editAction (editedAction) {
  return createAction(EDIT_ACTION)(editedAction);
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
  return update(state, {
    actions: {
      [payload.id]: {
        name: {
          $set: payload.name
        }
      }
    }
  });
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
