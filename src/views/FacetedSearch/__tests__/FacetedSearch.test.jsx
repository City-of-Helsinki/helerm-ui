import React from 'react';
import { createBrowserHistory } from 'history';
import { Router } from 'react-router-dom';

import FacetedSearchContainer from '../FacetedSearchContainer';
import renderWithProviders from '../../../utils/renderWithProviders';

const renderComponent = () => {
  const history = createBrowserHistory();

  return renderWithProviders(
    <Router history={history}>
      <FacetedSearchContainer />
    </Router>,
    { history },
  );
};

describe('<FacetedSearch />', () => {
  it('renders correctly', () => {
    renderComponent();
  });
});
