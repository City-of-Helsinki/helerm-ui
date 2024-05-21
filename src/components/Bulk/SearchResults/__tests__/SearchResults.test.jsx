import { createMemoryHistory } from 'history';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import { render, screen } from '@testing-library/react';

import storeCreator from '../../../../store/createStore';
import SearchResults from '../SearchResults';

const renderComponent = () => {
  const history = createMemoryHistory();
  const store = storeCreator(history, {});
  const dummyFunction = vi.fn();
  const dummyArray = [];

  return render(
    <Provider store={store}>
      <Router history={history}>
        <SearchResults
          onSelect={dummyFunction}
          onSelectAll={dummyFunction}
          searchResults={dummyArray}
          hits={{ phases: 0, actions: 0, records: 0 }}
        />
      </Router>
    </Provider>,
  );
};

describe('<SearchResult />', () => {
  it('renders without crashing', () => {
    renderComponent();

    expect(screen.getByText('Hakutulos:')).toBeInTheDocument();
  });
});
