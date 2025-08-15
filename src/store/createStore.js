import { configureStore } from '@reduxjs/toolkit';

import makeRootReducer from './rootReducers';

const storeCreator = (initialState = {}) => {
  // ======================================================
  // Store Instantiation and HMR Setup
  // ======================================================
  const store = configureStore({
    reducer: makeRootReducer(),
    preloadedState: initialState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: ['router/LOCATION_CHANGE'],
          ignoredPaths: ['router.location'],
        },
      }),
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
