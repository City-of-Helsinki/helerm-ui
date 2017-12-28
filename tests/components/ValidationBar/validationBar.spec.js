// import {
//   setValidationVisibility,
//   default as validationReducer
// } from 'components/Tos/ValidationBar/reducer';
//
// describe('(Redux Module) Validation', () => {
//   describe('(Reducer) ValidationReducer', () => {
//     let _initialState;
//     beforeEach(() => {
//       _initialState = {
//         is_open: false
//       };
//     });
//     it('Should be a function.', () => {
//       expect(validationReducer).to.be.a('function');
//     });
//
//     it('Should initialize with a correct state', () => {
//       expect(validationReducer(undefined, {})).to.deep.equal(_initialState);
//     });
//
//     it('Should return the previous state if an action was not matched.', () => {
//       let state = validationReducer(undefined, {});
//       expect(state).to.deep.equal(_initialState);
//       state = validationReducer(state, {
//         type: 'DOESNOTACTUALLYEXISTLOL'
//       });
//       expect(state).to.deep.equal(_initialState);
//       state = validationReducer(state, setValidationVisibility(true));
//       expect(state.is_open).to.equal(true);
//       state = validationReducer(state, {
//         type: 'DOESNOTACTUALLYEXISTLOL'
//       });
//       expect(state.is_open).to.equal(true);
//     });
//   });
// });
