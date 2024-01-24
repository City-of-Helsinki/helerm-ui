import React from 'react';
import { createBrowserHistory } from 'history';
import { Router } from 'react-router-dom';

import BulkListViewContainer from '../BulkListViewContainer';
import renderWithProviders from '../../../utils/renderWithProviders';

const renderComponent = () => {
  const history = createBrowserHistory();

  return renderWithProviders(
    <Router history={history}>
      <BulkListViewContainer />
    </Router>,
    { history },
  );
};

describe('<BulkListView />', () => {
  it('renders correctly', () => {
    renderComponent();
  });
});
