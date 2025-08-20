import React, { useEffect } from 'react';
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
const mockUser = { profile: { sub: '123' } };

const mockApiGet = vi.fn().mockImplementation(() => Promise.resolve({ ok: true, json: () => mockUser }));
vi.spyOn(api, 'get').mockImplementation(mockApiGet);

vi.mock('../../hooks/useAuth', () => ({
  __esModule: true,
  default: () => ({
    getApiToken: () => 'mock-token',
  }),
}));

vi.mock('react-router-dom', async () => {
  const mod = await vi.importActual('react-router-dom');

  return {
    ...mod,
    useNavigate: () => mockNavigate,
  };
});

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
  const router = createBrowserRouter([{ path: '/', element: <LoginCallback /> }]);

  return renderWithProviders(<RouterProvider router={router} />, { store });
};

describe('<LoginCallback />', () => {
  it('calls onSuccess and navigates on successful login', async () => {
    const store = mockStore({});

    renderComponent(store);

    await waitFor(() => {
      const actions = store.getActions();

      // Check that all expected actions are dispatched (order may vary due to async nature)
      expect(actions).toHaveLength(7);

      // Check that all required action types are present
      const actionTypes = actions.map((action) => action.type);
      expect(actionTypes).toContain('user/initializeLoginCallback/pending');
      expect(actionTypes).toContain('user/retrieveUserFromSession/pending');
      expect(actionTypes).toContain('user/initializeLoginCallback/fulfilled');
      expect(actionTypes).toContain('user/retrieveUserFromSession/fulfilled');

      // Check that correct login statuses are set
      const loginStatusActions = actions.filter((action) => action.type === 'user/setLoginStatus');
      expect(loginStatusActions).toHaveLength(3);
      expect(loginStatusActions.map((action) => action.payload)).toContain('INITIALIZING');
      expect(loginStatusActions.map((action) => action.payload)).toContain('AUTHORIZED');

      // Check the final user data
      const userAction = actions.find((action) => action.type === 'user/retrieveUserFromSession/fulfilled');
      expect(userAction.payload).toEqual({
        firstName: undefined,
        id: mockUser.profile.sub,
        lastName: undefined,
        permissions: [],
      });

      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });
});
