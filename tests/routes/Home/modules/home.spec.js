import {
  REQUEST_NAVIGATION,
  RECEIVE_NAVIGATION,
  REQUEST_TOS,
  RECEIVE_TOS,
  TOGGLE_PHASE_VISIBILITY,
  SET_PHASES_VISIBILITY,
  SET_DOCUMENT_STATE,
  requestNavigation,
  // receiveNavigation,
  // selectTOS,
  requestTOS,
  // receiveTOS,
  // fetchTOS,
  // fetchNavigation,
  // togglePhaseVisibility,
  // setPhasesVisibility,
  // setDocumentState,

  default as homeReducer
} from 'routes/Home/modules/home';

describe('(Redux Module) Home', () => {
  it('Should export a constant REQUEST_NAVIGATION.', () => {
    expect(REQUEST_NAVIGATION).to.equal('REQUEST_NAVIGATION');
  });
  it('Should export a constant RECEIVE_NAVIGATION.', () => {
    expect(RECEIVE_NAVIGATION).to.equal('RECEIVE_NAVIGATION');
  });
  it('Should export a constant REQUEST_TOS.', () => {
    expect(REQUEST_TOS).to.equal('REQUEST_TOS');
  });
  it('Should export a constant RECEIVE_TOS.', () => {
    expect(RECEIVE_TOS).to.equal('RECEIVE_TOS');
  });
  it('Should export a constant TOGGLE_PHASE_VISIBILITY.', () => {
    expect(TOGGLE_PHASE_VISIBILITY).to.equal('TOGGLE_PHASE_VISIBILITY');
  });
  it('Should export a constant SET_PHASES_VISIBILITY.', () => {
    expect(SET_PHASES_VISIBILITY).to.equal('SET_PHASES_VISIBILITY');
  });
  it('Should export a constant SET_DOCUMENT_STATE.', () => {
    expect(SET_DOCUMENT_STATE).to.equal('SET_DOCUMENT_STATE');
  });

  describe('(Reducer)', () => {
    let _initialState;
    beforeEach(() => {
      _initialState = {
        navigationMenuItems: [],
        selectedTOS: {
          isFetching: false,
          data: {},
          documentState: 'view',
          lastUpdated: 0
        },
        recordTypes: {}
      };
    });
    it('Should be a function.', () => {
      expect(homeReducer).to.be.a('function');
    });

    it('Should initialize with a state', () => {
      expect(homeReducer(undefined, {})).to.deep.equal(_initialState);
    });

    it('Should return the previous state if an action was not matched.', () => {
      let state = homeReducer(undefined, {});
      expect(state).to.deep.equal(_initialState);
      state = homeReducer(state, {
        type: '@@@@@@@'
      });
      expect(state).to.deep.equal(_initialState);
      state = homeReducer(state, requestTOS());
      expect(state.selectedTOS.isFetching).to.equal(true);
      state = homeReducer(state, {
        type: '@@@@@@@'
      });
      expect(state.selectedTOS.isFetching).to.equal(true);
    });
  });

  describe('(Action Creator) requestNavigation', () => {
    it('Should be exported as a function.', () => {
      expect(requestNavigation).to.be.a('function');
    });

    it('Should return an action with type "REQUEST_NAVIGATION".', () => {
      expect(requestNavigation()).to.have.property('type', REQUEST_NAVIGATION);
    });
  });

  // describe('(Action Creator) receiveNavigation', () => {
  //   let _globalState;
  //   let _dispatchSpy;
  //   let _getStateSpy;
  //
  //   beforeEach(() => {
  //     _globalState = {
  //       counter: counterReducer(undefined, {})
  //     };
  //     _dispatchSpy = sinon.spy((action) => {
  //       _globalState = {
  //         ..._globalState,
  //         counter: counterReducer(_globalState.counter, action)
  //       };
  //     });
  //     _getStateSpy = sinon.spy(() => {
  //       return _globalState;
  //     });
  //   });
  //
  //   it('Should be exported as a function.', () => {
  //     expect(doubleAsync).to.be.a('function');
  //   });
  //
  //   it('Should return a function (is a thunk).', () => {
  //     expect(doubleAsync()).to.be.a('function');
  //   });
  //
  //   it('Should return a promise from that thunk that gets fulfilled.', () => {
  //     return doubleAsync()(_dispatchSpy, _getStateSpy).should.eventually.be.fulfilled;
  //   });
  //
  //   it('Should call dispatch and getState exactly once.', () => {
  //     return doubleAsync()(_dispatchSpy, _getStateSpy)
  //       .then(() => {
  //         _dispatchSpy.should.have.been.calledOnce;
  //         _getStateSpy.should.have.been.calledOnce;
  //       });
  //   });
  //
  //   it('Should produce a state that is double the previous state.', () => {
  //     _globalState = {
  //       counter: 2
  //     };
  //
  //     return doubleAsync()(_dispatchSpy, _getStateSpy)
  //       .then(() => {
  //         _dispatchSpy.should.have.been.calledOnce;
  //         _getStateSpy.should.have.been.calledOnce;
  //         expect(_globalState.counter).to.equal(4);
  //         return doubleAsync()(_dispatchSpy, _getStateSpy);
  //       })
  //       .then(() => {
  //         _dispatchSpy.should.have.been.calledTwice;
  //         _getStateSpy.should.have.been.calledTwice;
  //         expect(_globalState.counter).to.equal(8);
  //       });
  //   });
  // });
  //
  // // NOTE: if you have a more complex state, you will probably want to verify
  // // that you did not mutate the state. In this case our state is just a number
  // // (which cannot be mutated).
  // describe('(Action Handler) COUNTER_INCREMENT', () => {
  //   it('Should increment the state by the action payload\'s "value" property.', () => {
  //     let state = counterReducer(undefined, {});
  //     expect(state).to.equal(0);
  //     state = counterReducer(state, increment(1));
  //     expect(state).to.equal(1);
  //     state = counterReducer(state, increment(2));
  //     expect(state).to.equal(3);
  //     state = counterReducer(state, increment(-3));
  //     expect(state).to.equal(0);
  //   });
  // });
});
