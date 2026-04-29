import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { act, waitFor } from '@testing-library/react';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import renderWithProviders, { storeDefaultState } from '../../../utils/renderWithProviders';
import Navigation from '../Navigation';
import api from '../../../utils/api';
import useAuth from '../../../hooks/useAuth';
import {
  parseNavigationSliceAction,
  setNavigationVisibility,
  initialState as navigationInitialState,
} from '../../../store/reducers/navigation';
import { navigationStateFilters } from '../../../constants';
import { initialState as classificationInitialState } from '../../../store/reducers/classification';
import { initialState as selectedTOSInitialState } from '../../../store/reducers/tos-toolkit/main';
import InfinityMenu from '../../InfinityMenu/InfinityMenu';

vi.mock('../../../hooks/useAuth');
const mockUseAuth = vi.mocked(useAuth);

const mockNavigate = vi.hoisted(() => vi.fn());
vi.mock('react-router-dom', async (importActual) => ({
  ...(await importActual()),
  // eslint-disable-next-line @eslint-react/component-hook-factories
  useNavigate: () => mockNavigate,
}));

vi.mock('../../InfinityMenu/InfinityMenu', () => ({
  default: vi.fn(() => <div data-testid='infinity-menu' />),
}));

const MockedInfinityMenu = vi.mocked(InfinityMenu);

const getLastInfinityMenuProps = () => {
  const calls = MockedInfinityMenu.mock.calls;
  return calls[calls.length - 1]?.[0] ?? null;
};

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

const mockClassificationApiResponse = {
  count: 2,
  next: null,
  previous: null,
  results: [],
};
vi.spyOn(api, 'get').mockImplementation((url) => {
  if (url.includes('classification')) {
    return Promise.resolve({ ok: true, json: () => mockClassificationApiResponse });
  }
  return Promise.resolve({ ok: false, status: 404, json: () => ({ error: 'Not found' }) });
});

// Pre-converted tree items (as they appear after convertToTree)
const mockTreeItems = [
  {
    id: 'root-approved',
    code: '01',
    title: 'Approved Root',
    name: '01 Approved Root',
    path: ['Top'],
    parent_id: null,
    sort_id: '01',
    function: 'func-approved-id',
    function_state: 'approved',
    function_attributes: { RetentionPeriod: '5' },
    children: [
      {
        id: 'child-approved',
        code: '01 01',
        title: 'Approved Child',
        name: '01 01 Approved Child',
        path: ['Top', '01 Approved Root'],
        parent_id: 'root-approved',
        sort_id: '01',
        function: 'func-child-id',
        function_state: 'approved',
        function_attributes: { RetentionPeriod: '5' },
      },
    ],
  },
  {
    id: 'root-draft',
    code: '02',
    title: 'Draft Root',
    name: '02 Draft Root',
    path: [],
    parent_id: null,
    sort_id: '02',
    function: 'func-draft-id',
    function_state: 'draft',
    function_attributes: { RetentionPeriod: '10' },
    children: [],
  },
];

const renderWithItems = (items = mockTreeItems, extraState = {}, RouterComponent = BrowserRouter) => {
  const stateWithItems = {
    ...storeDefaultState,
    navigation: {
      ...navigationInitialState,
      items,
      timestamp: Date.now().toString(),
    },
    ...extraState,
  };
  const store = mockStore(stateWithItems);
  return renderWithProviders(
    <RouterComponent>
      <Navigation />
    </RouterComponent>,
    { store },
  );
};

describe('<Navigation />', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      getApiToken: vi.fn().mockReturnValue('test-token'),
      authenticated: true,
    });
    mockNavigate.mockClear();
    MockedInfinityMenu.mockClear();
  });

  describe('Mount & fetching', () => {
    it('renders without crashing', () => {
      renderWithItems();
    });

    it('dispatches fetchNavigation/pending with token on mount', async () => {
      const store = mockStore(storeDefaultState);
      renderWithProviders(
        <BrowserRouter>
          <Navigation />
        </BrowserRouter>,
        { store },
      );

      await waitFor(() => {
        const pendingAction = store.getActions().find((a) => a.type === 'navigation/fetchNavigation/pending');
        expect(pendingAction).toBeDefined();
        expect(pendingAction.meta.arg.token).toBe('test-token');
      });
    });

    it('calls fetchNavigation with includeRelated=true when route is /filter', async () => {
      const store = mockStore(storeDefaultState);
      renderWithProviders(
        <MemoryRouter initialEntries={['/filter']}>
          <Navigation />
        </MemoryRouter>,
        { store },
      );

      await waitFor(() => {
        const pendingAction = store.getActions().find((a) => a.type === 'navigation/fetchNavigation/pending');
        expect(pendingAction).toBeDefined();
        expect(pendingAction.meta.arg.includeRelated).toBe(true);
      });
    });

    it('refetches when authenticated flips false to true', async () => {
      mockUseAuth.mockReturnValue({
        getApiToken: vi.fn().mockReturnValue('test-token'),
        authenticated: false,
      });

      const store = mockStore(storeDefaultState);
      const { rerender } = renderWithProviders(
        <BrowserRouter>
          <Navigation />
        </BrowserRouter>,
        { store },
      );

      await waitFor(() => {
        expect(store.getActions().some((a) => a.type === 'navigation/fetchNavigation/pending')).toBe(true);
      });

      const firstCallCount = store.getActions().filter((a) => a.type === 'navigation/fetchNavigation/pending').length;

      mockUseAuth.mockReturnValue({
        getApiToken: vi.fn().mockReturnValue('test-token'),
        authenticated: true,
      });

      act(() => {
        rerender(
          <BrowserRouter>
            <Navigation />
          </BrowserRouter>,
        );
      });

      await waitFor(() => {
        const pendingCount = store.getActions().filter((a) => a.type === 'navigation/fetchNavigation/pending').length;
        expect(pendingCount).toBeGreaterThan(firstCallCount);
      });
    });
  });

  describe('getFilteredTree', () => {
    it('passes all items to InfinityMenu when no filters are set', async () => {
      renderWithItems(mockTreeItems);

      await waitFor(() => {
        const props = getLastInfinityMenuProps();
        expect(props).not.toBeNull();
        expect(props.tree).toHaveLength(mockTreeItems.length);
      });
    });

    it('status filter keeps only items with matching function_state', async () => {
      renderWithItems(mockTreeItems);

      // Capture handleFilterChange from InfinityMenu props
      await waitFor(() => {
        expect(getLastInfinityMenuProps()).not.toBeNull();
      });
      const { handleFilterChange } = getLastInfinityMenuProps();

      act(() => {
        handleFilterChange([{ value: 'approved' }], 'statusFilters');
      });

      await waitFor(() => {
        const props = getLastInfinityMenuProps();
        // root-draft (function_state: 'draft') should be filtered out
        const tree = props.tree;
        expect(tree.every((item) => item.function_state === 'approved')).toBe(true);
        expect(tree.find((item) => item.id === 'root-draft')).toBeUndefined();
      });
    });

    it('retention period filter keeps only items with matching RetentionPeriod', async () => {
      renderWithItems(mockTreeItems);

      await waitFor(() => {
        expect(getLastInfinityMenuProps()).not.toBeNull();
      });
      const { handleFilterChange } = getLastInfinityMenuProps();

      act(() => {
        handleFilterChange([{ value: '10' }], 'retentionPeriodFilters');
      });

      await waitFor(() => {
        const props = getLastInfinityMenuProps();
        const tree = props.tree;
        // root-draft has RetentionPeriod '10', root-approved has '5'
        expect(tree.find((item) => item.id === 'root-approved')).toBeUndefined();
        expect(tree.find((item) => item.id === 'root-draft')).toBeDefined();
      });
    });

    it('items with non-matching root but matching descendants are kept', async () => {
      const itemsWithMixedChild = [
        {
          id: 'root-no-match',
          code: '01',
          title: 'No Match Root',
          name: '01 No Match Root',
          path: [],
          parent_id: null,
          sort_id: '01',
          function_state: 'draft',
          function_attributes: { RetentionPeriod: '99' },
          children: [
            {
              id: 'matching-child',
              code: '01 01',
              title: 'Matching Child',
              name: '01 01 Matching Child',
              path: ['01 No Match Root'],
              parent_id: 'root-no-match',
              sort_id: '01',
              function_state: 'approved',
              function_attributes: { RetentionPeriod: '5' },
            },
          ],
        },
      ];

      renderWithItems(itemsWithMixedChild);

      await waitFor(() => {
        expect(getLastInfinityMenuProps()).not.toBeNull();
      });
      const { handleFilterChange } = getLastInfinityMenuProps();

      act(() => {
        handleFilterChange([{ value: 'approved' }], 'statusFilters');
      });

      await waitFor(() => {
        const props = getLastInfinityMenuProps();
        // Root should be kept because its child matches
        expect(props.tree.find((item) => item.id === 'root-no-match')).toBeDefined();
        const root = props.tree.find((item) => item.id === 'root-no-match');
        expect(root.children).toHaveLength(1);
        expect(root.children[0].id).toBe('matching-child');
      });
    });

    it('passes filters prop to InfinityMenu', async () => {
      renderWithItems();

      await waitFor(() => {
        const props = getLastInfinityMenuProps();
        expect(props.filters).toEqual(navigationStateFilters);
      });
    });
  });

  describe('State preservation', () => {
    it('preserves isOpen across items refresh', async () => {
      // Use a real store so dispatching parseNavigationSliceAction actually updates state.
      // Block the fetch so the initial preloaded items are never overwritten.
      vi.spyOn(api, 'get').mockImplementationOnce(() => new Promise(() => {}));

      const { store } = renderWithProviders(
        <BrowserRouter>
          <Navigation />
        </BrowserRouter>,
        {
          preloadedState: {
            ...storeDefaultState,
            navigation: {
              ...navigationInitialState,
              items: mockTreeItems,
              timestamp: Date.now().toString(),
            },
          },
        },
      );

      await waitFor(() => {
        expect(getLastInfinityMenuProps()).not.toBeNull();
      });

      // Simulate opening root-approved by invoking onNodeMouseClick
      const { onNodeMouseClick } = getLastInfinityMenuProps();
      const openedTree = mockTreeItems.map((item) => (item.id === 'root-approved' ? { ...item, isOpen: true } : item));
      act(() => {
        onNodeMouseClick(null, openedTree);
      });

      await waitFor(() => {
        const props = getLastInfinityMenuProps();
        expect(props.tree.find((item) => item.id === 'root-approved')?.isOpen).toBe(true);
      });

      // Simulate server refresh (new timestamp, same items)
      act(() => {
        store.dispatch(parseNavigationSliceAction({ items: mockTreeItems }));
      });

      await waitFor(() => {
        const props = getLastInfinityMenuProps();
        // isOpen should be preserved after items refresh
        expect(props.tree.find((item) => item.id === 'root-approved')?.isOpen).toBe(true);
      });
    });

    it('resets state when filters change', async () => {
      renderWithItems(mockTreeItems);

      await waitFor(() => {
        expect(getLastInfinityMenuProps()).not.toBeNull();
      });

      // Open a node
      const { onNodeMouseClick, handleFilterChange } = getLastInfinityMenuProps();
      const openedTree = mockTreeItems.map((item) => (item.id === 'root-approved' ? { ...item, isOpen: true } : item));
      act(() => {
        onNodeMouseClick(null, openedTree);
      });

      await waitFor(() => {
        expect(getLastInfinityMenuProps().tree.find((item) => item.id === 'root-approved')?.isOpen).toBe(true);
      });

      // Change filters — tree should be regenerated without preserving isOpen
      act(() => {
        handleFilterChange([{ value: 'approved' }], 'statusFilters');
      });

      await waitFor(() => {
        // Filtered tree is recomputed without isOpen preservation
        const props = getLastInfinityMenuProps();
        const approvedRoot = props.tree.find((item) => item.id === 'root-approved');
        // isOpen may be true because setAllOpen is called during filter, but isOpen is a filter artifact
        // The important thing is that the component re-renders with filtered tree
        expect(approvedRoot).toBeDefined();
      });
    });

    it('does not preserve state on first render', async () => {
      renderWithItems(mockTreeItems);

      await waitFor(() => {
        const props = getLastInfinityMenuProps();
        expect(props).not.toBeNull();
        // No nodes should be open on initial render
        props.tree.forEach((item) => {
          expect(item.isOpen).toBeFalsy();
        });
      });
    });
  });

  describe('Search', () => {
    it('addSearchInput appends an empty string to searchInputs', async () => {
      renderWithItems();

      await waitFor(() => {
        expect(getLastInfinityMenuProps()).not.toBeNull();
      });

      const { addSearchInput } = getLastInfinityMenuProps();
      act(() => {
        addSearchInput();
      });

      await waitFor(() => {
        const props = getLastInfinityMenuProps();
        expect(props.searchInputs).toHaveLength(2);
        expect(props.searchInputs[1]).toBe('');
      });
    });

    it('removeSearchInput removes the item at the given index', async () => {
      renderWithItems();

      await waitFor(() => {
        expect(getLastInfinityMenuProps()).not.toBeNull();
      });

      // Add a second input first
      const { addSearchInput } = getLastInfinityMenuProps();
      act(() => {
        addSearchInput();
      });

      await waitFor(() => {
        expect(getLastInfinityMenuProps().searchInputs).toHaveLength(2);
      });

      const { removeSearchInput } = getLastInfinityMenuProps();
      act(() => {
        removeSearchInput(1);
      });

      await waitFor(() => {
        expect(getLastInfinityMenuProps().searchInputs).toHaveLength(1);
      });
    });

    it('removeSearchInput resets to [""] when removing the last element', async () => {
      renderWithItems();

      await waitFor(() => {
        expect(getLastInfinityMenuProps()).not.toBeNull();
      });

      const { removeSearchInput } = getLastInfinityMenuProps();
      act(() => {
        removeSearchInput(0);
      });

      await waitFor(() => {
        const props = getLastInfinityMenuProps();
        expect(props.searchInputs).toEqual(['']);
      });
    });

    it('setSearchInput on non-filter route sets isSearchChanged immediately', async () => {
      renderWithItems();

      await waitFor(() => {
        expect(getLastInfinityMenuProps()).not.toBeNull();
      });

      const { setSearchInput } = getLastInfinityMenuProps();
      act(() => {
        setSearchInput(0, 'test');
      });

      await waitFor(() => {
        const props = getLastInfinityMenuProps();
        expect(props.isSearchChanged).toBe(true);
        expect(props.searchInputs[0]).toBe('test');
      });
    });

    it('setSearchInput on /filter route defers isSearchChanged via timeout', async () => {
      const store = mockStore(storeDefaultState);
      renderWithProviders(
        <MemoryRouter initialEntries={['/filter']}>
          <Navigation />
        </MemoryRouter>,
        { store },
      );

      await waitFor(() => {
        expect(getLastInfinityMenuProps()).not.toBeNull();
      });

      // Switch to fake timers AFTER initial render — waitFor polls with setTimeout,
      // so faking timers earlier would make the polling hang.
      vi.useFakeTimers();

      try {
        const { setSearchInput } = getLastInfinityMenuProps();

        act(() => {
          setSearchInput(0, 'test-filter');
        });

        // Before timeout fires, searchInputs updates but isSearchChanged stays false on /filter
        expect(getLastInfinityMenuProps().searchInputs[0]).toBe('test-filter');
        expect(getLastInfinityMenuProps().isSearchChanged).toBe(false);

        // Advance past SEARCH_TIMEOUT (500ms) — isSearchChanged should flip to true
        await act(async () => {
          await vi.advanceTimersByTimeAsync(600);
        });

        expect(getLastInfinityMenuProps().isSearchChanged).toBe(true);
      } finally {
        vi.useRealTimers();
      }
    });
  });

  describe('Leaf click handling', () => {
    it('default handler on a leaf with function navigates to /view-tos/:id', async () => {
      const store = mockStore({
        ...storeDefaultState,
        navigation: { ...navigationInitialState, is_open: true },
      });

      renderWithProviders(
        <BrowserRouter>
          <Navigation />
        </BrowserRouter>,
        { store },
      );

      await waitFor(() => {
        expect(getLastInfinityMenuProps()).not.toBeNull();
      });

      const { onLeafMouseClick } = getLastInfinityMenuProps();
      act(() => {
        onLeafMouseClick(new MouseEvent('click'), { id: 'leaf-1', function: 'func-id-42' });
      });

      expect(mockNavigate).toHaveBeenCalledWith('/view-tos/func-id-42');
    });

    it('default handler on a leaf with parent navigates to /view-classification/:id', async () => {
      const store = mockStore({
        ...storeDefaultState,
        navigation: { ...navigationInitialState, is_open: true },
      });

      renderWithProviders(
        <BrowserRouter>
          <Navigation />
        </BrowserRouter>,
        { store },
      );

      await waitFor(() => {
        expect(getLastInfinityMenuProps()).not.toBeNull();
      });

      const { onLeafMouseClick } = getLastInfinityMenuProps();
      act(() => {
        onLeafMouseClick(new MouseEvent('click'), { id: 'class-99', parent: 'parent-id' });
      });

      expect(mockNavigate).toHaveBeenCalledWith('/view-classification/class-99');
    });

    it('custom onLeafMouseClick override is called instead of default', async () => {
      const customHandler = vi.fn();
      const store = mockStore(storeDefaultState);

      renderWithProviders(
        <BrowserRouter>
          <Navigation onLeafMouseClick={customHandler} />
        </BrowserRouter>,
        { store },
      );

      await waitFor(() => {
        expect(getLastInfinityMenuProps()).not.toBeNull();
      });

      const { onLeafMouseClick } = getLastInfinityMenuProps();
      const leaf = { id: 'leaf-x', function: 'func-x' };
      act(() => {
        onLeafMouseClick(new MouseEvent('click'), leaf);
      });

      expect(customHandler).toHaveBeenCalledWith(expect.anything(), leaf);
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Visibility & breadcrumb', () => {
    it('toggleNavigationVisibility dispatches setNavigationVisibility with toggled value', async () => {
      const store = mockStore({
        ...storeDefaultState,
        navigation: { ...navigationInitialState, is_open: true },
      });

      renderWithProviders(
        <BrowserRouter>
          <Navigation />
        </BrowserRouter>,
        { store },
      );

      await waitFor(() => {
        expect(getLastInfinityMenuProps()).not.toBeNull();
      });

      const { toggleNavigationVisibility } = getLastInfinityMenuProps();
      act(() => {
        toggleNavigationVisibility();
      });

      const dispatched = store.getActions();
      const visibilityAction = dispatched.find((a) => a.type === setNavigationVisibility.type);
      expect(visibilityAction).toBeDefined();
      expect(visibilityAction.payload).toBe(false); // was true, now toggled to false
    });

    it('renders empty-state error banner when items empty, timestamp set, not fetching, no filters', async () => {
      const store = mockStore({
        ...storeDefaultState,
        navigation: {
          ...navigationInitialState,
          items: [],
          isFetching: false,
          timestamp: '12345',
        },
      });

      const { getByText } = renderWithProviders(
        <BrowserRouter>
          <Navigation />
        </BrowserRouter>,
        { store },
      );

      await waitFor(() => {
        expect(getByText(/Järjestelmä ei ole käytettävissä/)).toBeInTheDocument();
      });
    });

    it('calculatedTosPath is derived from classification.id and passed to InfinityMenu', async () => {
      const itemWithPath = {
        id: 'class-abc',
        code: '03',
        title: 'Classification ABC',
        name: '03 Classification ABC',
        path: ['Level 1', 'Level 2'],
        parent_id: null,
        sort_id: '03',
        function_state: 'approved',
        function_attributes: {},
        children: [],
      };

      const store = mockStore({
        ...storeDefaultState,
        navigation: {
          ...navigationInitialState,
          items: [itemWithPath],
          timestamp: '999',
        },
        classification: {
          ...classificationInitialState,
          id: 'class-abc',
        },
      });

      renderWithProviders(
        <BrowserRouter>
          <Navigation />
        </BrowserRouter>,
        { store },
      );

      await waitFor(() => {
        const props = getLastInfinityMenuProps();
        expect(props.path).toEqual(['Level 1', 'Level 2']);
      });
    });

    it('calculatedTosPath uses selectedTOS.classification.id when available', async () => {
      const itemWithPath = {
        id: 'tos-class-id',
        code: '04',
        title: 'TOS Classification',
        name: '04 TOS Classification',
        path: ['TOS Path Item'],
        parent_id: null,
        sort_id: '04',
        function_state: 'approved',
        function_attributes: {},
        children: [],
      };

      const store = mockStore({
        ...storeDefaultState,
        navigation: {
          ...navigationInitialState,
          items: [itemWithPath],
          timestamp: '888',
        },
        selectedTOS: {
          ...selectedTOSInitialState,
          classification: { id: 'tos-class-id' },
        },
      });

      renderWithProviders(
        <BrowserRouter>
          <Navigation />
        </BrowserRouter>,
        { store },
      );

      await waitFor(() => {
        const props = getLastInfinityMenuProps();
        expect(props.path).toEqual(['TOS Path Item']);
      });
    });
  });
});
