import {
  closeMessage,
  fetchRecordTypes,
  fetchAttributeTypes,
  default as homeReducer
} from 'routes/Home/modules/home';
import _ from 'lodash';

describe('(Redux Module) Home', () => {
  describe('(Reducer) HomeReducer', () => {
    let _initialState;
    beforeEach(() => {
      _initialState = {
        isFetching: false,
        recordTypes: {},
        attributeTypes: {},
        message: {
          active: false,
          text: '',
          success: false
        }
      };
    });
    it('Should be a function.', () => {
      expect(homeReducer).to.be.a('function');
    });

    it('Should initialize with a correct state', () => {
      expect(homeReducer(undefined, {})).to.deep.equal(_initialState);
    });

    it('Should return the previous state if an action was not matched.', () => {
      let state = homeReducer(undefined, {});
      expect(state).to.deep.equal(_initialState);
      state = homeReducer(state, {
        type: 'DOESNOTACTUALLYEXISTLOL'
      });
      expect(state).to.deep.equal(_initialState);
      state.message.active = true;                  // TODO: Improve this
      expect(state.message.active).to.equal(true);
      state = homeReducer(state, closeMessage());
      expect(state.message.active).to.equal(false);
      state = homeReducer(state, {
        type: 'DOESNOTACTUALLYEXISTLOL'
      });
      expect(state.message.active).to.equal(false);
    });
  });

  describe('(Action Creator) fetchRecordTypes', () => {
    let _dispatchSpy;
    let _globalState;

    beforeEach(() => {
      _globalState = {
        home: homeReducer(undefined, {})
      };
      _dispatchSpy = sinon.spy((action) => {
        _globalState = {
          ..._globalState,
          home: homeReducer(_globalState.home, action)
        };
      });
    });

    it('Should fetch record types', () => {
      expect(_.keys(_globalState.home.recordTypes).length).to.equal(0);
      return fetchRecordTypes()(_dispatchSpy)
        .then(() => {
          _dispatchSpy.should.have.been.calledOnce;
          expect(_.keys(_globalState.home.recordTypes).length).to.be.greaterThan(0);
        });
    });
  });

  describe('(Action Creator) fetchAttributeTypes', () => {
    let _dispatchSpy;
    let _globalState;

    beforeEach(() => {
      _globalState = {
        home: homeReducer(undefined, {})
      };
      _dispatchSpy = sinon.spy((action) => {
        _globalState = {
          ..._globalState,
          home: homeReducer(_globalState.home, action)
        };
      });
    });

    it('Should fetch validation rules and attribute types', () => {
      expect(_.keys(_globalState.home.attributeTypes).length).to.equal(0);
      return fetchAttributeTypes()(_dispatchSpy)
        .then(() => {
          _dispatchSpy.should.have.been.calledOnce;
          expect(_.keys(_globalState.home.attributeTypes).length).to.be.greaterThan(0);
        });
    });
  });
});
