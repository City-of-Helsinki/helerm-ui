/* eslint-disable react/prop-types */
import React from 'react';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react';
import { LoginProvider } from 'hds-react';

import { initialState as navigationInitialState } from '../store/reducers/navigation';
import { initialState as validationInitialState } from '../store/reducers/validation';
import { initialState as routerInitialState } from '../store/reducers/router';
import { initialState as selectedTOSInitialState } from '../store/reducers/tos-toolkit/main';
import { initialState as classificationInitialState } from '../store/reducers/classification';
import { initialState as userInitialState } from '../store/reducers/user';
import { initialState as uiInitialState } from '../store/reducers/ui';
import { initialState as bulkInitialState } from '../store/reducers/bulk';
import { initialState as searchInitialState } from '../store/reducers/search';
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

const renderWithProviders = (
  ui,
  { preloadedState = storeDefaultState, store = storeCreator(preloadedState), ...renderOptions } = {},
) => {
  const Wrapper = ({ children }) => (
    <LoginProvider>
      <Provider store={store}>{children}</Provider>
    </LoginProvider>
  );

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
};

export default renderWithProviders;
