import { createMemoryHistory } from 'history';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { screen } from '@testing-library/react';

import storeCreator from '../../../../store/createStore';
import SearchResults from '../SearchResults';
import renderWithProviders from '../../../../utils/renderWithProviders';

const renderComponent = () => {
  const history = createMemoryHistory();
  const store = storeCreator(history, {});
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
    { history, store },
  );
};

describe('<SearchResult />', () => {
  it('renders without crashing', () => {
    renderComponent();

    expect(screen.getByText('Hakutulos:')).toBeInTheDocument();
  });
});
