import {
  closeMessage,
  fetchAttributeTypes,
  default as uiReducer
} from 'store/uiReducer';
import _ from 'lodash';

describe('(Redux Module) UI', () => {
  describe('(Reducer) uiReducer', () => {
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
      expect(uiReducer).to.be.a('function');
    });

    it('Should initialize with a correct state', () => {
      expect(uiReducer(undefined, {})).to.deep.equal(_initialState);
    });

    it('Should return the previous state if an action was not matched.', () => {
      let state = uiReducer(undefined, {});
      expect(state).to.deep.equal(_initialState);
      state = uiReducer(state, {
        type: 'DOESNOTACTUALLYEXISTLOL'
      });
      expect(state).to.deep.equal(_initialState);
      state.message.active = true;                  // TODO: Improve this
      expect(state.message.active).to.equal(true);
      state = uiReducer(state, closeMessage());
      expect(state.message.active).to.equal(false);
      state = uiReducer(state, {
        type: 'DOESNOTACTUALLYEXISTLOL'
      });
      expect(state.message.active).to.equal(false);
    });
  });

  describe('(Action Creator) fetchAttributeTypes', () => {
    let _dispatchSpy;
    let _globalState;

    beforeEach(() => {
      _globalState = {
        ui: uiReducer(undefined, {})
      };
      _dispatchSpy = sinon.spy((action) => {
        _globalState = {
          ..._globalState,
          ui: uiReducer(_globalState.ui, action)
        };
      });
    });

    it('Should fetch validation rules and attribute types', () => {
      expect(_.keys(_globalState.ui.attributeTypes).length).to.equal(0);
      return setTimeout(fetchAttributeTypes()(_dispatchSpy)
        .then(() => {
          _dispatchSpy.should.have.been.calledOnce;
          expect(_.keys(_globalState.ui.attributeTypes).length).to.be.greaterThan(0);
        }), 15000);
    });
  });
});
