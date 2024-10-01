import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import SearchFilter from '../SearchFilter';
import { DRAFT, statusFilters } from '../../../../constants';

const baseMocks = {
  value: [],
  options: statusFilters,
};

const renderComponent = (mocks = baseMocks) =>
  render(
    <SearchFilter
      className=''
      placeholder=''
      value={mocks.value}
      options={mocks.options}
      handleChange={vi.fn()}
      multi
      isVisible
    />,
  );

describe('<SearchFilter />', () => {
  it('renders correctly', () => {
    renderComponent();
  });

  it('should show current filter', async () => {
    const { rerender } = renderComponent();

    expect(screen.queryByText(statusFilters[0].label)).not.toBeInTheDocument();

    rerender(
      <SearchFilter
        className=''
        placeholder=''
        value={[DRAFT]}
        options={statusFilters}
        handleChange={vi.fn()}
        multi
        isVisible
      />,
    );

    expect(screen.getByText(statusFilters[0].label)).toBeInTheDocument();
  });

  it('should show message if no options', async () => {
    const mocks = { ...baseMocks, options: [] };

    renderComponent(mocks);

    const user = userEvent.setup();

    await user.click(screen.getByRole('textbox'));

    expect(await screen.findByText('Ei valintoja')).toBeInTheDocument();
  });
});
