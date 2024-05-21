import { createMemoryHistory } from 'history';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import { render, screen } from '@testing-library/react';

import storeCreator from '../../../store/createStore';
import ClassificationHeader from '../ClassificationHeader';

const renderComponent = () => {
  const history = createMemoryHistory();
  const store = storeCreator(history, {});
  const dummyFunction = vi.fn();

  return render(
    <Provider store={store}>
      <Router history={history}>
        <ClassificationHeader code='test' title='test' createTos={dummyFunction} />
      </Router>
    </Provider>,
  );
};

describe('<ClassificationHeader />', () => {
  it('renders without crashing', () => {
    renderComponent();

    const element = screen.getByRole('heading', { name: /test/i });
    expect(element).toBeInTheDocument();
  });
});
