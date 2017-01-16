import {
  fetchNavigation,
  fetchTOS,
  requestTOS,
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
        navigation: {
          items: [],
          is_open: true
        },
        selectedTOS: {
          tos: {},
          actions: {},
          phases: {},
          records: {},
          attributes: {},
          path: [],
          documentState: 'view',
          lastUpdated: 0
        },
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
        type: '@@@@@@@'
      });
      expect(state).to.deep.equal(_initialState);
      state = homeReducer(state, requestTOS());
      expect(state.isFetching).to.equal(true);
      state = homeReducer(state, {
        type: '@@@@@@@'
      });
      expect(state.isFetching).to.equal(true);
    });
  });

  describe('(Action Creator) fetchNavigation', () => {
    let _dispatchSpy;
    let _globalState;
    this.timeout(15000);

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

    it('Should fetch navigation', () => {
      expect(_globalState.home.navigation.items.length).to.equal(0);
      return fetchNavigation()(_dispatchSpy)
        .then(() => {
          _dispatchSpy.should.have.been.calledTwice;
          expect(_globalState.home.navigation.items.length).to.be.greaterThan(0);
        });
    });
  });

  describe('(Action Creator) fetchTOS', () => {
    let _dispatchSpy;
    let _globalState;
    this.timeout(15000);

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

    it('Should fetch TOS', () => {
      expect(_.keys(_globalState.home.selectedTOS.tos).length).to.equal(0);
      expect(_.keys(_globalState.home.selectedTOS.phases).length).to.equal(0);
      expect(_.keys(_globalState.home.selectedTOS.actions).length).to.equal(0);
      expect(_.keys(_globalState.home.selectedTOS.records).length).to.equal(0);
      expect(_.keys(_globalState.home.selectedTOS.attributes).length).to.equal(0);
      return fetchTOS(
          '136adca92b054ff79b990dae4ce78d47',
        [ '05 Sosiaalitoimi',
          '05 01 Lasten päivähoito',
          '05 01 01 Yksilöhuollon muutoksenhaku (lasten päivähoito)'
        ]
        )(_dispatchSpy)
        .then(() => {
          _dispatchSpy.should.have.been.calledTwice;
          expect(_.keys(_globalState.home.selectedTOS.tos).length).to.be.greaterThan(0);
          expect(_.keys(_globalState.home.selectedTOS.phases).length).to.be.greaterThan(0);
          expect(_.keys(_globalState.home.selectedTOS.actions).length).to.be.greaterThan(0);
          expect(_.keys(_globalState.home.selectedTOS.records).length).to.be.greaterThan(0);
        });
    });
  });

  describe('(Action Creator) fetchRecordTypes', () => {
    let _dispatchSpy;
    let _globalState;
    this.timeout(15000);

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
    this.timeout(15000);

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
