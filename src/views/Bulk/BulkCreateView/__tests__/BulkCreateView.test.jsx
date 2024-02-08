import { createBrowserHistory } from 'history';
import React from 'react';
import { Router } from 'react-router-dom';

import BulkCreateViewContainer from '../BulkCreateViewContainer';
import renderWithProviders from '../../../../utils/renderWithProviders';

const renderComponent = () => {
  const history = createBrowserHistory();

  return renderWithProviders(
    <Router history={history}>
      <BulkCreateViewContainer />
    </Router>,
    { history },
  );
};

describe('<BulkCreateView />', () => {
  it('renders correctly', () => {
    renderComponent();
  });
});
