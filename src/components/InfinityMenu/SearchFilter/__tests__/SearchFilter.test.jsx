import React from 'react';
import { render, screen } from '@testing-library/react';

import SearchFilter from '../SearchFilter';
import { DRAFT, statusFilters } from '../../../../constants';

const baseMocks = {
  value: [],
};

const renderComponent = (mocks = baseMocks) =>
  render(
    <SearchFilter
      className=''
      placeholder=''
      value={mocks.value}
      options={statusFilters}
      handleChange={jest.fn()}
      multi
      isVisible
    />,
  );

describe('<SearchFilter />', () => {
  it('renders correctly', () => {
    const { container } = renderComponent();

    expect(container).toMatchSnapshot();
  });

  it('should change value', async () => {
    const { rerender } = renderComponent();

    expect(screen.queryByText(statusFilters[0].label)).not.toBeInTheDocument();

    rerender(
      <SearchFilter
        className=''
        placeholder=''
        value={[DRAFT]}
        options={statusFilters}
        handleChange={jest.fn()}
        multi
        isVisible
      />,
    );

    expect(screen.getByText(statusFilters[0].label)).toBeInTheDocument();
  });
});
