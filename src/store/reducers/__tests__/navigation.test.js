/* eslint-disable no-underscore-dangle */
import { cloneDeep } from 'lodash';

import navigationReducer, { initialState } from '../navigation';

describe('(Redux Module) Navigation', () => {
  describe('(Reducer) NavigationReducer', () => {
    let _initialState;
    beforeEach(() => {
      _initialState = cloneDeep(initialState);
    });
    it('Should be a function.', () => {
      expect(navigationReducer).toBeInstanceOf(Function);
    });

    it('Should initialize with a correct state', () => {
      expect(navigationReducer(undefined, {})).toEqual(_initialState);
    });

    it('Should return the previous state if an action was not matched.', () => {
      let state = navigationReducer(undefined, {});
      expect(state).toEqual(_initialState);
      state = navigationReducer(state, {
        type: 'DOESNOTACTUALLYEXISTLOL',
      });
      expect(state).toEqual(_initialState);
      state = navigationReducer(state, { type: 'navigation/fetchNavigation/pending', meta: { arg: {} } });
      expect(state.isFetching).toEqual(true);
      state = navigationReducer(state, {
        type: 'DOESNOTACTUALLYEXISTLOL',
      });
      expect(state.isFetching).toEqual(true);
    });
  });
});
