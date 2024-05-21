import { createMemoryHistory } from 'history';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import { render, screen } from '@testing-library/react';

import storeCreator from '../../../store/createStore';
import Dropdown from '../Dropdown';

const renderComponent = () => {
  const history = createMemoryHistory();
  const store = storeCreator(history, {});
  const dummyFunction = vi.fn();
  const dummyItems = [{ action: dummyFunction }, { action: dummyFunction }];

  return render(
    <Provider store={store}>
      <Router history={history}>
        <Dropdown items={dummyItems} />
      </Router>
    </Provider>,
  );
};

describe('<Dropdown />', () => {
  it('renders without crashing', () => {
    renderComponent();

    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
