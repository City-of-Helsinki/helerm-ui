import React from 'react';
import { Router } from 'react-router-dom';
import * as mockLogin from 'hds-react';
import { screen } from '@testing-library/react';
import { createBrowserHistory } from 'history';
import userEvent from '@testing-library/user-event';

import Login from '../Login';
import renderWithProviders from '../../../utils/renderWithProviders';

const getUserMock = vitest.fn().mockImplementation(() => ({ profile: { name: 'Test Tester' } }));
const isAuthenticatedMock = vitest.fn().mockImplementation(() => true);
const loginMock = vitest.fn();
const logoutMock = vitest.fn();

vitest.spyOn(mockLogin, 'useOidcClient').mockImplementation(() => ({
  getUser: getUserMock,
  isAuthenticated: isAuthenticatedMock,
  login: loginMock,
  logout: logoutMock,
}));

const renderComponent = (history) =>
  renderWithProviders(
    <Router history={history}>
      <Login />
    </Router>,
    { history },
  );

describe('<Login />', () => {
  it('should render correctly', () => {
    const history = createBrowserHistory();
    const { container } = renderComponent(history);

    expect(container).toMatchSnapshot();
  });

  it('should display user name with link', async () => {
    const history = createBrowserHistory();
    renderComponent(history);

    expect(await screen.findByText(/Test Tester/)).toBeInTheDocument();
    expect(await screen.findByText(/Kirjaudu ulos/)).toBeInTheDocument();
  });

  it('should display given name with family name', async () => {
    vitest.spyOn(mockLogin, 'useOidcClient').mockImplementationOnce(() => ({
      getUser: vitest
        .fn()
        .mockImplementation(() => ({ profile: { given_name: 'Test', family_name: 'Tester', name: undefined } })),
      isAuthenticated: isAuthenticatedMock,
    }));

    const history = createBrowserHistory();
    renderComponent(history);

    expect(await screen.findByText(/Test Tester/)).toBeInTheDocument();
  });

  it('should display just given name', async () => {
    vitest.spyOn(mockLogin, 'useOidcClient').mockImplementationOnce(() => ({
      getUser: vitest
        .fn()
        .mockImplementation(() => ({ profile: { given_name: 'Test', family_name: undefined, name: undefined } })),
      isAuthenticated: isAuthenticatedMock,
    }));

    const history = createBrowserHistory();
    renderComponent(history);

    expect(await screen.findByText(/Test/)).toBeInTheDocument();
  });

  it('should not display user if not authenticated', async () => {
    vitest.spyOn(mockLogin, 'useOidcClient').mockImplementationOnce(() => ({
      getUser: vitest.fn().mockImplementation(() => ({ profile: { name: 'Test Tester' } })),
      isAuthenticated: vitest.fn().mockImplementation(() => false),
    }));

    const history = createBrowserHistory();
    renderComponent(history);

    expect(screen.queryByText(/Test Tester/)).not.toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /Kirjaudu sisään/ })).toBeInTheDocument();
  });

  it('should login', async () => {
    vitest.spyOn(mockLogin, 'useOidcClient').mockImplementationOnce(() => ({
      getUser: getUserMock,
      login: loginMock,
      isAuthenticated: vitest.fn().mockImplementation(() => false),
    }));

    const history = createBrowserHistory();
    renderComponent(history);

    const loginLink = await screen.findByRole('button', { name: /Kirjaudu sisään/ });
    const user = userEvent.setup();

    await user.click(loginLink);

    expect(loginMock).toHaveBeenCalled();
  });

  it('should login', async () => {
    vitest.spyOn(mockLogin, 'useOidcClient').mockImplementationOnce(() => ({
      getUser: getUserMock,
      logout: logoutMock,
      isAuthenticated: isAuthenticatedMock,
    }));

    const history = createBrowserHistory();
    renderComponent(history);

    const logoutLink = await screen.findByRole('button', { name: /Kirjaudu ulos/ });
    const user = userEvent.setup();

    await user.click(logoutLink);

    expect(logoutMock).toHaveBeenCalled();
  });
});
