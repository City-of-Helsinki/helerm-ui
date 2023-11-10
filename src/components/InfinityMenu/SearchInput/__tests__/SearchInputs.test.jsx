import { createBrowserHistory } from 'history';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import { render } from '@testing-library/react';
import React from 'react';

import storeCreator from '../../../../store/createStore';
import SearchInputs, { FILTER_CONDITION_OPTIONS } from '../SearchInputs';

const baseMocks = {
  onFilterConditionChange: jest.fn(),
};

const renderComponent = (mocks = baseMocks) => {
  const history = createBrowserHistory();
  const store = storeCreator(history, {});

  return render(
    <Provider store={store}>
      <Router history={history}>
        <SearchInputs
          headerProps={{}}
          isDetailSearch
          searchInputs={['']}
          filterCondition={FILTER_CONDITION_OPTIONS[0].value}
          addSearchInput={jest.fn()}
          setSearchInput={jest.fn()}
          removeSearchInput={jest.fn()}
          onFilterConditionChange={mocks.onFilterConditionChange}
        />
      </Router>
    </Provider>,
  );
};

describe('<SearchInputs />', () => {
  it('renders correctly', () => {
    const { container } = renderComponent();

    expect(container).toMatchSnapshot();
  });
});
