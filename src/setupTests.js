/* eslint-disable no-console */
// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/vitest';
// Load generated runtime configuration to be available in tests
require('../public/test-env-config.js');

vi.mock('./utils/api.js');

const originalError = console.error.bind(console.error);

console.error = (msg, ...optionalParams) => {
  const msgStr = msg.toString();

  return !msgStr.includes('Could not parse CSS stylesheet') && originalError(msg, ...optionalParams);
};

// Mock the ResizeObserver
class ResizeObserverMock {
  constructor() {
    this.observe = vi.fn();
    this.unobserve = vi.fn();
    this.disconnect = vi.fn();
  }
}

// Stub the global ResizeObserver
vi.stubGlobal('ResizeObserver', ResizeObserverMock);

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
          [ import.meta.env.REACT_APP_API_TOKEN_AUTH_AUDIENCE || 'test-audience' ]: 'test-token',
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
    useSignalListener: vi.fn(() => { }),
    isApiTokensRemovedSignal: vi.fn(() => false),
    isApiTokensUpdatedSignal: vi.fn(() => false),
    getApiTokenFromStorage: vi.fn(() => 'test-token'),

    LoginProvider: ({ children }) => children,
    SessionEndedHandler: ({ children }) => children,
  };
});
