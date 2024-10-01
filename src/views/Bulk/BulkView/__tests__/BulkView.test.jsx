import React from 'react';
import { createBrowserHistory } from 'history';
import { BrowserRouter } from 'react-router-dom';

import BulkViewContainer from '../BulkViewContainer';
import renderWithProviders from '../../../../utils/renderWithProviders';

const renderComponent = () => {
  const history = createBrowserHistory();

  return renderWithProviders(
    <BrowserRouter>
      <BulkViewContainer />
    </BrowserRouter>,
    { history },
  );
};

describe('<BulkView />', () => {
  it('renders correctly', () => {
    renderComponent();
  });
});
