import { createBrowserHistory } from 'history';
import React from 'react';
import { Router } from 'react-router-dom';
import { screen } from '@testing-library/react';

import SearchFilters from '../SearchFilters';
import { navigationStateFilters } from '../../../../constants';
import attributeRules from '../../../../utils/mocks/attributeRules.json';
import renderWithProviders from '../../../../utils/renderWithProviders';

const baseMocks = {
  attributeTypes: attributeRules,
  isDetailSearch: false,
};

const renderComponent = (mocks = baseMocks) => {
  const history = createBrowserHistory();

  return renderWithProviders(
    <Router history={history}>
      <SearchFilters
        attributeTypes={mocks.attributeTypes}
        isDetailSearch={mocks.isDetailSearch}
        isUser
        filters={navigationStateFilters}
        handleFilterChange={jest.fn()}
      />
    </Router>,
    { history },
  );
};

describe('<SearchFilters />', () => {
  it('renders correctly', () => {
    const { container } = renderComponent();

    expect(container).toMatchSnapshot();
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
