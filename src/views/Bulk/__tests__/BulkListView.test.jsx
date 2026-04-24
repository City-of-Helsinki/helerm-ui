import { BrowserRouter } from 'react-router-dom';
import { waitFor } from '@testing-library/react';

import BulkListView from '../BulkListView';
import renderWithProviders, { storeDefaultState, createTestStore } from '../../../utils/renderWithProviders';
import api from '../../../utils/api';
import * as useAuth from '../../../hooks/useAuth';

const mockBulkUpdatesResponse = {
  count: 0,
  next: null,
  previous: null,
  results: [],
};

const mockBulkUpdatesApiGet = vi
  .fn()
  .mockImplementation(() => Promise.resolve({ ok: true, json: () => mockBulkUpdatesResponse }));

vi.spyOn(api, 'get').mockImplementation((url) => {
  if (url.includes('bulk-update')) {
    return mockBulkUpdatesApiGet();
  }

  return Promise.resolve({ ok: false, status: 404, json: () => ({ error: 'Not found' }) });
});

vi.spyOn(useAuth, 'default').mockImplementation(() => ({
  getApiToken: vi.fn(() => 'mock-token'),
  isAuthenticated: true,
  user: { name: 'Test User' },
}));

const renderComponent = (storeOverride) => {
  const store = storeOverride ?? createTestStore(storeDefaultState);

  return renderWithProviders(
    <BrowserRouter>
      <BulkListView />
    </BrowserRouter>,
    { store },
  );
};

describe('<BulkListView />', () => {
  it('renders correctly', async () => {
    const { store } = renderComponent();

    // Wait for the API call to be made and the store to be updated
    await waitFor(() => {
      expect(store.getActions().some((action) => action.type === 'bulk/fetchBulkUpdates/fulfilled')).toBe(true);
    });
  });

  it('fetches bulk updates on mount', async () => {
    const store = createTestStore(storeDefaultState);

    renderComponent(store);

    await waitFor(() =>
      expect(store.getActions()).toEqual([
        {
          type: 'bulk/fetchBulkUpdates/pending',
          payload: undefined,
          meta: expect.anything(),
        },
        {
          type: 'bulk/fetchBulkUpdates/fulfilled',
          payload: [],
          meta: expect.anything(),
        },
      ]),
    );
  });
});
