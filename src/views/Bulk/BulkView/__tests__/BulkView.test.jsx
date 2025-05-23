import React from 'react';
import { createBrowserHistory } from 'history';
import { BrowserRouter } from 'react-router-dom';

import BulkView from '../BulkView';
import renderWithProviders from '../../../../utils/renderWithProviders';

const renderComponent = () => {
  const history = createBrowserHistory();

  return renderWithProviders(
    <BrowserRouter>
      <BulkView />
    </BrowserRouter>,
    { history },
  );
};

describe('<BulkView />', () => {
  it('renders correctly', () => {
    renderComponent();
  });
});
