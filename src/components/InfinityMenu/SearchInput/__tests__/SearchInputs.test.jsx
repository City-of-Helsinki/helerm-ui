import { createBrowserHistory } from 'history';
import { BrowserRouter } from 'react-router-dom';
import { screen } from '@testing-library/react';
import React from 'react';
import userEvent from '@testing-library/user-event';

import SearchInputs, { FILTER_CONDITION_OPTIONS } from '../SearchInputs';
import renderWithProviders from '../../../../utils/renderWithProviders';

const baseMocks = {
  onFilterConditionChange: vi.fn(),
  setSearchInput: vi.fn(),
  searchInputs: [''],
  isDetailSearch: false,
  removeSearchInput: vi.fn(),
};

const renderComponent = (mocks = baseMocks) => {
  const history = createBrowserHistory();

  return renderWithProviders(
    <BrowserRouter>
      <SearchInputs
        headerProps={{}}
        isDetailSearch={mocks.isDetailSearch}
        searchInputs={mocks.searchInputs}
        filterCondition={FILTER_CONDITION_OPTIONS[0].value}
        addSearchInput={vi.fn()}
        setSearchInput={mocks.setSearchInput}
        removeSearchInput={mocks.removeSearchInput}
        onFilterConditionChange={mocks.onFilterConditionChange}
      />
    </BrowserRouter>,
    { history },
  );
};

describe('<SearchInputs />', () => {
  it('renders correctly', () => {
    renderComponent();
  });

  it('should search', async () => {
    const mockSetSeachInput = vi.fn();
    const mocks = { ...baseMocks, setSearchInput: mockSetSeachInput };

    renderComponent(mocks);

    const input = screen.getByRole('searchbox');

    const user = userEvent.setup();

    await user.type(input, 'A');

    expect(mockSetSeachInput).toHaveBeenCalled();
  });

  it('should render multiple inputs', async () => {
    const mockSearchinputs = ['1', '2'];
    const mockRemoveSearchInput = vi.fn();
    const mocks = {
      ...baseMocks,
      isDetailSearch: true,
      searchInputs: mockSearchinputs,
      removeSearchInput: mockRemoveSearchInput,
    };

    renderComponent(mocks);

    const inputs = screen.getAllByRole('searchbox');

    expect(inputs).toHaveLength(2);

    const removeInputButton = screen.getAllByTitle('Poista hakuehto')[0];

    const user = userEvent.setup();

    await user.click(removeInputButton);

    expect(mockRemoveSearchInput).toHaveBeenCalled();
  });
});
