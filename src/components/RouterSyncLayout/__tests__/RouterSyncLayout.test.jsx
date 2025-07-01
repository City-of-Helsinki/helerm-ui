import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import * as ReactRouterDom from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import RouterSyncLayout from '../RouterSyncLayout';
import renderWithProviders, { storeDefaultState } from '../../../utils/renderWithProviders';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    Outlet: vi.fn(() => <div data-testid='outlet-mock'>Outlet Mock</div>),
  };
});

const renderComponent = (props = {}, storeOverride) => {
  const store = storeOverride ?? mockStore(storeDefaultState);

  return renderWithProviders(
    <BrowserRouter>
      <RouterSyncLayout {...props} />
    </BrowserRouter>,
    { store },
  );
};

describe('<RouterSyncLayout />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without errors', () => {
    renderComponent();
  });

  it('renders the RouterSync component', async () => {
    const store = mockStore(storeDefaultState);

    renderComponent(null, store);

    const expected = [
      {
        type: 'router/locationChange',
        payload: { location: expect.anything(Array), action: 'POP' },
      },
    ];

    waitFor(() => {
      expect(store.getActions()).toEqual(expected);
    });
  });

  it('renders an Outlet when no children are provided', () => {
    renderComponent();
    expect(ReactRouterDom.Outlet).toHaveBeenCalled();
    expect(screen.getByTestId('outlet-mock')).toBeTruthy();
  });

  it('renders children instead of Outlet when children are provided', () => {
    renderComponent({ children: <div data-testid='child-element'>Child Content</div> });
    expect(ReactRouterDom.Outlet).not.toHaveBeenCalled();
    expect(screen.getByTestId('child-element')).toBeTruthy();
    expect(screen.queryByTestId('outlet-mock')).toBeFalsy();
  });
});
