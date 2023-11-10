import { createBrowserHistory } from 'history';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import { render } from '@testing-library/react';

import SearchFilters from '../SearchFilters';
import { navigationStateFilters } from '../../../../constants';
import storeCreator from '../../../../store/createStore';

const renderComponent = () => {
  const history = createBrowserHistory();
  const store = storeCreator(history, {});

  return render(
    <Provider store={store}>
      <Router history={history}>
        <SearchFilters
          attributeTypes={{}}
          isDetailSearch={false}
          isUser
          filters={navigationStateFilters}
          handleFilterChange={jest.fn()}
        />
        ,
      </Router>
    </Provider>,
  );
};

describe('<SearchFilters />', () => {
  it('renders correctly', () => {
    const { container } = renderComponent();

    expect(container).toMatchSnapshot();
  });
});
