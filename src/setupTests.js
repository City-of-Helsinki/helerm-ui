/* eslint-disable no-console */
// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/vitest';

vi.mock('./utils/api.js');

const originalError = console.error.bind(console.error);

console.error = (msg, ...optionalParams) => {
  const msgStr = msg.toString();

  return !msgStr.includes('Could not parse CSS stylesheet') && originalError(msg, ...optionalParams);
};

// Mock the ResizeObserver
const ResizeObserverMock = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Stub the global ResizeObserver
vi.stubGlobal('ResizeObserver', ResizeObserverMock);

import.meta.env.REACT_APP_GIT_VERSION = '123';
import.meta.env.REACT_APP_FEEDBACK_URL = 'https://hel.fi';
import.meta.env.REACT_APP_API_URL = 'https://api.test.com';
import.meta.env.REACT_APP_API_VERSION = 'v1';
import.meta.env.REACT_APP_MATOMO_URL_BASE = 'https://www.test.fi/';
import.meta.env.REACT_APP_MATOMO_SITE_ID = 'test123';
import.meta.env.REACT_APP_MATOMO_SRC_URL = 'test.js';
import.meta.env.REACT_APP_MATOMO_ENABLED = 'false';
import.meta.env.REACT_APP_API_TOKEN_AUTH_AUDIENCE = 'test-audience';

vi.mock('./hooks/useAuth.js', () => ({
  default: vi.fn(() => ({
    authenticated: true,
    user: {
      profile: {
        name: 'Test User',
        email: 'test@example.com',
        given_name: 'Test',
        family_name: 'User',
        sub: 'test-user-123',
      },
    },
    getApiToken: vi.fn(() => 'test-token'),
    login: vi.fn(),
    logout: vi.fn(),
    loggingOut: false,
  })),
}));

vi.mock('hds-react', async () => {
  const actual = await vi.importActual('hds-react');

  return {
    ...actual,
    useApiTokens: vi.fn(() => ({
      getStoredApiTokens: vi.fn(() => [
        null, // error
        {
          [import.meta.env.REACT_APP_API_TOKEN_AUTH_AUDIENCE || 'test-audience']: 'test-token',
        }, // tokens
      ]),
    })),
    useOidcClient: vi.fn(() => ({
      isAuthenticated: vi.fn(() => true),
      getUser: vi.fn(() => ({
        profile: {
          name: 'Test User',
          email: 'test@example.com',
          given_name: 'Test',
          family_name: 'User',
          sub: 'test-user-123',
        },
      })),
      logout: vi.fn(),
      login: vi.fn(),
      getState: vi.fn(() => 'LOGGED_IN'),
    })),
    useSignalListener: vi.fn(() => {}),
    isApiTokensRemovedSignal: vi.fn(() => false),
    isApiTokensUpdatedSignal: vi.fn(() => false),
    getApiTokenFromStorage: vi.fn(() => 'test-token'),

    LoginProvider: ({ children }) => children,
    SessionEndedHandler: ({ children }) => children,
  };
});
