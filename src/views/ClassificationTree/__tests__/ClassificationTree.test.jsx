import React from 'react';
import { createBrowserHistory } from 'history';
import { Router } from 'react-router-dom';

import ClassificationTreeContainer from '../ClassificationTreeContainer';
import renderWithProviders from '../../../utils/renderWithProviders';

const renderComponent = () => {
  const history = createBrowserHistory();

  return renderWithProviders(
    <Router history={history}>
      <ClassificationTreeContainer />
    </Router>,
    { history },
  );
};

describe('<ClassificationTree />', () => {
  it('renders correctly', () => {
    renderComponent();
  });
});
