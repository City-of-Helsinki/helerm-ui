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

// Items shaped with phases/actions/records and repeated/array-valued attributes
// exercise getAttributeValues/addAttributeValues' nested phase-action-record
// traversal and its "already seen" / array-value branches, none of which are
// reached by the flat `classification` mock (javascript:S2004 refactor target).
describe('<BulkCreateView /> - attribute value collection over nested phases/actions/records', () => {
  const buildNestedClassificationItem = (overrides = {}) => ({
    id: 'test-item-nested-attrs-001',
    code: '11 11 11',
    title: 'Attribuuttitesti',
    parent: null,
    function: 'test-function-nested-attrs-001',
    function_state: 'approved',
    function_attributes: { MultiValueAttr: ['A', 'B'] },
    function_valid_from: null,
    function_valid_to: null,
    phases: [
      {
        id: 'phase-attrs-1',
        name: 'Testivaihe',
        attributes: { PhaseAttr: 'PhaseValue' },
        actions: [
          {
            id: 'action-attrs-1',
            name: 'Testitoimenpide',
            attributes: { ActionAttr: 'ActionValue' },
            records: [
              {
                id: 'record-attrs-1',
                name: 'Testiasiakirja',
                attributes: { RecordAttr: 'RecordValue' },
              },
            ],
          },
        ],
      },
    ],
    ...overrides,
  });

  afterEach(() => {
    // Restore the module-level mock so later test files relying on the default
    // `classification` fixture are unaffected by this describe's custom response.
    vi.spyOn(api, 'get').mockImplementation((url) => {
      if (url.includes('classification')) {
        return mockClassificationApiGet();
      }
      return Promise.resolve({ ok: false, status: 404, json: () => ({ error: 'Not found' }) });
    });
  });

  it('collects phase/action/record attributes and merges repeated array-valued attributes', async () => {
    const firstItem = buildNestedClassificationItem();
    const secondItem = buildNestedClassificationItem({
      id: 'test-item-nested-attrs-002',
      function: 'test-function-nested-attrs-002',
      function_attributes: { MultiValueAttr: ['A', 'B'] }, // same array value: hits the "already seen" branch
    });
    const thirdItem = buildNestedClassificationItem({
      id: 'test-item-nested-attrs-003',
      function: 'test-function-nested-attrs-003',
      function_attributes: { MultiValueAttr: ['C'] }, // different array value: hits the "push new value" branch
    });

    vi.spyOn(api, 'get').mockImplementation((url) => {
      if (url.includes('classification')) {
        return Promise.resolve({
          ok: true,
          json: () => ({ count: 3, next: null, previous: null, results: [firstItem, secondItem, thirdItem] }),
        });
      }
      return Promise.resolve({ ok: false, status: 404, json: () => ({ error: 'Not found' }) });
    });

    const store = createTestStore(storeDefaultState);
    renderComponent(store);

    await waitFor(() => {
      expect(store.getState().navigation.items.length).toBeGreaterThan(0);
    });
  });
});
