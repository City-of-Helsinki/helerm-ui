import { createBrowserHistory } from 'history';
import React from 'react';
import { Router } from 'react-router-dom';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import SearchInput from '../SearchInput';
import renderWithProviders from '../../../../utils/renderWithProviders';

const renderComponent = (mockFunction = vi.fn()) => {
  const history = createBrowserHistory();

  return renderWithProviders(
    <Router history={history}>
      <SearchInput placeholder='' searchInput='' setSearchInput={mockFunction} />
    </Router>,
    { history },
  );
};

describe('<SearchInput />', () => {
  it('renders correctly', () => {
    const { container } = renderComponent();

    expect(container).toMatchSnapshot();
  });

  it('triggers setSearchInput', async () => {
    const mockSetSearchInput = vi.fn();

    renderComponent(mockSetSearchInput);

    const user = userEvent.setup();
    const input = screen.getByRole('searchbox');

    await user.type(input, 'Test');

    expect(mockSetSearchInput).toHaveBeenCalled();
  });
});
