import React from 'react';
import { createBrowserHistory } from 'history';
import { Router } from 'react-router-dom';

import BulkViewContainer from '../BulkViewContainer';
import renderWithProviders from '../../../../utils/renderWithProviders';

const renderComponent = () => {
  const history = createBrowserHistory();

  return renderWithProviders(
    <Router history={history}>
      <BulkViewContainer />
    </Router>,
    { history },
  );
};

describe('<BulkView />', () => {
  it('renders correctly', () => {
    renderComponent();
  });
});
