import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { waitFor } from '@testing-library/react';

import BulkListView from '../BulkListView';
import renderWithProviders, { storeDefaultState } from '../../../utils/renderWithProviders';
import api from '../../../utils/api';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

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

const renderComponent = (storeOverride) => {
  const store = storeOverride ?? mockStore(storeDefaultState);

  return renderWithProviders(
    <BrowserRouter>
      <BulkListView />
    </BrowserRouter>,
    { store },
  );
};

describe('<BulkListView />', () => {
  it('renders correctly', () => {
    renderComponent();
  });

  it('fetches bulk updates on mount', async () => {
    const store = mockStore(storeDefaultState);

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
