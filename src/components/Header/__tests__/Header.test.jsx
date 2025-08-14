import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { screen } from '@testing-library/react';

import renderWithProviders from '../../../utils/renderWithProviders';
import Header from '../Header';

const renderComponent = () =>
  renderWithProviders(
    <BrowserRouter>
      <Header />
    </BrowserRouter>,
  );

describe('<Header />', () => {
  it('should render correctly', () => {
    renderComponent();
  });

  it('should render a nav bar with correct title', async () => {
    renderComponent();

    const nav = await screen.findByRole('navigation');
    const title = await screen.findByText(/Tiedonohjaus/);

    expect(nav).toBeInTheDocument();
    expect(title).toBeInTheDocument();
  });
});
