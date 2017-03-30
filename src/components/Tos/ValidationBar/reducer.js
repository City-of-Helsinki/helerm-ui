import update from 'immutability-helper';
import { createAction, handleActions } from 'redux-actions';

const initialState = {
  is_open: false
};

export const SET_VALIDATION_VISIBILITY = 'setValidationVisibilityAction';

export function setValidationVisibility (value) {
  return createAction(SET_VALIDATION_VISIBILITY)(value);
}

const setValidationVisibilityAction = (state, { payload }) => {
  return update(state, {
    is_open: { $set: payload }
  });
};

export default handleActions({
  setValidationVisibilityAction
}, initialState);
