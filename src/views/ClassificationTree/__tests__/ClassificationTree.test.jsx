import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import ClassificationTree from '../ClassificationTree';
import renderWithProviders from '../../../utils/renderWithProviders';

const renderComponent = () => {
  return renderWithProviders(
    <BrowserRouter>
      <ClassificationTree />
    </BrowserRouter>,
  );
};

describe('<ClassificationTree />', () => {
  it('renders correctly', () => {
    renderComponent();
  });
});
