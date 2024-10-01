import React from 'react';
import { createBrowserHistory } from 'history';
import { BrowserRouter } from 'react-router-dom';

import FacetedSearchContainer from '../FacetedSearchContainer';
import renderWithProviders from '../../../utils/renderWithProviders';

const renderComponent = () => {
  const history = createBrowserHistory();

  return renderWithProviders(
    <BrowserRouter>
      <FacetedSearchContainer />
    </BrowserRouter>,
    { history },
  );
};

describe('<FacetedSearch />', () => {
  it('renders correctly', () => {
    renderComponent();
  });
});
