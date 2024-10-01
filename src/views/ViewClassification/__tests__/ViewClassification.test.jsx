import React from 'react';
import { createBrowserHistory } from 'history';
import { BrowserRouter } from 'react-router-dom';

import ViewClassificationContainer from '../ViewClassificationContainer';
import renderWithProviders from '../../../utils/renderWithProviders';

const renderComponent = () => {
  const history = createBrowserHistory();

  return renderWithProviders(
    <BrowserRouter>
      <ViewClassificationContainer />
    </BrowserRouter>,
    { history },
  );
};

describe('<ViewClassification />', () => {
  it('renders correctly', () => {
    renderComponent();
  });
});
