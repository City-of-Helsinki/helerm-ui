import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { createBrowserHistory } from 'history';

import renderWithProviders from '../../../utils/renderWithProviders';
import NavigationContainer from '../NavigationContainer';
import attributeRules from '../../../utils/mocks/attributeRules.json';
import validTOS from '../../../utils/mocks/validTOS.json';
import classification from '../../../utils/mocks/classification.json';
import user from '../../../utils/mocks/user.json';

const renderComponent = (history) =>
  renderWithProviders(
    <BrowserRouter history={history}>
      <NavigationContainer />
    </BrowserRouter>,
    {
      history,
      preloadedState: {
        selectedTOS: validTOS,
        navigation: {
          timestamp: '123456789',
          items: [validTOS],
          classification,
          is_open: false,
          isFetching: false,
        },
        ui: { attributeTypes: attributeRules },
        user: {
          data: user,
        },
      },
    },
  );

describe('<Navigation />', () => {
  it('should render correctly', () => {
    const history = createBrowserHistory();

    renderComponent(history);
  });
});
