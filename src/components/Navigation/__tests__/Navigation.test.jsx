import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { waitFor } from '@testing-library/react';

import renderWithProviders, { storeDefaultState } from '../../../utils/renderWithProviders';
import Navigation from '../Navigation';
import api from '../../../utils/api';
import { classification } from '../../../utils/__mocks__/mockHelpers';
import useAuth from '../../../hooks/useAuth';

vi.mock('../../../hooks/useAuth');
const mockUseAuth = vi.mocked(useAuth);

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

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

const renderComponent = (storeOverride) => {
  const store = storeOverride ?? mockStore(storeDefaultState);

  return renderWithProviders(
    <BrowserRouter>
      <Navigation />
    </BrowserRouter>,
    { store },
  );
};

const findPendingAction = (actionsList) =>
  actionsList.find((action) => action.type === 'navigation/fetchNavigation/pending');

describe('<Navigation />', () => {
  beforeAll(() => {
    mockUseAuth.mockReturnValue({
      getApiToken: vi.fn().mockReturnValue(undefined),
      authenticated: false,
    });
  });
  it('renders correctly', async () => {
    renderComponent();
  });

  it('fetches navigation on mount', async () => {
    const store = mockStore(storeDefaultState);

    renderComponent(store);

    await waitFor(() =>
      expect(store.getActions()).toEqual([
        {
          type: 'navigation/fetchNavigation/pending',
          payload: undefined,
          meta: expect.objectContaining({
            arg: expect.objectContaining({
              includeRelated: false,
              token: undefined,
            }),
          }),
        },
        {
          type: 'navigation/receiveNavigation',
          payload: {
            includeRelated: false,
            items: classification,
            page: 1,
          },
        },
        {
          type: 'navigation/parseNavigation',
          payload: {
            items: [],
          },
        },
        {
          type: 'navigation/fetchNavigation/fulfilled',
          payload: {
            ...mockClassificationResponse,
          },
          meta: expect.objectContaining({
            arg: expect.objectContaining({
              includeRelated: false,
              token: undefined,
            }),
          }),
        },
      ]),
    );
  });

  describe('authenticated user filtering', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        getApiToken: vi.fn().mockReturnValue('test-token'),
        authenticated: true,
      });
    });

    afterEach(() => {
      mockUseAuth.mockReturnValue({
        getApiToken: vi.fn().mockReturnValue(undefined),
        authenticated: false,
      });
    });

    it('renders navigation with state filter dropdown for authenticated user', async () => {
      const store = mockStore(storeDefaultState);

      const { container } = renderComponent(store);

      await waitFor(() => {
        expect(container.querySelector('.navigation-container')).toBeInTheDocument();

        expect(container.innerHTML).toContain('Suodata tilan mukaan...');
      });

      await waitFor(() => {
        expect(container.querySelector('input[placeholder="Etsi..."]')).toBeInTheDocument();
        expect(container.querySelector('.Select')).toBeInTheDocument();
      });
    });

    it('fetches navigation with token when authenticated', async () => {
      const store = mockStore(storeDefaultState);

      renderComponent(store);

      await waitFor(() => {
        const actions = store.getActions();
        const pendingAction = findPendingAction(actions);
        expect(pendingAction).toBeDefined();
        expect(pendingAction.meta.arg.token).toBe('test-token');
      });
    });
  });
});
