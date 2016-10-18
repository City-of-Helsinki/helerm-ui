import { injectReducer } from '../../store/reducers';

export default (store) => ({
  /*  Async getComponent is only invoked when route matches   */
  getComponent (nextState, cb) {
    /*  Webpack - use 'require.ensure' to create a split point
        and embed an async module loader (jsonp) when bundling   */
    require.ensure([], (require) => {
      /*  Webpack - use require callback to define
          dependencies for bundling   */
      const Navigation = require('./containers/NavigationContainer').default;
      const reducer = require('./modules/navigation').default;

      /*  Add the reducer to the store on key 'navigation'  */
      injectReducer(store, { key: 'navigation', reducer });

      /*  Return getComponent   */
      cb(null, Navigation);

    /* Webpack named bundle   */
  }, 'navigation');
  }
});
