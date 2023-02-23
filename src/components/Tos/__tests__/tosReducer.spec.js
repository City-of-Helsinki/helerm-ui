/* eslint-disable no-underscore-dangle */
import { cloneDeep } from 'lodash';
import { createAction } from 'redux-actions';

import tosReducer, { initialState } from '../reducer';

describe('(Redux Module) Tos', () => {
  describe('(Reducer) TOSReducer', () => {
    let _initialState;
    beforeEach(() => {
      _initialState = cloneDeep(initialState);
    });
    it('Should be a function.', () => {
      expect(tosReducer).toBeInstanceOf(Function);
    });

    it('Should initialize with a correct state', () => {
      expect(tosReducer(undefined, {})).toEqual(_initialState);
    });

    it('Should return the previous state if an action was not matched.', () => {
      let state = tosReducer(undefined, {});
      expect(state).toEqual(_initialState);
      state = tosReducer(state, {
        type: 'DOESNOTACTUALLYEXISTLOL'
      });
      expect(state).toEqual(_initialState);
      state = tosReducer(state, createAction('requestTosAction')());
      expect(state.isFetching).toEqual(true);
      state = tosReducer(state, {
        type: 'DOESNOTACTUALLYEXISTLOL'
      });
      expect(state.isFetching).toEqual(true);
    });
  });
});
