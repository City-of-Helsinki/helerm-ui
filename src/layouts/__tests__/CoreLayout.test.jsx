import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { act, screen } from '@testing-library/react';

import CoreLayout from '../CoreLayout/CoreLayout';
import renderWithProviders from '../../utils/renderWithProviders';

// Mock the Matomo hooks to prevent tracking calls in tests
vi.mock('../../components/Matomo/hooks/useMatomo', () => ({
  default: () => ({
    trackPageView: vi.fn(),
  }),
}));

// Mock navigation thunk to prevent API calls
vi.mock('../../store/reducers/navigation', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    fetchNavigationThunk: vi.fn(() => ({
      type: 'navigation/fetchNavigation/fulfilled',
      payload: { items: [] },
    })),
  };
});

vi.mock('hds-react', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useCookies: () => ({
      getAllConsents: () => ({ matomo: false }),
    }),
    LoginProvider: ({ children }) => <div data-testid='login-provider'>{children}</div>, // eslint-disable-line react/prop-types
    useOidcClient: () => ({
      isAuthenticated: () => false,
      getUser: () => null,
      login: vi.fn(),
      logout: vi.fn(),
    }),
  };
});

const renderComponent = () =>
  renderWithProviders(
    <BrowserRouter>
      <CoreLayout />
    </BrowserRouter>,
  );

describe('<CoreLayout />', () => {
  it('should render correctly with actual Header and Navigation', async () => {
    await act(async () => {
      renderComponent();
    });

    // Test that the main layout elements are present
    expect(screen.getByRole('banner')).toBeInTheDocument(); // header element
    expect(screen.getByRole('main')).toBeInTheDocument(); // main element

    // Test that Header content is rendered
    expect(screen.getByText('Tiedonohjaus')).toBeInTheDocument(); // Site title from Header

    // Test that Navigation is rendered and working
    expect(screen.getByRole('navigation')).toBeInTheDocument(); // nav element
    expect(screen.getByPlaceholderText('Etsi...')).toBeInTheDocument(); // Search input in navigation
    expect(screen.getByText('Suodata tilan mukaan...')).toBeInTheDocument(); // Filter placeholder

    // Test that the core layout structure is correct
    expect(document.querySelector('.core-layout__viewport')).toBeInTheDocument();
    expect(document.querySelector('.core-layout__navigation')).toBeInTheDocument();
    expect(document.querySelector('.helerm-content')).toBeInTheDocument();
  });
});
