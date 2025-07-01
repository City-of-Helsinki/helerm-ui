import { createBrowserHistory } from 'history';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { screen } from '@testing-library/react';

import SearchFilters from '../SearchFilters';
import { navigationStateFilters } from '../../../../constants';
import { attributeTypes } from '../../../../utils/__mocks__/mockHelpers';
import renderWithProviders from '../../../../utils/renderWithProviders';

const baseMocks = {
  attributeTypes: attributeTypes,
  isDetailSearch: false,
};

const renderComponent = (mocks = baseMocks) => {
  const history = createBrowserHistory();

  return renderWithProviders(
    <BrowserRouter>
      <SearchFilters
        attributeTypes={mocks.attributeTypes}
        isDetailSearch={mocks.isDetailSearch}
        isUser
        filters={navigationStateFilters}
        handleFilterChange={vi.fn()}
      />
    </BrowserRouter>,
    { history },
  );
};

describe('<SearchFilters />', () => {
  it('renders correctly', () => {
    renderComponent();
  });

  it('should render two filters if detail search', () => {
    const mockAttributeTypes = {
      ...baseMocks.attributeTypes,
      RetentionPeriod: { ...baseMocks.attributeTypes.RetentionPeriod, values: [] },
    };

    const mocks = { ...baseMocks, attributeTypes: mockAttributeTypes, isDetailSearch: true };

    renderComponent(mocks);

    expect(screen.getByText('Suodata säilytysajan mukaan')).toBeInTheDocument();
  });
});
