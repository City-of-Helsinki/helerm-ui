import { createBrowserHistory } from 'history';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import storeCreator from '../../../../store/createStore';
import SearchInput from '../SearchInput';

const renderComponent = (mockFunction = jest.fn()) => {
  const history = createBrowserHistory();
  const store = storeCreator(history, {});

  return render(
    <Provider store={store}>
      <Router history={history}>
        <SearchInput placeholder='' searchInput='' setSearchInput={mockFunction} />
      </Router>
    </Provider>,
  );
};

describe('<SearchInput />', () => {
  it('renders correctly', () => {
    const { container } = renderComponent();

    expect(container).toMatchSnapshot();
  });

  it('triggers setSearchInput', async () => {
    const mockSetSearchInput = jest.fn();

    renderComponent(mockSetSearchInput);

    const user = userEvent.setup();
    const input = screen.getByRole('searchbox');

    await user.type(input, 'Test');

    expect(mockSetSearchInput).toHaveBeenCalled();
  });
});
