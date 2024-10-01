import React from 'react';
import { createBrowserHistory } from 'history';
import { BrowserRouter } from 'react-router-dom';

import ViewTosContainer from '../ViewTosContainer';
import renderWithProviders from '../../../../utils/renderWithProviders';

const renderComponent = () => {
  const history = createBrowserHistory();

  return renderWithProviders(
    <BrowserRouter history={history}>
      <ViewTosContainer />
    </BrowserRouter>,
    { history },
  );
};

describe('<ViewTos />', () => {
  it('renders correctly', () => {
    renderComponent();
  });
});
