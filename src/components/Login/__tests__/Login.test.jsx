import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as useAuth from '../../../hooks/useAuth';
import Login from '../Login';
import renderWithProviders from '../../../utils/renderWithProviders';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

vi.mock('../../../store/reducers/user', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    login: vi.fn().mockReturnValue({ type: 'user/login' }),
    logout: vi.fn().mockReturnValue({ type: 'user/logout' }),
  };
});

const loginMock = vi.fn();
const logoutMock = vi.fn();

const mockName = 'Test Tester';

vi.spyOn(useAuth, 'default').mockImplementation(() => ({
  user: { profile: { sub: 'user123', name: mockName } },
  authenticated: true,
  login: loginMock,
  logout: logoutMock,
}));

const renderComponent = (storeOverride) => {
  const store = storeOverride ?? mockStore({});

  return renderWithProviders(
    <BrowserRouter>
      <Login />
    </BrowserRouter>,
    { store },
  );
};

describe('<Login />', () => {
  it('should render correctly', () => {
    renderComponent();
  });

  it('should display user name with link', async () => {
    renderComponent();

    expect(await screen.findByText(/Test Tester/)).toBeInTheDocument();
    expect(await screen.findByText(/Kirjaudu ulos/)).toBeInTheDocument();
  });

  it('should display just given name', async () => {
    vi.spyOn(useAuth, 'default').mockImplementationOnce(() => ({
      user: { profile: { given_name: 'Test', family_name: undefined, name: undefined } },
      authenticated: true,
    }));

    renderComponent();

    expect(await screen.findByText(/Test/)).toBeInTheDocument();
  });

  it('should not display user if not authenticated', async () => {
    vi.spyOn(useAuth, 'default').mockImplementationOnce(() => ({
      user: { profile: { name: mockName } },
      authenticated: false,
    }));

    renderComponent();

    expect(screen.queryByText(/Test Tester/)).not.toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /Kirjaudu sisään/ })).toBeInTheDocument();
  });

  it('should login', async () => {
    vi.spyOn(useAuth, 'default').mockImplementationOnce(() => ({
      user: { profile: { sub: 'user123', name: mockName } },
      login: loginMock,
      authenticated: false,
    }));

    const store = mockStore({});

    renderComponent(store);

    const loginLink = await screen.findByRole('button', { name: /Kirjaudu sisään/ });
    const user = userEvent.setup();

    await user.click(loginLink);

    waitFor(() => {
      expect(loginMock).toHaveBeenCalled();

      expect(store.getActions()).toEqual([]);
    });
  });

  it('should logout', async () => {
    vi.spyOn(useAuth, 'default').mockImplementationOnce(() => ({
      user: { profile: { sub: 'user123', name: mockName } },
      logout: logoutMock,
      authenticated: true,
    }));

    const store = mockStore({});

    renderComponent(store);

    const logoutLink = await screen.findByRole('button', { name: /Kirjaudu ulos/ });
    const user = userEvent.setup();

    await user.click(logoutLink);

    const expectedActions = [
      {
        type: 'user/logout/pending',
        payload: undefined,
        meta: expect.anything(),
      },
      { type: 'user/setLoginStatus', payload: 'NONE' },
      {
        type: 'user/logout/fulfilled',
        payload: null,
        meta: expect.anything(),
      },
    ];

    waitFor(() => {
      expect(logoutMock).toHaveBeenCalled();

      expect(store.getActions()).toEqual(expectedActions);
    });
  });
});
