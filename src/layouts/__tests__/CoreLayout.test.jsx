import { createBrowserHistory } from 'history';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import CoreLayout from '../CoreLayout/CoreLayout';
import renderWithProviders from '../../utils/renderWithProviders';

const renderComponent = (history) =>
  renderWithProviders(
    <BrowserRouter>
      <CoreLayout />
    </BrowserRouter>,
    {
      history,
    },
  );

describe('<CoreLayout />', () => {
  it('should render correctly', () => {
    const history = createBrowserHistory();

    renderComponent(history);
  });
});
