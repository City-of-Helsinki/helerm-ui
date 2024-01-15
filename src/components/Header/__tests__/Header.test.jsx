import { createBrowserHistory } from 'history';
import React from 'react';
import { Router } from 'react-router-dom';
import { screen } from '@testing-library/react';

import renderWithProviders from '../../../utils/renderWithProviders';
import Header from '../Header';

const renderComponent = (history) =>
  renderWithProviders(
    <Router history={history}>
      <Header />
    </Router>,
    {
      history,
    },
  );

describe('<Header />', () => {
  it('should render correctly', () => {
    const history = createBrowserHistory();

    const { container } = renderComponent(history);

    expect(container).toMatchSnapshot();
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
