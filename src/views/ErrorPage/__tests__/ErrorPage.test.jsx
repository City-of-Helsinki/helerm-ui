import React from 'react';
import { screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import ErrorPage from '../ErrorPage';
import renderWithProviders from '../../../utils/renderWithProviders';

const renderComponent = (props = {}) => {
  return renderWithProviders(
    <BrowserRouter>
      <ErrorPage {...props} />
    </BrowserRouter>,
  );
};

describe('<ErrorPage />', () => {
  it('renders error message correctly', () => {
    renderComponent();
    const errorMessage = screen.getByText('Jokin meni pieleen. Yritä hetken kuluttua uudelleen.');
    expect(errorMessage).toBeInTheDocument();
  });

  it('renders front page link when hideFrontPageLink is false', () => {
    renderComponent();
    const frontPageLink = screen.getByRole('link', { name: 'Etusivulle' });
    expect(frontPageLink).toBeInTheDocument();
    expect(frontPageLink.getAttribute('href')).toBe('/');
  });

  it('does not render front page link when hideFrontPageLink is true', () => {
    renderComponent({ hideFrontPageLink: true });
    const frontPageLink = screen.queryByRole('link', { name: 'Etusivulle' });
    expect(frontPageLink).not.toBeInTheDocument();
  });
});
