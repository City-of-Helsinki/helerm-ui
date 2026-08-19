import { BrowserRouter } from 'react-router-dom';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import BulkListView from '../BulkListView';
import renderWithProviders, { storeDefaultState, createTestStore } from '../../../utils/renderWithProviders';
import api from '../../../utils/api';
import * as useAuth from '../../../hooks/useAuth';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const mod = await vi.importActual('react-router-dom');

  return {
    ...mod,
    useNavigate: vi.fn(() => mockNavigate),
  };
});

const mockBulkUpdate = {
  id: 1,
  created_at: '2023-01-01T10:00:00Z',
  modified_at: '2023-01-02T10:00:00Z',
  modified_by: 'Tester',
  description: 'Test bulk update',
  changes: { a: 1, b: 2 },
  state: 5,
  is_approved: false,
};

const mockBulkUpdatesResponse = {
  count: 1,
  next: null,
  previous: null,
  results: [mockBulkUpdate],
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

const storeStateWithPermission = {
  ...storeDefaultState,
  user: { ...storeDefaultState.user, data: { permissions: ['change_bulkupdate'] } },
};

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
          payload: [mockBulkUpdate],
          meta: expect.anything(),
        },
      ]),
    );
  });

  it('renders bulk update rows and navigates on click', async () => {
    const store = createTestStore(storeStateWithPermission);
    renderComponent(store);

    const row = await screen.findByText(/Paketti ID: 1/);
    expect(screen.getByRole('heading', { level: 5, name: 'Odottaa' })).toBeInTheDocument();

    await userEvent.click(row.closest('button'));

    expect(mockNavigate).toHaveBeenCalledWith('/bulk/view/1');
  });

  it('filters bulk updates by approval status', async () => {
    const store = createTestStore(storeStateWithPermission);
    renderComponent(store);

    await screen.findByText(/Paketti ID: 1/);

    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(screen.getByText('Hyväksytty'));

    await waitFor(() => {
      expect(screen.getByText(/Paketti ID: 1/)).toBeInTheDocument();
    });
  });
});
