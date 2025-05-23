import React from 'react';
import { createBrowserHistory } from 'history';
import { BrowserRouter } from 'react-router-dom';

import FacetedSearch from '../FacetedSearch';
import renderWithProviders from '../../../utils/renderWithProviders';

const renderComponent = () => {
  const history = createBrowserHistory();

  return renderWithProviders(
    <BrowserRouter>
      <FacetedSearch />
    </BrowserRouter>,
    { history },
  );
};

describe('<FacetedSearch />', () => {
  it('renders correctly', () => {
    renderComponent();
  });
});
