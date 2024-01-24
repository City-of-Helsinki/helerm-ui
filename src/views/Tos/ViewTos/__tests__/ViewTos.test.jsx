import React from 'react';
import { createBrowserHistory } from 'history';
import { Router } from 'react-router-dom';

import ViewTosContainer from '../ViewTosContainer';
import renderWithProviders from '../../../../utils/renderWithProviders';

const renderComponent = () => {
  const history = createBrowserHistory();

  return renderWithProviders(
    <Router history={history}>
      <ViewTosContainer />
    </Router>,
    { history },
  );
};

describe('<ViewTos />', () => {
  it('renders correctly', () => {
    renderComponent();
  });
});
