import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import SearchResults from '../SearchResults';
import renderWithProviders from '../../../../utils/renderWithProviders';

const renderComponent = () => {
  const dummyFunction = vi.fn();
  const dummyArray = [];

  return renderWithProviders(
    <BrowserRouter>
      <SearchResults
        onSelect={dummyFunction}
        onSelectAll={dummyFunction}
        searchResults={dummyArray}
        hits={{ phases: 0, actions: 0, records: 0 }}
      />
    </BrowserRouter>,
  );
};

describe('<SearchResult />', () => {
  it('renders without crashing', () => {
    renderComponent();
  });
});
