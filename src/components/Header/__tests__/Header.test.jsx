import { createBrowserHistory } from 'history';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { screen } from '@testing-library/react';

import renderWithProviders from '../../../utils/renderWithProviders';
import Header from '../Header';

const renderComponent = (history) =>
  renderWithProviders(
    <BrowserRouter>
      <Header />
    </BrowserRouter>,
    {
      history,
    },
  );

describe('<Header />', () => {
  it('should render correctly', () => {
    const history = createBrowserHistory();

    renderComponent(history);
  });

  it('should render a nav bar with correct title', async () => {
    const history = createBrowserHistory();

    renderComponent(history);

    const nav = await screen.findByRole('navigation');
    const title = await screen.findByText(/Tiedonohjaus/);

    expect(nav).toBeInTheDocument();
    expect(title).toBeInTheDocument();
  });
});
