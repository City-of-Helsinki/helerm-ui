import React, { useEffect } from 'react';
import { createBrowserHistory } from 'history';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { waitFor } from '@testing-library/react';

import renderWithProviders from '../../../utils/renderWithProviders';
import LoginCallback from '../LoginCallback';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

const mockNavigate = vi.fn();
const mockUpdateApiTokens = vi.fn();
const mockUser = { profile: { sub: '123' } };

vi.mock('react-router-dom', async () => {
  const mod = await vi.importActual('react-router-dom');

  return {
    ...mod,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../hooks/useUpdateApiTokens', () => ({
  __esModule: true,
  default: () => ({
    updateApiTokens: mockUpdateApiTokens,
  }),
}));

vi.mock('hds-react', async () => {
  const mod = await vi.importActual('hds-react');

  return {
    ...mod,
    // eslint-disable-next-line react/prop-types
    LoginCallbackHandler: ({ onSuccess, children }) => {
      useEffect(() => {
        onSuccess(mockUser);
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);

      return <div>{children}</div>;
    },
  };
});

const renderComponent = (propOverrides) => {
  const history = createBrowserHistory();

  const props = {
    handleCallbackInitialize: vi.fn(),
    retrieveUserFromSession: vi.fn(),
    handleCallbackError: vi.fn(),
    ...propOverrides,
  };

  const store = mockStore({});

  const router = createBrowserRouter([{ path: '/', element: <LoginCallback {...props} /> }]);

  return renderWithProviders(<RouterProvider router={router} />, { history, store });
};

describe('<LoginCallback />', () => {
  it('calls onSuccess and navigates on successful login', async () => {
    const handleCallbackInitialize = vi.fn();
    const retrieveUserFromSession = vi.fn();

    renderComponent({
      handleCallbackInitialize,
      retrieveUserFromSession,
    });

    await waitFor(() => {
      expect(handleCallbackInitialize).toHaveBeenCalled();
      expect(mockUpdateApiTokens).toHaveBeenCalled();
      expect(retrieveUserFromSession).toHaveBeenCalledWith('123');
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });
});
