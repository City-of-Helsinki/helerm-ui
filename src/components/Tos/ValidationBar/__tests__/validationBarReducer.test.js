/* eslint-disable no-underscore-dangle */
import validationReducer, { setValidationVisibility } from '../reducer';

describe('(Redux Module) Validation', () => {
  describe('(Reducer) ValidationReducer', () => {
    let _initialState;
    beforeEach(() => {
      _initialState = {
        is_open: false
      };
    });
    it('Should be a function.', () => {
      expect(validationReducer).toBeInstanceOf(Function);
    });

    it('Should initialize with a correct state', () => {
      expect(validationReducer(undefined, {})).toEqual(_initialState);
    });

    it('Should return the previous state if an action was not matched.', () => {
      let state = validationReducer(undefined, {});
      expect(state).toEqual(_initialState);
      state = validationReducer(state, {
        type: 'DOESNOTACTUALLYEXISTLOL'
      });
      expect(state).toEqual(_initialState);
      state = validationReducer(state, setValidationVisibility(true));
      expect(state.is_open).toBeTruthy();
      state = validationReducer(state, {
        type: 'DOESNOTACTUALLYEXISTLOL'
      });
      expect(state.is_open).toBeTruthy();
    });
  });
});
