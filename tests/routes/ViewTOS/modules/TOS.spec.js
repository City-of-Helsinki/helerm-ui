import {
  fetchTOS,
  requestTOS,
  default as tosReducer
} from 'routes/ViewTOS/modules/TOS';
import _ from 'lodash';

describe('(Redux Module) TOS', () => {
  describe('(Reducer) TOSReducer', () => {
    let _initialState;
    beforeEach(() => {
      _initialState = {
        tos: {},
        actions: {},
        phases: {},
        records: {},
        attributes: {},
        documentState: 'view',
        lastUpdated: 0,
        isFetching: false
      };
    });
    it('Should be a function.', () => {
      expect(tosReducer).to.be.a('function');
    });

    it('Should initialize with a correct state', () => {
      expect(tosReducer(undefined, {})).to.deep.equal(_initialState);
    });

    it('Should return the previous state if an action was not matched.', () => {
      let state = tosReducer(undefined, {});
      expect(state).to.deep.equal(_initialState);
      state = tosReducer(state, {
        type: 'DOESNOTACTUALLYEXISTLOL'
      });
      expect(state).to.deep.equal(_initialState);
      state = tosReducer(state, requestTOS());
      expect(state.isFetching).to.equal(true);
      state = tosReducer(state, {
        type: 'DOESNOTACTUALLYEXISTLOL'
      });
      expect(state.isFetching).to.equal(true);
    });
  });

  describe('(Action Creator) fetchTOS', () => {
    let _dispatchSpy;
    let _globalState;

    beforeEach(() => {
      _globalState = {
        selectedTOS: tosReducer(undefined, {})
      };
      _dispatchSpy = sinon.spy((action) => {
        _globalState = {
          ..._globalState,
          selectedTOS: tosReducer(_globalState.selectedTOS, action)
        };
      });
    });

    it('Should fetch TOS', () => {
      expect(_.keys(_globalState.selectedTOS.tos).length).to.equal(0);
      expect(_.keys(_globalState.selectedTOS.phases).length).to.equal(0);
      expect(_.keys(_globalState.selectedTOS.actions).length).to.equal(0);
      expect(_.keys(_globalState.selectedTOS.records).length).to.equal(0);
      expect(_.keys(_globalState.selectedTOS.attributes).length).to.equal(0);
      return fetchTOS('8fb03366f89e422c9ca1503b78a98530')(_dispatchSpy)
        .then(() => {
          _dispatchSpy.should.have.been.calledTwice;
          expect(_.keys(_globalState.selectedTOS.tos).length).to.be.greaterThan(0);
          expect(_.keys(_globalState.selectedTOS.phases).length).to.be.greaterThan(0);
          expect(_.keys(_globalState.selectedTOS.actions).length).to.be.greaterThan(0);
          expect(_.keys(_globalState.selectedTOS.records).length).to.be.greaterThan(0);
        });
    });
  });
});
