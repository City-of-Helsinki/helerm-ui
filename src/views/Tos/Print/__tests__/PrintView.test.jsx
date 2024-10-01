import React from 'react';
import { createBrowserHistory } from 'history';
import { BrowserRouter } from 'react-router-dom';

import PrintView from '../PrintView';
import renderWithProviders from '../../../../utils/renderWithProviders';

const renderComponent = () => {
  const history = createBrowserHistory();

  return renderWithProviders(
    <BrowserRouter history={history}>
      <PrintView />
    </BrowserRouter>,
    { history },
  );
};

describe('<PrintView />', () => {
  it('renders correctly', () => {
    renderComponent();
  });
});
