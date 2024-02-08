import React from 'react';
import { createBrowserHistory } from 'history';
import { Router } from 'react-router-dom';

import ViewClassificationContainer from '../ViewClassificationContainer';
import renderWithProviders from '../../../utils/renderWithProviders';

const renderComponent = () => {
  const history = createBrowserHistory();

  return renderWithProviders(
    <Router history={history}>
      <ViewClassificationContainer />
    </Router>,
    { history },
  );
};

describe('<ViewClassification />', () => {
  it('renders correctly', () => {
    renderComponent();
  });
});
