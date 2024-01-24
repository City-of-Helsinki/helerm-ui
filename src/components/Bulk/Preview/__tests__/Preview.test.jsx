import React from 'react';
import { createBrowserHistory } from 'history';
import { Router } from 'react-router-dom';

import Preview from '../Preview';
import renderWithProviders from '../../../../utils/renderWithProviders';

const renderComponent = () => {
  const history = createBrowserHistory();

  return renderWithProviders(
    <Router history={history}>
      <Preview conversions={[]} />
    </Router>,
    { history },
  );
};

describe('<Preview />', () => {
  it('renders correctly', () => {
    renderComponent();
  });
});
