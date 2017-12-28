// import {
//   fetchNavigation,
//   requestNavigation,
//   default as navigationReducer
// } from 'components/Navigation/reducer';
//
// describe('(Redux Module) Navigation', () => {
//   describe('(Reducer) NavigationReducer', () => {
//     let _initialState;
//     beforeEach(() => {
//       _initialState = {
//         isFetching: false,
//         items: [],
//         is_open: true
//       };
//     });
//     it('Should be a function.', () => {
//       expect(navigationReducer).to.be.a('function');
//     });
//
//     it('Should initialize with a correct state', () => {
//       expect(navigationReducer(undefined, {})).to.deep.equal(_initialState);
//     });
//
//     it('Should return the previous state if an action was not matched.', () => {
//       let state = navigationReducer(undefined, {});
//       expect(state).to.deep.equal(_initialState);
//       state = navigationReducer(state, {
//         type: 'DOESNOTACTUALLYEXISTLOL'
//       });
//       expect(state).to.deep.equal(_initialState);
//       state = navigationReducer(state, requestNavigation());
//       expect(state.isFetching).to.equal(true);
//       state = navigationReducer(state, {
//         type: 'DOESNOTACTUALLYEXISTLOL'
//       });
//       expect(state.isFetching).to.equal(true);
//     });
//   });
//
//   describe('(Action Creator) fetchNavigation', () => {
//     let _dispatchSpy;
//     let _globalState;
//
//     beforeEach(() => {
//       _globalState = {
//         navigation: navigationReducer(undefined, {})
//       };
//       _dispatchSpy = sinon.spy((action) => {
//         _globalState = {
//           ..._globalState,
//           navigation: navigationReducer(_globalState.navigation, action)
//         };
//       });
//     });
//
//     it('Should fetch navigation', () => {
//       expect(_globalState.navigation.items.length).to.equal(0);
//       return setTimeout(fetchNavigation()(_dispatchSpy)
//         .then(() => {
//           _dispatchSpy.should.have.been.calledTwice;
//           expect(_globalState.navigation.items.length).to.be.greaterThan(0);
//         }), 15000);
//     });
//   });
// });
