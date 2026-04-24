import { BrowserRouter } from 'react-router-dom';
import { screen, waitFor } from '@testing-library/react';

import ViewInfo from '../ViewInfo';
import renderWithProviders from '../../../utils/renderWithProviders';

const renderComponent = () => {
  return renderWithProviders(
    <BrowserRouter>
      <ViewInfo />
    </BrowserRouter>,
  );
};

describe('<ViewInfo />', () => {
  it('renders correctly', () => {
    renderComponent();
  });

  it('adds body class on mount', () => {
    renderComponent();
    expect(document.body.className).toContain('info-view');
  });

  it('removes body class on unmount', async () => {
    renderComponent();

    const { unmount } = renderComponent();

    unmount();

    await waitFor(() => expect(document.body.className).not.toContain('info-view'));
  });

  it('renders the info content heading from markdown', () => {
    renderComponent();

    expect(screen.getByRole('heading', { name: /tietoa palvelusta/i })).toBeInTheDocument();
  });

  it('renders markdown content as HTML elements', () => {
    const { container } = renderComponent();

    expect(container.querySelector('h1')).toBeInTheDocument();
    expect(container.querySelector('p')).toBeInTheDocument();
  });
});
