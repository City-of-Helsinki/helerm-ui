import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { waitFor } from '@testing-library/react';

import BulkCreateView from '../BulkCreateView';
import renderWithProviders, { storeDefaultState, createTestStore } from '../../../../utils/renderWithProviders';
import { classification } from '../../../../utils/__mocks__/mockHelpers';
import api from '../../../../utils/api';

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
  const store = storeOverride ?? createTestStore(storeDefaultState);
  const router = createBrowserRouter([{ path: '/', element: <BulkCreateView /> }]);

  return renderWithProviders(<RouterProvider router={router} />, { store });
};

describe('<BulkCreateView /> - Simple async thunk test', () => {
  it('renders correctly', async () => {
    const { store } = renderComponent();

    // Wait for the API call to be made and the store to be updated
    await waitFor(() => {
      const actions = store.getActions();
      expect(actions.some((action) => action.type === 'navigation/fetchNavigation/fulfilled')).toBe(true);
      expect(store.getState().navigation.items.length).toBeGreaterThan(0);
    });
  });

  it('fetches navigation on mount', async () => {
    const store = createTestStore(storeDefaultState);

    renderComponent(store);

    await waitFor(() =>
      expect(store.getActions()).toEqual([
        {
          type: 'navigation/fetchNavigation/pending',
          payload: undefined,
          meta: expect.anything(),
        },
        {
          type: 'navigation/receiveNavigation',
          payload: {
            includeRelated: true,
            items: classification,
            page: 1,
          },
        },
        {
          type: 'navigation/parseNavigation',
          payload: {
            items: expect.any(Array),
          },
        },
        {
          type: 'navigation/fetchNavigation/fulfilled',
          payload: {
            ...mockClassificationResponse,
          },
          meta: expect.anything(),
        },
      ]),
    );
  });
});
