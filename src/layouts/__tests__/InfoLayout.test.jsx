import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import InfoLayout from '../InfoLayout/InfoLayout';
import renderWithProviders from '../../utils/renderWithProviders';

const renderComponent = () =>
  renderWithProviders(
    <BrowserRouter>
      <InfoLayout />
    </BrowserRouter>,
  );

describe('<InfoLayout />', () => {
  it('should render correctly', () => {
    renderComponent();
  });
});
