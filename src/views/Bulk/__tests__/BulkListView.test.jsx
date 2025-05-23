import React from 'react';
import { createBrowserHistory } from 'history';
import { BrowserRouter } from 'react-router-dom';

import BulkListView from '../BulkListView';
import renderWithProviders from '../../../utils/renderWithProviders';

const renderComponent = () => {
  const history = createBrowserHistory();

  return renderWithProviders(
    <BrowserRouter>
      <BulkListView />
    </BrowserRouter>,
    { history },
  );
};

describe('<BulkListView />', () => {
  it('renders correctly', () => {
    renderComponent();
  });
});
