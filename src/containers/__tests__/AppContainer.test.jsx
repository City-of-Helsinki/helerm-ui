/* eslint-disable no-undef */
import { webcrypto } from 'crypto';

import { waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as mockLogin from 'hds-react';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { screen as shadowScreen } from 'shadow-dom-testing-library';

import * as useAuth from '../../hooks/useAuth';
import routes from '../../routes';
import { attributeTypes, template, user } from '../../utils/__mocks__/mockHelpers';
import api from '../../utils/api';
import renderWithProviders, { storeDefaultState } from '../../utils/renderWithProviders';
import AppContainer from '../AppContainer';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

const clearAllCookies = () =>
  document.cookie.split(';').forEach((c) => {
    document.cookie = c.trim().split('=')[0] + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC;';
  });

const realDateNow = Date.now.bind(global.Date);

beforeAll(() => {
  const dateNowStub = vi.fn(() => 1530518207007);

  global.Date.now = dateNowStub;
});

beforeEach(() => {
  vi.clearAllMocks();

  Object.defineProperties(global, {
    crypto: { value: webcrypto, writable: true },
  });

  clearAllCookies();
});

afterAll(() => {
  global.Date.now = realDateNow;
});

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

const acceptAllCookieText =
  'helfi-cookie-consents=%7B%22groups%22%3A%7B%22tunnistamo%22%3A%7B%22checksum%22%3A%22435f7456%22%2C%22timestamp%22%3A1530518207007%7D%2C%22shared%22%3A%7B%22checksum%22%3A%2267ae1bd2%22%2C%22timestamp%22%3A1530518207007%7D%2C%22statistics%22%3A%7B%22checksum%22%3A%2275cc5cc3%22%2C%22timestamp%22%3A1530518207007%7D%7D%7D';
const acceptOnlyNecessaryCookieText =
  'helfi-cookie-consents=%7B%22groups%22%3A%7B%22tunnistamo%22%3A%7B%22checksum%22%3A%22435f7456%22%2C%22timestamp%22%3A1530518207007%7D%2C%22shared%22%3A%7B%22checksum%22%3A%2267ae1bd2%22%2C%22timestamp%22%3A1530518207007%7D%7D%7D';

const findCookieConsentModal = async () => {
  const regions = await shadowScreen.findAllByShadowRole('region');

  const container = regions.find((region) => region.getAttribute('id') === 'hds-cc');

  return container;
};

const waitCookieConsentModalToBeVisible = async () => {
  const cookieConsentModal = await findCookieConsentModal();
  await within(cookieConsentModal).findByRole('heading', {
    name: 'Tiedonohjaus käyttää evästeitä',
  });

  return cookieConsentModal;
};

const waitCookieConsentModalToBeHidden = async () => {
  const regions = shadowScreen.queryAllByRole('region');
  const container = regions.find((region) => region.getAttribute('id') === 'hds-cc');

  await waitFor(() => expect(container).not.toBeDefined());
};

// eslint-disable-next-line consistent-return
const findCookieConsentModalElement = async (cookieConsentModal, key) => {
  switch (key) {
    case 'acceptAllButton':
      return within(cookieConsentModal).findByRole('button', {
        name: 'Hyväksy kaikki evästeet',
      });
    case 'acceptOnlyNecessaryButton':
      return within(cookieConsentModal).findByRole('button', {
        name: 'Hyväksy vain välttämättömät evästeet',
      });
  }
};

describe('<AppContainer />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show cookie consent modal if consent is not saved to cookie', async () => {
    const store = mockStore(storeDefaultState);

    renderComponent(store);

    await waitCookieConsentModalToBeVisible();
  });

  it('should store consent to cookie when clicking accept all button', async () => {
    const user = userEvent.setup();

    const store = mockStore(storeDefaultState);

    renderComponent(store);

    const cookieConsentModal = await waitCookieConsentModalToBeVisible();
    const acceptAllButton = await findCookieConsentModalElement(cookieConsentModal, 'acceptAllButton');
    await user.click(acceptAllButton);

    expect(document.cookie).toEqual(expect.stringContaining(acceptAllCookieText));
    await waitCookieConsentModalToBeHidden();
  });

  it('should store consent to cookie when clicking accept only necessary button', async () => {
    const user = userEvent.setup();

    const store = mockStore(storeDefaultState);

    renderComponent(store);

    const cookieConsentModal = await waitCookieConsentModalToBeVisible();
    const acceptOnlyNecessaryButton = await findCookieConsentModalElement(
      cookieConsentModal,
      'acceptOnlyNecessaryButton',
    );

    await user.click(acceptOnlyNecessaryButton);

    expect(document.cookie).toEqual(expect.stringContaining(acceptOnlyNecessaryCookieText));
    await waitCookieConsentModalToBeHidden();
  });

  it('should not show cookie consent modal if consent is saved', async () => {
    document.cookie = acceptAllCookieText;

    const store = mockStore(storeDefaultState);

    renderComponent(store);

    await waitCookieConsentModalToBeHidden();
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
