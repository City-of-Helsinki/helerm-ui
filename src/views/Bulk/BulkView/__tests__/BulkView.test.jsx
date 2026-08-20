import { MemoryRouter } from 'react-router-dom';
import { waitFor, screen } from '@testing-library/react';

import BulkView from '../BulkView';
import renderWithProviders, { storeDefaultState, createTestStore } from '../../../../utils/renderWithProviders';
import { classification, bulkUpdate } from '../../../../utils/__mocks__/mockHelpers';
import api from '../../../../utils/api';
import * as useAuth from '../../../../hooks/useAuth';

// Mock useParams hook
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn(() => ({ id: '1' })),
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
  const store = storeOverride ?? createTestStore(storeDefaultState);

  return renderWithProviders(
    <MemoryRouter initialEntries={['/bulk/1']}>
      <BulkView />
    </MemoryRouter>,
    { store },
  );
};

describe('<BulkView /> - Simple async thunk test', () => {
  it('renders correctly', async () => {
    const { store } = renderComponent();

    // Wait for the API calls to be made and the store to be updated
    await waitFor(() => {
      const actions = store.getActions();
      expect(actions.some((action) => action.type === 'bulk/fetchBulkUpdate/fulfilled')).toBe(true);
      expect(actions.some((action) => action.type === 'navigation/fetchNavigation/fulfilled')).toBe(true);
    });
  });

  it('fetches bulk update and navigation on mount', async () => {
    const store = createTestStore(storeDefaultState);

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

// Deep-nested phase/action/record structures exercise validateBulkUpdate and
// renderItemChanges, both of which recurse through phases -> actions ->
// records -> attributes (javascript:S2004 nesting refactor target).
describe('<BulkView /> - deeply nested phase/action/record validation and rendering', () => {
  // Shaped like a classification API result: flat (no parent), so
  // convertToTree keeps it as a single top-level item and preserves
  // the custom "phases" field used by validateBulkUpdate/renderItemChanges.
  const buildClassificationItem = (recordId = 'record-1') => ({
    id: 'test-item-nested-001',
    code: '99 99 99',
    title: 'Testifunktio',
    parent: null,
    function: 'test-function-nested-001',
    function_state: 'approved',
    function_attributes: {},
    function_valid_from: null,
    function_valid_to: null,
    phases: [
      {
        id: 'phase-1',
        name: 'Testivaihe',
        attributes: {},
        actions: [
          {
            id: 'action-1',
            name: 'Testitoimenpide',
            attributes: {},
            records: [
              {
                id: recordId,
                name: 'Testiasiakirja',
                attributes: { RecordType: 'Alkuperäinen' },
              },
            ],
          },
        ],
      },
    ],
  });

  const buildBulkUpdate = ({ actionId = 'action-1', recordId = 'record-1' } = {}) => ({
    id: 2,
    created_at: '2023-01-01T10:00:00.000000Z',
    modified_at: '2023-01-02T11:00:00.000000Z',
    modified_by: 'Test User',
    state: 'sent_for_review',
    description: 'Nested change test',
    is_approved: false,
    changes: {
      'test-function-nested-001__1': {
        phases: {
          'phase-1': {
            actions: {
              [actionId]: {
                records: {
                  [recordId]: {
                    attributes: { RecordType: 'Muutettu' },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  const mockApiResponses = (classificationItem, bulkUpdate) => {
    vi.spyOn(api, 'get').mockImplementation((url) => {
      if (url.includes('classification')) {
        return Promise.resolve({
          ok: true,
          json: () => ({ count: 1, next: null, previous: null, results: [classificationItem] }),
        });
      }
      if (url.includes('bulk-update/1')) {
        return Promise.resolve({ ok: true, json: () => bulkUpdate });
      }
      return Promise.resolve({ ok: false, status: 404, json: () => ({ error: 'Not found' }) });
    });
  };

  it('validates a fully matching phase/action/record chain and renders the record-level attribute change', async () => {
    mockApiResponses(buildClassificationItem(), buildBulkUpdate());

    renderComponent();

    // Record-level attribute change rendered via the deepest nested forEach.
    await waitFor(() => {
      expect(screen.getByText(/Testiasiakirja/)).toBeInTheDocument();
    });
    expect(screen.getByText(/Alkuperäinen/)).toBeInTheDocument();
    expect(screen.getByText(/RecordType/)).toBeInTheDocument();
    const recordChangeHeading = screen
      .getAllByRole('heading', { level: 4 })
      .find((heading) => heading.textContent.includes('RecordType'));
    expect(recordChangeHeading).toBeDefined();
    expect(recordChangeHeading.textContent).toContain('Testivaihe');
    expect(recordChangeHeading.textContent).toContain('Testitoimenpide');
    expect(recordChangeHeading.textContent).toContain('Testiasiakirja');
    expect(recordChangeHeading.textContent).toContain('Alkuperäinen');
    expect(recordChangeHeading.textContent).toContain('Muutettu');

    // Valid chain: no "cannot verify" banner shown.
    expect(
      screen.queryByText(/Massamuutospaketissa on käsittelyprosesseja, joita ei voida varmistaa/),
    ).not.toBeInTheDocument();
  });

  it('flags a missing record id as invalid and renders the record-not-found error', async () => {
    // Bulk update references a record id that does not exist on the item.
    mockApiResponses(buildClassificationItem('record-1'), buildBulkUpdate({ recordId: 'record-missing' }));

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/Asiakirjaa record-missing ei löytynyt/)).toBeInTheDocument();
    });

    expect(
      screen.getByText(/Massamuutospaketissa on käsittelyprosesseja, joita ei voida varmistaa/),
    ).toBeInTheDocument();
  });
});
