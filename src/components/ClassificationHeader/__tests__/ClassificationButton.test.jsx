import { createMemoryHistory } from 'history';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import { render, screen } from '@testing-library/react';

import storeCreator from '../../../store/createStore';
import ClassificationButton from '../ClassificationButton';

const renderComponent = () => {
  const history = createMemoryHistory();
  const store = storeCreator(history, {});
  const dummyFunction = vi.fn();

  return render(
    <Provider store={store}>
      <Router history={history}>
        <ClassificationButton label='test' action={dummyFunction} />
      </Router>
    </Provider>,
  );
};

describe('<ClassificationButton />', () => {
  it('renders without crashing', () => {
    renderComponent();

    const element = screen.getByRole('button', { name: /test/i });

    expect(element).toBeInTheDocument();
  });
});
