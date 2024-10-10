import { createBrowserHistory } from 'history';
import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import BulkCreateViewContainer from '../BulkCreateViewContainer';
import renderWithProviders from '../../../../utils/renderWithProviders';

const renderComponent = () => {
  const history = createBrowserHistory();
  const router = createBrowserRouter([{ path: '/', element: <BulkCreateViewContainer /> }]);

  return renderWithProviders(<RouterProvider router={router} />, { history });
};

describe('<BulkCreateView />', () => {
  it('renders correctly', () => {
    renderComponent();
  });
});
