import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { waitFor } from '@testing-library/react';

import BulkView from '../BulkView';
import renderWithProviders, { storeDefaultState } from '../../../../utils/renderWithProviders';
import { classification, bulkUpdate } from '../../../../utils/__mocks__/mockHelpers';
import api from '../../../../utils/api';
import * as useAuth from '../../../../hooks/useAuth';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

// Mock useParams hook
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: '1' }),
  };
});

const mockClassificationResponse = {
  count: classification.length,
  next: null,
  previous: null,
  results: classification,
};

const mockBulkUpdateResponse = bulkUpdate;

const mockClassificationApiGet = vi
  .fn()
  .mockImplementation(() => Promise.resolve({ ok: true, json: () => mockClassificationResponse }));

const mockBulkUpdateApiGet = vi
  .fn()
  .mockImplementation(() => Promise.resolve({ ok: true, json: () => mockBulkUpdateResponse }));

vi.spyOn(api, 'get').mockImplementation((url) => {
  if (url.includes('classification')) {
    return mockClassificationApiGet();
  }
  if (url.includes('bulk-update/1')) {
    return mockBulkUpdateApiGet();
  }

  return Promise.resolve({ ok: false, status: 404, json: () => ({ error: 'Not found' }) });
});

vi.spyOn(useAuth, 'default').mockImplementation(() => ({
  getApiToken: vi.fn(() => 'mock-token'),
  isAuthenticated: true,
  user: { name: 'Test User' },
}));

const renderComponent = (storeOverride) => {
  const store = storeOverride ?? mockStore(storeDefaultState);

  return renderWithProviders(
    <MemoryRouter initialEntries={['/bulk/1']}>
      <BulkView />
    </MemoryRouter>,
    { store },
  );
};

describe('<BulkView /> - Simple async thunk test', () => {
  it('renders correctly', async () => {
    renderComponent();
  });

  it('fetches bulk update and navigation on mount', async () => {
    const store = mockStore(storeDefaultState);

    renderComponent(store);

    await waitFor(() => {
      const actions = store.getActions();

      // Check that we have pending actions
      const pendingActions = actions.filter((action) => action.type.endsWith('/pending'));
      expect(pendingActions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'bulk/fetchBulkUpdate/pending',
          }),
          expect.objectContaining({
            type: 'navigation/fetchNavigation/pending',
          }),
        ]),
      );

      // Check that we have fulfilled actions
      const fulfilledActions = actions.filter((action) => action.type.endsWith('/fulfilled'));
      expect(fulfilledActions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'bulk/fetchBulkUpdate/fulfilled',
            payload: mockBulkUpdateResponse,
          }),
          expect.objectContaining({
            type: 'navigation/fetchNavigation/fulfilled',
            payload: mockClassificationResponse,
          }),
        ]),
      );
    });
  });
});
