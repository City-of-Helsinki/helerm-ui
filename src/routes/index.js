// // We only need to import the modules necessary for initial render
// import CoreLayout from '../layouts/CoreLayout/CoreLayout';
// import Home from './Home';
// // import ViewTOS from './ViewTOS';
//
// /*  Note: Instead of using JSX, we recommend using react-router
//     PlainRoute objects to build route definitions.   */
//
// export const createRoutes = (store) => ({
//   path        : '/',
//   component   : CoreLayout,
//   indexRoute  : Home(store),
//   childRoutes : [
//     // ViewTOS
//   ]
// });
//
// /*  Note: childRoutes can be chunked or otherwise loaded programmatically
//     using getChildRoutes with the following signature:
//
//     getChildRoutes (location, cb) {
//       require.ensure([], (require) => {
//         cb(null, [
//           // Remove imports!
//           require('./Counter').default(store)
//         ])
//       })
//     }
//
//     However, this is not necessary for code-splitting! It simply provides
//     an API for async route definitions. Your code splitting should occur
//     inside the route `getComponent` function, since it is only invoked
//     when the route exists and matches.
// */
//
// export default createRoutes;

import React from 'react';
import { Route, IndexRoute } from 'react-router';
import CoreLayout from '../layouts/CoreLayout/CoreLayout';
import Home from './Home/containers/HomeContainer';

// import { injectReducer } from '../../store/reducers';
//
// export default (store) => ({
//   /*  Async getComponent is only invoked when route matches   */
//   getComponent (nextState, cb) {
//     /*  Webpack - use 'require.ensure' to create a split point
//         and embed an async module loader (jsonp) when bundling   */
//     require.ensure([], (require) => {
//       /*  Webpack - use require callback to define
//           dependencies for bundling   */
//       const Home = require('./containers/HomeContainer').default;
//       const reducer = require('./modules/home').default;
//
//       /*  Add the reducer to the store on key 'navigation'  */
//       injectReducer(store, { key: 'home', reducer });
//
//       /*  Return getComponent   */
//       cb(null, Home);
//
//     /* Webpack named bundle   */
//     }, 'home');
//   }
// });

export default () => (
  <Route path='/' component={CoreLayout}>
    <IndexRoute component={Home} />
    {/* <Route path='viewtos' component={ViewTOS} /> */}
  </Route>
);
