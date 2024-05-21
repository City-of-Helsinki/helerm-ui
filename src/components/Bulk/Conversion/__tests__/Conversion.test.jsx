import { createMemoryHistory } from 'history';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import { render, screen } from '@testing-library/react';

import storeCreator from '../../../../store/createStore';
import Conversion from '../Conversion';

const renderComponent = () => {
  const history = createMemoryHistory();
  const store = storeCreator(history, {});
  const dummyFunction = vi.fn();

  return render(
    <Provider store={store}>
      <Router history={history}>
        <Conversion disabled={false} onConvert={dummyFunction} attributeTypes={{}} />
      </Router>
    </Provider>,
  );
};

describe('<Conversion />', () => {
  it('renders without crashing', () => {
    renderComponent();

    expect(screen.getByText('Kohdistus')).toBeInTheDocument();
  });
});
