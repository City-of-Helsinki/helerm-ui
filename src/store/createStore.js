import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';
import { routerMiddleware } from 'connected-react-router';
import { composeWithDevTools } from 'redux-devtools-extension/developmentOnly';

import makeRootReducer from './rootReducers';

const storeCreator = (history, initialState = {}) => {
  // ======================================================
  // Store Instantiation and HMR Setup
  // ======================================================
  const store = createStore(
    makeRootReducer(history),
    initialState,
    composeWithDevTools(applyMiddleware(routerMiddleware(history), thunk))
  );
  store.asyncReducers = {};

  // if (module.hot) {
  //   module.hot.accept('./rootReducers', () => {
  //     store.replaceReducer(makeRootReducer(store.asyncReducers));
  //   });
  // }

  return store;
};

export default storeCreator;
