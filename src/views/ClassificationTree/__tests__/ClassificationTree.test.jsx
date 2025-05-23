import React from 'react';
import { createBrowserHistory } from 'history';
import { BrowserRouter } from 'react-router-dom';

import ClassificationTree from '../ClassificationTree';
import renderWithProviders from '../../../utils/renderWithProviders';

const renderComponent = () => {
  const history = createBrowserHistory();

  return renderWithProviders(
    <BrowserRouter>
      <ClassificationTree />
    </BrowserRouter>,
    { history },
  );
};

describe('<ClassificationTree />', () => {
  it('renders correctly', () => {
    renderComponent();
  });
});
