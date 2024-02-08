import React from 'react';
import { createBrowserHistory } from 'history';
import { Router } from 'react-router-dom';

import PrintView from '../PrintView';
import renderWithProviders from '../../../../utils/renderWithProviders';

const renderComponent = () => {
  const history = createBrowserHistory();

  return renderWithProviders(
    <Router history={history}>
      <PrintView />
    </Router>,
    { history },
  );
};

describe('<PrintView />', () => {
  it('renders correctly', () => {
    renderComponent();
  });
});
