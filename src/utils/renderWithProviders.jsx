import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react';
import { LoginProvider } from 'hds-react';

import { NotificationsProvider } from '../components/NotificationsContext/NotificationsContext';
import { initialState as navigationInitialState } from '../store/reducers/navigation';
import { initialState as validationInitialState } from '../store/reducers/validation';
import { initialState as routerInitialState } from '../store/reducers/router';
import { initialState as selectedTOSInitialState } from '../store/reducers/tos-toolkit/main';
import { initialState as classificationInitialState } from '../store/reducers/classification';
import { initialState as userInitialState } from '../store/reducers/user';
import { initialState as uiInitialState } from '../store/reducers/ui';
import { initialState as bulkInitialState } from '../store/reducers/bulk';
import { initialState as searchInitialState } from '../store/reducers/search';
import makeRootReducer from '../store/rootReducers';
import storeCreator from '../store/createStore';

export const storeDefaultState = {
  navigation: navigationInitialState,
  validation: validationInitialState,
  router: routerInitialState,
  selectedTOS: selectedTOSInitialState,
  classification: classificationInitialState,
  user: userInitialState,
  ui: uiInitialState,
  bulk: bulkInitialState,
  search: searchInitialState,
};

/**
 * Creates a real RTK store that also records dispatched actions.
 * Drop-in replacement for redux-mock-store: supports store.getActions() and
 * store.clearActions() while applying real reducers so state actually updates.
 */
export const createTestStore = (preloadedState = {}) => {
  const dispatchedActions = [];

  const actionRecorder = () => (next) => (action) => {
    if (typeof action !== 'function') {
      dispatchedActions.push(action);
    }
    return next(action);
  };

  const store = configureStore({
    reducer: makeRootReducer(),
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: ['router/LOCATION_CHANGE'],
          ignoredPaths: ['router.location'],
        },
      }).concat(actionRecorder),
  });

  store.getActions = () => [...dispatchedActions];
  store.clearActions = () => {
    dispatchedActions.length = 0;
  };

  return store;
};

const renderWithProviders = (
  ui,
  { preloadedState = storeDefaultState, store = storeCreator(preloadedState), ...renderOptions } = {},
) => {
  // eslint-disable-next-line @eslint-react/component-hook-factories
  const Wrapper = ({ children }) => (
    <LoginProvider>
      <Provider store={store}>
        <NotificationsProvider>{children}</NotificationsProvider>
      </Provider>
    </LoginProvider>
  );

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
};

export default renderWithProviders;
