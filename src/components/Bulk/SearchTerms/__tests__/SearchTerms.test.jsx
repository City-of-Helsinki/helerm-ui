import { createMemoryHistory } from 'history';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import { render, screen } from '@testing-library/react';

import storeCreator from '../../../../store/createStore';
import SearchTerms from '../SearchTerms';

const renderComponent = () => {
  const history = createMemoryHistory();
  const store = storeCreator(history, {});
  const dummyFunction = vi.fn();

  return render(
    <Provider store={store}>
      <Router history={history}>
        <SearchTerms
          attributeValues={{}}
          onSearch={dummyFunction}
          resetSearchResults={dummyFunction}
          searchTerms={[]}
        />
      </Router>
    </Provider>,
  );
};

describe('<SearchTerms />', () => {
  it('renders without crashing', () => {
    renderComponent();

    expect(screen.getByText('Rajaa muutettavat kohteet')).toBeInTheDocument();
  });
});
