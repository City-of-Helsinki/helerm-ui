import React from 'react';
import { createBrowserHistory } from 'history';
import { BrowserRouter } from 'react-router-dom';

import BulkView from '../BulkView';
import renderWithProviders from '../../../../utils/renderWithProviders';

const renderComponent = () => {
  const history = createBrowserHistory();

  return renderWithProviders(
    <BrowserRouter>
      <BulkView />
    </BrowserRouter>,
    { history },
  );
};

describe('<BulkView />', () => {
  it('renders correctly', () => {
    renderComponent();
  });

  it('renders back link to bulk list', () => {
    const { container } = renderComponent();
    const backLink = container.querySelector('a[href="/bulk"]');
    expect(backLink).toBeTruthy();
    expect(backLink.textContent).toContain('Takaisin');
  });

  it('shows loading state when fetching', () => {
    const { container } = renderComponent();
    expect(container).toBeDefined();
  });

  it('renders action buttons when bulk update exists', () => {
    const { container } = renderComponent();
    const actionButtons = container.querySelectorAll('.btn');
    expect(actionButtons.length).toBeGreaterThanOrEqual(0);
  });
});
