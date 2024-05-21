import { createMemoryHistory } from 'history';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import { render } from '@testing-library/react';

import storeCreator from '../../../../store/createStore';
import SearchTerm from '../SearchTerm';

const renderComponent = () => {
  const history = createMemoryHistory();
  const store = storeCreator(history, {});
  const dummyFunction = vi.fn();

  return render(
    <Provider store={store}>
      <Router history={history}>
        <SearchTerm
          attributeValues={{}}
          onAddSearchTerm={dummyFunction}
          onChangeSearchTerm={dummyFunction}
          onRemoveSearchTerm={dummyFunction}
          searchTerm={{
            attribute: 'test',
            equals: false,
            target: 'test',
            value: 'test',
          }}
          showAdd={false}
        />
      </Router>
    </Provider>,
  );
};

describe('<SearchTerm />', () => {
  it('renders without crashing', () => {
    const { getByText } = renderComponent();

    const element = getByText('test');

    expect(element).toBeInTheDocument();
  });
});
