/* eslint-disable react/prop-types */
import React from 'react';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react';

import storeCreator from '../store/createStore';

const renderWithProviders = (
  ui,
  { preloadedState = {}, history, store = storeCreator(history, preloadedState), ...renderOptions } = {},
) => {
  const Wrapper = ({ children }) => <Provider store={store}>{children}</Provider>;

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
};


export default renderWithProviders;

