import React from 'react';
import { createBrowserHistory } from 'history';
import { BrowserRouter } from 'react-router-dom';

import ClassificationTreeContainer from '../ClassificationTreeContainer';
import renderWithProviders from '../../../utils/renderWithProviders';

const renderComponent = () => {
  const history = createBrowserHistory();

  return renderWithProviders(
    <BrowserRouter>
      <ClassificationTreeContainer />
    </BrowserRouter>,
    { history },
  );
};

describe('<ClassificationTree />', () => {
  it('renders correctly', () => {
    renderComponent();
  });
});
