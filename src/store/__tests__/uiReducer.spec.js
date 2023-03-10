/* eslint-disable no-underscore-dangle */
import { cloneDeep } from 'lodash';

import uiReducer, { initialState } from '../uiReducer';

describe('(Redux Module) UI', () => {
  describe('(Reducer) uiReducer', () => {
    let _initialState;
    beforeEach(() => {
      _initialState = cloneDeep(initialState);
    });

    it('Should be a function.', () => {
      expect(uiReducer).toBeInstanceOf(Function);
    });

    it('Should initialize with a correct state', () => {
      expect(uiReducer(undefined, {})).toEqual(initialState);
    });

    it('Should return the previous state if an action was not matched.', () => {
      let state = uiReducer(undefined, {});
      expect(state).toEqual(_initialState);
      state = uiReducer(state, {
        type: 'DOESNOTACTUALLYEXISTLOL'
      });
      expect(state).toEqual(_initialState);
      state = uiReducer(state, {
        type: 'DOESNOTACTUALLYEXISTLOL'
      });
      expect(state).toEqual(_initialState);
    });
  });
});
