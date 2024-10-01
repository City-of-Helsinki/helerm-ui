import { createBrowserHistory } from 'history';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import InfoLayout from '../InfoLayout/InfoLayout';
import renderWithProviders from '../../utils/renderWithProviders';

const renderComponent = (history) =>
  renderWithProviders(
    <BrowserRouter>
      <InfoLayout />
    </BrowserRouter>,
    {
      history,
    },
  );

describe('<InfoLayout />', () => {
  it('should render correctly', () => {
    const history = createBrowserHistory();

    renderComponent(history);
  });
});
