/* eslint-disable react/prop-types */
import React from 'react';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react';
import { LoginProvider } from 'hds-react';

import storeCreator from '../store/createStore';

const renderWithProviders = (
  ui,
  { preloadedState = {}, history, store = storeCreator(history, preloadedState), ...renderOptions } = {},
) => {
  const Wrapper = ({ children }) => (
    <LoginProvider>
      <Provider store={store}>{children}</Provider>
    </LoginProvider>
  );

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
};

export default renderWithProviders;
