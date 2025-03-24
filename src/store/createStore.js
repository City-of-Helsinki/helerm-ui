import thunk from 'redux-thunk';
import { routerMiddleware } from 'connected-react-router';
import { configureStore } from '@reduxjs/toolkit';

import makeRootReducer from './rootReducers';


const storeCreator = (history, initialState = {}) => {
  // ======================================================
  // Store Instantiation and HMR Setup
  // ======================================================
  const store = configureStore({
    middleware: [thunk, routerMiddleware(history)],
    reducer: makeRootReducer(history),
    preloadedState: initialState
  });

  store.asyncReducers = {};

  if (import.meta.hot) {
    import.meta.hot.accept('./rootReducers', () => {
      store.replaceReducer(makeRootReducer(store.asyncReducers));
    });
  }

  return store;
};

export default storeCreator;
