import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import CoreLayout from '../CoreLayout/CoreLayout';
import renderWithProviders from '../../utils/renderWithProviders';

const renderComponent = () =>
  renderWithProviders(
    <BrowserRouter>
      <CoreLayout />
    </BrowserRouter>,
  );

describe('<CoreLayout />', () => {
  it('should render correctly', () => {
    renderComponent();
  });
});
