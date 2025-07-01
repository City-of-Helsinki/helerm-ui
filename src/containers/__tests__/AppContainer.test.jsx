import React from 'react';
import * as mockLogin from 'hds-react';

import * as useAuth from '../../hooks/useAuth';
import renderWithProviders from '../../utils/renderWithProviders';
import AppContainer from '../AppContainer';
import routes from '../../routes';
import storeCreator from '../../store/createStore';
import { user } from '../../utils/__mocks__/mockHelpers';
import api from '../../utils/api';

vi.mock('../../components/RouterSync/RouterSync', () => ({
  default: () => <div data-testid='mocked-router-sync'>RouterSync Mock</div>,
}));

vi.mock('../../components/RouterSyncLayout/RouterSyncLayout', () => ({
  default: ({ children }) => (
    <div data-testid='mocked-router-sync-layout'>
      Router Sync Layout Mock
      {children}
    </div>
  ),
}));

const mockToken = 'mockToken';
const mockApiGet = vi.fn().mockImplementation(() => Promise.resolve({ ok: true, json: () => user }));

vi.spyOn(useAuth, 'default').mockImplementation(() => ({
  user: { profile: { sub: 'user123', name: 'Test Tester' } },
  authenticated: true,
}));
vi.spyOn(mockLogin, 'getApiTokenFromStorage').mockImplementation(() => mockToken);
vi.spyOn(api, 'get').mockImplementation(mockApiGet);

const renderComponent = () => {
  const mockState = {};
  const mockStore = storeCreator(mockState);
  const mockRoutes = routes(mockStore);

  return renderWithProviders(<AppContainer routes={mockRoutes} store={mockStore} />, {
    store: mockStore,
  });
};

describe('<AppContainer />', () => {
  it('should render correctly', () => {
    renderComponent();
  });

  it('should authenticate', () => {
    renderComponent();

    expect(mockApiGet).toHaveBeenCalled();
  });

  it('should not fetch user if not authenticated', () => {
    renderComponent();

    const storageSpy = vi.spyOn(mockLogin, 'getApiTokenFromStorage').mockImplementationOnce(() => undefined);

    vi.spyOn(useAuth, 'default').mockImplementationOnce(() => ({
      user: undefined,
      authenticated: false,
    }));

    expect(storageSpy).not.toHaveBeenCalled();
  });
});
