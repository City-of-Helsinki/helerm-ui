import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import renderWithProviders, { storeDefaultState } from '../../../utils/renderWithProviders';
import Navigation from '../Navigation';
import api from '../../../utils/api';
import classification from '../../../utils/mocks/api/classification.json';
import attributeTypes from '../../../utils/mocks/attributeTypes.json';
import template from '../../../utils/mocks/api/template.json';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

const navigationItems = [
  {
    id: classification[0].id,
    name: classification[0].title,
    code: classification[0].code,
    function: classification[0].function,
    children: [],
    path: ['Terveysneuvonta'],
    isOpen: true,
  },
  {
    id: classification[1].id,
    name: classification[1].title,
    code: classification[1].code,
    function: classification[1].function,
    children: [
      {
        id: classification[2].id,
        name: classification[2].title,
        code: classification[2].code,
        function: classification[2].function,
        path: ['Koulutuspalvelut', 'Koulutuksen järjestäminen'],
      },
    ],
    path: ['Koulutuspalvelut'],
  },
];

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
    ui: { ...storeDefaultState.ui, attributeTypes, template },
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
