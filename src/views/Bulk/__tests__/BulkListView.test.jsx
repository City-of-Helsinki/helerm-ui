import React from 'react';
import { createBrowserHistory } from 'history';
import { BrowserRouter } from 'react-router-dom';

import BulkListViewContainer from '../BulkListViewContainer';
import renderWithProviders from '../../../utils/renderWithProviders';

const renderComponent = () => {
  const history = createBrowserHistory();

  return renderWithProviders(
    <BrowserRouter>
      <BulkListViewContainer />
    </BrowserRouter>,
    { history },
  );
};

describe('<BulkListView />', () => {
  it('renders correctly', () => {
    renderComponent();
  });
});
