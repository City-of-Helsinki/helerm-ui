import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { screen } from '@testing-library/react';
import { createBrowserHistory } from 'history';
import userEvent from '@testing-library/user-event';

import * as useAuth from '../../../hooks/useAuth';
import LoginContainer from '../LoginContainer';
import renderWithProviders from '../../../utils/renderWithProviders';

const loginMock = vitest.fn();
const logoutMock = vitest.fn();

const mockName = 'Test Tester';

vitest.spyOn(useAuth, 'default').mockImplementation(() => ({
  user: { profile: { sub: 'user123', name: mockName } },
  authenticated: true,
  login: loginMock,
  logout: logoutMock,
}));

const renderComponent = (history) =>
  renderWithProviders(
    <BrowserRouter>
      <LoginContainer />
    </BrowserRouter>,
    { history },
  );

describe('<Login />', () => {
  it('should render correctly', () => {
    const history = createBrowserHistory();

    renderComponent(history);
  });

  it('should display user name with link', async () => {
    const history = createBrowserHistory();
    renderComponent(history);

    expect(await screen.findByText(/Test Tester/)).toBeInTheDocument();
    expect(await screen.findByText(/Kirjaudu ulos/)).toBeInTheDocument();
  });

  it('should display given name with family name', async () => {
    vitest.spyOn(useAuth, 'default').mockImplementationOnce(() => ({
      user: { profile: { given_name: 'Test', family_name: 'Tester', name: undefined } },
      authenticated: true,
    }));

    const history = createBrowserHistory();
    renderComponent(history);

    expect(await screen.findByText(/Test Tester/)).toBeInTheDocument();
  });

  it('should display just given name', async () => {
    vitest.spyOn(useAuth, 'default').mockImplementationOnce(() => ({
      user: { profile: { given_name: 'Test', family_name: undefined, name: undefined } },
      authenticated: true,
    }));

    const history = createBrowserHistory();
    renderComponent(history);

    expect(await screen.findByText(/Test/)).toBeInTheDocument();
  });

  it('should not display user if not authenticated', async () => {
    vitest.spyOn(useAuth, 'default').mockImplementationOnce(() => ({
      user: { profile: { name: mockName } },
      authenticated: false,
    }));

    const history = createBrowserHistory();
    renderComponent(history);

    expect(screen.queryByText(/Test Tester/)).not.toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /Kirjaudu sisään/ })).toBeInTheDocument();
  });

  it('should login', async () => {
    vitest.spyOn(useAuth, 'default').mockImplementationOnce(() => ({
      user: { profile: { sub: 'user123', name: mockName } },
      login: loginMock,
      authenticated: false,
    }));

    const history = createBrowserHistory();
    renderComponent(history);

    const loginLink = await screen.findByRole('button', { name: /Kirjaudu sisään/ });
    const user = userEvent.setup();

    await user.click(loginLink);

    expect(loginMock).toHaveBeenCalled();
  });

  it('should login', async () => {
    vitest.spyOn(useAuth, 'default').mockImplementationOnce(() => ({
      user: { profile: { sub: 'user123', name: mockName } },
      logout: logoutMock,
      authenticated: true,
    }));

    const history = createBrowserHistory();
    renderComponent(history);

    const logoutLink = await screen.findByRole('button', { name: /Kirjaudu ulos/ });
    const user = userEvent.setup();

    await user.click(logoutLink);

    expect(logoutMock).toHaveBeenCalled();
  });
});
