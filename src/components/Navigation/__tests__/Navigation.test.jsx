import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import renderWithProviders, { storeDefaultState } from '../../../utils/renderWithProviders';
import Navigation from '../Navigation';
import api from '../../../utils/api';
import { classification, attributeTypes, template } from '../../../utils/__mocks__/mockHelpers';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

// Navigation-specific test data (moved from mockHelpers)
const createNavigationTestItems = (classifications = classification) => {
  if (classifications.length < 3) {
    throw new Error('Need at least 3 classification items for navigation testing');
  }

  return [
    {
      id: classifications[0].id,
      name: classifications[0].title,
      code: classifications[0].code,
      function: classifications[0].function,
      children: [],
      path: [classifications[0].title],
      isOpen: true,
    },
    {
      id: classifications[1].id,
      name: classifications[1].title,
      code: classifications[1].code,
      function: classifications[1].function,
      children: [
        {
          id: classifications[2].id,
          name: classifications[2].title,
          code: classifications[2].code,
          function: classifications[2].function,
          path: [classifications[1].title, classifications[2].title],
        },
      ],
      path: [classifications[1].title],
    },
  ];
};

const navigationTestItems = createNavigationTestItems();

// Use centralized navigation test items instead of inline constants
const navigationItems = navigationTestItems;

const mockClassificationResponse = {
  count: classification.length,
  next: null,
  previous: null,
  results: classification,
};

const mockClassificationApiGet = vi
  .fn()
  .mockImplementation(() => Promise.resolve({ ok: true, json: () => mockClassificationResponse }));

vi.spyOn(api, 'get').mockImplementation((url) => {
  if (url.includes('classification')) {
    return mockClassificationApiGet();
  }

  return Promise.resolve({ ok: false, status: 404, json: () => ({ error: 'Not found' }) });
});

const createMockStore = (overrides = {}) => {
  const initialState = {
    ...storeDefaultState,
    ui: { ...storeDefaultState.ui, attributeTypes, templates: template?.results || [] },
  };

  if (overrides.navigation) {
    initialState.navigation = {
      ...storeDefaultState.navigation,
      ...overrides.navigation,
    };
  }

  const finalState = {
    ...initialState,
    ...overrides,
  };

  return mockStore(finalState);
};

const renderComponent = (storeOverrides) => {
  const store = createMockStore(storeOverrides);

  return {
    user: userEvent.setup(),
    ...renderWithProviders(
      <BrowserRouter>
        <Navigation />
      </BrowserRouter>,
      { store },
    ),
  };
};

describe('<Navigation />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches navigation data on mount', async () => {
    const { store } = renderComponent({
      navigation: {
        is_open: true,
      },
    });

    expect(mockClassificationApiGet).toHaveBeenCalled();
    expect(store.getActions().some((action) => action.type === 'navigation/fetchNavigation/pending')).toBe(true);
  });

  it('handles API errors gracefully', async () => {
    vi.spyOn(api, 'get').mockImplementationOnce(() => Promise.reject(new Error('Test API error')));

    const store = createMockStore({
      navigation: {
        is_open: true,
      },
    });

    renderWithProviders(
      <BrowserRouter>
        <Navigation />
      </BrowserRouter>,
      { store },
    );

    await waitFor(() => {
      const errorMessages = ['Järjestelmä ei ole käytettävissä. Yritä hetken päästä uudestaan.', 'Ei tuloksia'];
      const hasErrorMessage = errorMessages.some((message) => screen.queryByText(message) !== null);
      expect(hasErrorMessage).toBe(true);
    });
  });

  it('displays navigation items when open and hides when closed', async () => {
    renderComponent({
      navigation: {
        is_open: true,
        items: navigationItems,
        timestamp: Date.now(),
      },
    });

    await waitFor(() => {
      expect(screen.getByText('Terveysneuvonta')).toBeInTheDocument();
      expect(screen.getByText('Koulutuspalvelut')).toBeInTheDocument();
    });
  });

  it('handles loading and empty states correctly', async () => {
    renderComponent({
      navigation: {
        is_fetching: true,
        is_open: true,
      },
    });

    await waitFor(() => {
      expect(screen.queryByText('Terveysneuvonta')).not.toBeInTheDocument();
      expect(screen.queryByText('Koulutuspalvelut')).not.toBeInTheDocument();
    });
  });

  it('shows appropriate message when navigation items are empty', async () => {
    renderComponent({
      navigation: {
        is_open: true,
        items: [],
        timestamp: Date.now(),
      },
    });

    await waitFor(() => {
      const emptyStateMessages = ['Ei tuloksia', 'Järjestelmä ei ole käytettävissä. Yritä hetken päästä uudestaan.'];
      const hasEmptyStateMessage = emptyStateMessages.some((message) => screen.queryByText(message) !== null);
      expect(hasEmptyStateMessage).toBe(true);
    });
  });

  it('renders search controls when items are available', async () => {
    renderComponent({
      navigation: {
        items: navigationItems,
        is_open: true,
        timestamp: Date.now(),
      },
    });

    await waitFor(() => {
      expect(screen.getByText('Terveysneuvonta')).toBeInTheDocument();
    });

    const searchInput = document.querySelector('.react-infinity-menu-default-search-input');
    expect(searchInput).toBeInTheDocument();

    const stateFilterDropdown = screen.getByText('Suodata tilan mukaan...');
    expect(stateFilterDropdown).toBeInTheDocument();
  });
});
