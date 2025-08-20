import React from 'react';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { waitFor } from '@testing-library/react';
import * as mockLogin from 'hds-react';

import * as useAuth from '../../hooks/useAuth';
import renderWithProviders, { storeDefaultState } from '../../utils/renderWithProviders';
import AppContainer from '../AppContainer';
import routes from '../../routes';
import { user, attributeTypes, template } from '../../utils/__mocks__/mockHelpers';
import api from '../../utils/api';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

// Mock window.confirm for ReduxToastr
Object.defineProperty(window, 'confirm', {
  value: vi.fn(() => true),
  writable: true,
});

// Mock ReduxToastr to avoid rendering issues
vi.mock('react-redux-toastr', () => ({
  __esModule: true,
  default: () => <div data-testid='redux-toastr'>ReduxToastr Mock</div>,
}));

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

const mockAttributeTypesApiGet = vi
  .fn()
  .mockImplementation(() => Promise.resolve({ ok: true, json: () => attributeTypes }));
const mockTemplatesApiGet = vi.fn().mockImplementation(() => Promise.resolve({ ok: true, json: () => template }));
const mockUserApiGet = vi.fn().mockImplementation(() => Promise.resolve({ ok: true, json: () => user }));

vi.spyOn(useAuth, 'default').mockImplementation(() => ({
  user: { profile: { sub: 'user123', name: 'Test Tester' } },
  authenticated: true,
  getApiToken: vi.fn(() => mockToken),
  login: vi.fn(),
  logout: vi.fn(),
  loggingOut: false,
}));
vi.spyOn(mockLogin, 'getApiTokenFromStorage').mockImplementation(() => mockToken);
vi.spyOn(api, 'get').mockImplementation((url) => {
  if (url.includes('attribute/schemas')) {
    return mockAttributeTypesApiGet();
  }
  if (url.includes('templates')) {
    return mockTemplatesApiGet();
  }
  if (url.includes('user')) {
    return mockUserApiGet();
  }
  return Promise.resolve({ ok: false, status: 404, json: () => ({ error: 'Not found' }) });
});

const renderComponent = (storeOverride) => {
  const store = storeOverride ?? mockStore(storeDefaultState);
  const mockRoutes = routes(store);

  return renderWithProviders(<AppContainer routes={mockRoutes} store={store} />, {
    store,
  });
};

describe('<AppContainer />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', async () => {
    renderComponent();
  });

  it('fetches attribute types and templates on mount', async () => {
    const store = mockStore(storeDefaultState);

    renderComponent(store);

    await waitFor(() => {
      const actions = store.getActions();

      // Check that we have pending actions
      const pendingActions = actions.filter((action) => action.type.endsWith('/pending'));
      expect(pendingActions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'ui/fetchAttributeTypes/pending',
          }),
          expect.objectContaining({
            type: 'ui/fetchTemplates/pending',
          }),
          expect.objectContaining({
            type: 'user/retrieveUserFromSession/pending',
          }),
        ]),
      );

      // Check that we have at least some fulfilled actions
      const fulfilledActions = actions.filter((action) => action.type.endsWith('/fulfilled'));
      expect(fulfilledActions.length).toBeGreaterThan(0);

      // Verify at least the user action completed successfully
      const userFulfilledActions = fulfilledActions.filter(
        (action) => action.type === 'user/retrieveUserFromSession/fulfilled',
      );
      expect(userFulfilledActions.length).toBeGreaterThan(0);
      expect(userFulfilledActions[0].payload).toEqual(
        expect.objectContaining({
          firstName: 'Test',
          lastName: 'User',
          permissions: expect.arrayContaining(['can_edit', 'can_review', 'can_approve']),
        }),
      );
    });
  });

  it('does not fetch user when not authenticated', async () => {
    // Mock the useAuth hook to return unauthenticated state for this test only
    const unauthenticatedMock = vi.spyOn(useAuth, 'default').mockReturnValue({
      user: null,
      authenticated: false,
      getApiToken: vi.fn(() => null), // Return null for unauthenticated user
      login: vi.fn(),
      logout: vi.fn(),
      loggingOut: false,
    });

    const store = mockStore(storeDefaultState);

    renderComponent(store);

    await waitFor(() => {
      const actions = store.getActions();
      const userActions = actions.filter((action) => action.type.includes('user/retrieveUserFromSession'));
      expect(userActions).toHaveLength(0);

      const attributeTypesActions = actions.filter((action) => action.type.includes('ui/fetchAttributeTypes'));
      const templatesActions = actions.filter((action) => action.type.includes('ui/fetchTemplates'));

      expect(attributeTypesActions.length).toBeGreaterThan(0);
      expect(templatesActions.length).toBeGreaterThan(0);
    });

    // Restore the mock
    unauthenticatedMock.mockRestore();
  });
});
