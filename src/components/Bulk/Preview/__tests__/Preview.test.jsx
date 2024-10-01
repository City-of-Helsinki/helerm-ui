import React from 'react';
import { createBrowserHistory } from 'history';
import { BrowserRouter } from 'react-router-dom';

import Preview from '../Preview';
import renderWithProviders from '../../../../utils/renderWithProviders';

const renderComponent = () => {
  const history = createBrowserHistory();

  return renderWithProviders(
    <BrowserRouter history={history}>
      <Preview conversions={[]} />
    </BrowserRouter>,
    { history },
  );
};

describe('<Preview />', () => {
  it('renders correctly', () => {
    renderComponent();
  });
});
