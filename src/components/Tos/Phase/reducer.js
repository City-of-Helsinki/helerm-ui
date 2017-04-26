import update from 'immutability-helper';
import { createAction } from 'redux-actions';

export const ADD_PHASE = 'addPhaseAction';
export const EDIT_PHASE = 'editPhaseAction';
export const EDIT_PHASE_ATTRIBUTE = 'editPhaseAttributeAction';
export const REMOVE_PHASE = 'removePhaseAction';
export const SET_PHASE_VISIBILITY = 'setPhaseVisibilityAction';
export const SET_PHASES_VISIBILITY = 'setPhasesVisibilityAction';

export function addPhase (typeSpecifier, parent) {
  const phaseId = Math.random().toString(36).replace(/[^a-z]+/g, '');
  const newPhase = {
    id: phaseId,
    function: parent,
    actions: [],
    attributes: { TypeSpecifier: typeSpecifier },
    is_open: false
  };

  return createAction(ADD_PHASE)(newPhase);
}

export function editPhase (editedPhase) {
  return createAction(EDIT_PHASE)(editedPhase);
}

export function editPhaseAttribute (editedPhaseAttribute) {
  return createAction(EDIT_PHASE_ATTRIBUTE)(editedPhaseAttribute);
}

export function removePhase (phaseToRemove) {
  return createAction(REMOVE_PHASE)(phaseToRemove);
}

export function setPhaseVisibility (phase, visibility) {
  return createAction(SET_PHASE_VISIBILITY)({ phase, visibility });
}

export function setPhasesVisibility (phases, value) {
  const allPhasesOpen = {};
  for (const key in phases) {
    if (phases.hasOwnProperty(key)) {
      allPhasesOpen[key] = update(phases[key], {
        is_open: {
          $set: value
        }
      });
    }
  }
  return createAction(SET_PHASES_VISIBILITY)(allPhasesOpen);
}

export const addPhaseAction = (state, { payload }) => {
  return update(state, {
    phases: {
      [payload.id]: {
        $set: payload
      }
    }
  });
};

export const editPhaseAction = (state, { payload }) => {
  return update(state, {
    phases: {
      [payload.id]: {
        attributes: {
          $set: payload.attributes
        }
      }
    }
  });
};

export const editPhaseAttributeAction = (state, { payload }) => {
  if (payload.typeSpecifier) {
    return update(state, {
      phases: {
        [payload.phaseId]: {
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
      phases: {
        [payload.phaseId]: {
          attributes: {
            PhaseType: {
              $set: payload.type
            }
          }
        }
      }
    });
  } else {
    return update(state, {
      phases: {
        [payload.phaseId]: {
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

export const removePhaseAction = (state, { payload }) => {
  const phasesCopy = Object.assign({}, state.phases);
  delete phasesCopy[payload];

  return update(state, {
    phases: {
      $set: phasesCopy
    }
  });
};

export const setPhaseVisibilityAction = (state, { payload }) => {
  return update(state, {
    phases: {
      [payload.phase]: {
        is_open: {
          $set: payload.visibility
        }
      }
    }
  });
};

export const setPhasesVisibilityAction = (state, { payload }) => {
  return update(state, {
    phases: {
      $set: payload
    }
  });
};
