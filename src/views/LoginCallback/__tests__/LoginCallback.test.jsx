import React, { useEffect } from 'react';
import { createBrowserHistory } from 'history';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { waitFor } from '@testing-library/react';

import api from '../../../utils/api';
import renderWithProviders from '../../../utils/renderWithProviders';
import LoginCallback from '../LoginCallback';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

const mockNavigate = vi.fn();
const mockUpdateApiTokens = vi.fn();
const mockUser = { profile: { sub: '123' } };

const mockApiGet = vi.fn().mockImplementation(() => Promise.resolve({ ok: true, json: () => mockUser }));
vi.spyOn(api, 'get').mockImplementation(mockApiGet);

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
    getApiTokenFromStorage: vi.fn().mockReturnValue('mock-token'),
  };
});

const renderComponent = (store) => {
  const history = createBrowserHistory();

  const router = createBrowserRouter([{ path: '/', element: <LoginCallback /> }]);

  return renderWithProviders(<RouterProvider router={router} />, { history, store });
};

describe('<LoginCallback />', () => {
  it('calls onSuccess and navigates on successful login', async () => {
    const store = mockStore({});

    renderComponent(store);

    await waitFor(() => {
      expect(store.getActions()).toEqual([
        { type: 'user/initializeLoginCallback/pending', payload: undefined, meta: expect.anything() },
        { type: 'user/setLoginStatus', payload: 'INITIALIZING' },
        { type: 'user/retrieveUserFromSession/pending', payload: undefined, meta: expect.anything() },
        { type: 'user/setLoginStatus', payload: 'INITIALIZING' },
        { type: 'user/initializeLoginCallback/fulfilled', payload: null, meta: expect.anything() },
        { type: 'user/setLoginStatus', payload: 'AUTHORIZED' },
        {
          type: 'user/retrieveUserFromSession/fulfilled',
          payload: {
            firstName: undefined,
            id: mockUser.profile.sub,
            lastName: undefined,
            permissions: [],
          },
          meta: expect.anything(),
        },
      ]);

      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });
});
