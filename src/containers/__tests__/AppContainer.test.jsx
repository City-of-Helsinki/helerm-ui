import React from 'react';
import { createBrowserHistory } from 'history';
import * as mockLogin from 'hds-react';

import * as useAuth from '../../hooks/useAuth';
import renderWithProviders from '../../utils/renderWithProviders';
import AppContainer from '../AppContainer';
import routes from '../../routes';
import storeCreator from '../../store/createStore';
import mockUser from '../../utils/mocks/user.json';
import api from '../../utils/api';

const mockToken = 'mockToken';
const mockApiGet = vi.fn().mockImplementation(() => Promise.resolve({ ok: true, json: () => mockUser }));

vi.spyOn(useAuth, 'default').mockImplementation(() => ({
  user: { profile: { sub: 'user123', name: 'Test Tester' } },
  authenticated: true,
}));
vi.spyOn(mockLogin, 'getApiTokenFromStorage').mockImplementation(() => mockToken);
vi.spyOn(api, 'get').mockImplementation(mockApiGet);

const renderComponent = (history) => {
  const mockState = {};
  const mockStore = storeCreator(history, mockState);
  const mockRoutes = routes(mockStore);

  return renderWithProviders(
    <AppContainer
      history={history}
      routes={mockRoutes}
      store={mockStore}
      dispatchFetchAttributeTypes={vi.fn()}
      dispatchFetchTemplates={vi.fn()}
      dispatchRetrieveUserFromSession={vi.fn()}
    />,
    {
      history,
      store: mockStore,
    },
  );
};

describe('<AppContainer />', () => {
  it('should render correctly', () => {
    const history = createBrowserHistory();

    renderComponent(history);
  });

  it('should authenticate', () => {
    const history = createBrowserHistory();

    renderComponent(history);

    expect(mockApiGet).toHaveBeenCalled();
  });

  it('should not fetch user if not authenticated', () => {
    const storageSpy = vi.spyOn(mockLogin, 'getApiTokenFromStorage').mockImplementationOnce(() => undefined);

    vi.spyOn(useAuth, 'default').mockImplementationOnce(() => ({
      user: undefined,
      authenticated: false,
    }));

    const history = createBrowserHistory();

    renderComponent(history);

    expect(storageSpy).not.toHaveBeenCalled();
  });
});
