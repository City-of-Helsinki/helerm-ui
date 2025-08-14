import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import SearchInput from '../SearchInput';
import renderWithProviders from '../../../../utils/renderWithProviders';

const renderComponent = (mockFunction = vi.fn()) => {
  return renderWithProviders(
    <BrowserRouter>
      <SearchInput placeholder='' searchInput='' setSearchInput={mockFunction} />
    </BrowserRouter>,
  );
};

describe('<SearchInput />', () => {
  it('renders correctly', () => {
    renderComponent();
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
