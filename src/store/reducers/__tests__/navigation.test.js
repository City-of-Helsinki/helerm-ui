import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import navigationReducer, {
  initialState,
  fetchNavigationThunk,
  parseNavigationSliceAction,
  setNavigationVisibility,
  navigationErrorSliceAction,
  receiveNavigationSliceAction,
  getTOS,
  getTOSPath,
  itemsSelector,
  isFetchingSelector,
  includeRelatedSelector,
  isOpenSelector,
  navigationListSelector,
  timestampSelector,
  navigationItemsSelector,
} from '../navigation';
import api from '../../../utils/api';
import { classification } from '../../../utils/__mocks__/mockHelpers';
import * as helpers from '../../../utils/helpers';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

vi.mock('../../../utils/helpers', () => ({
  convertToTree: vi.fn(),
  itemById: vi.fn(),
}));

const mockClassificationResponse = {
  count: classification.length,
  next: null,
  previous: null,
  results: classification,
};

const mockClassificationResponseWithNext = {
  count: classification.length,
  next: 'http://api.example.com/classification/?page=2',
  previous: null,
  results: classification.slice(0, 3),
};

const mockClassificationResponsePage2 = {
  count: classification.length,
  next: null,
  previous: 'http://api.example.com/classification/?page=1',
  results: classification.slice(3),
};

const createMockState = (overrides = {}) => ({
  ...initialState,
  ...overrides,
});

const testReducerAction = (action, state = initialState) => navigationReducer(state, action);

const setupApiMock = (method, response) => {
  return () => vi.spyOn(api, method).mockResolvedValueOnce({ ok: true, json: () => response });
};

const setupApiMockError = (method, error) => {
  return () => vi.spyOn(api, method).mockRejectedValueOnce(error);
};

const testAsyncThunk = async (thunk, mockSetup, storeState = {}) => {
  mockSetup();
  const store = mockStore(storeState);
  await store.dispatch(thunk);
  return store.getActions();
};

const hasActionType = (actions, actionType) => actions.some((action) => action.type === actionType);

const hasReceiveNavigation = (actions) => hasActionType(actions, 'navigation/receiveNavigation');
const hasParseNavigation = (actions) => hasActionType(actions, 'navigation/parseNavigation');
const hasNavigationError = (actions) => hasActionType(actions, 'navigation/navigationError');
const findRejectedAction = (actions) => actions.find((action) => action.type === 'navigation/fetchNavigation/rejected');
const filterReceiveActions = (actions) => actions.filter((action) => action.type === 'navigation/receiveNavigation');

const expectAsyncActions = (actions, baseType, status = 'fulfilled') => {
  expect(hasActionType(actions, `${baseType}/pending`)).toBe(true);
  expect(hasActionType(actions, `${baseType}/${status}`)).toBe(true);
};

const createJsonResponse = (data) => () => data;

describe('Navigation Reducer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Helper Functions', () => {
    describe('getTOS', () => {
      it('should get TOS from selectedTOS.classification', () => {
        const mockTOS = { id: 'tos-1', name: 'Test TOS' };
        const selectedTOS = { classification: { id: 'class-1' } };
        const items = [];
        const classification = { id: 'class-2' };

        helpers.itemById.mockReturnValue(mockTOS);

        const result = getTOS(selectedTOS, items, classification);

        expect(helpers.itemById).toHaveBeenCalledWith(items, 'class-1');
        expect(result).toBe(mockTOS);
      });

      it('should get TOS from classification when selectedTOS.classification is not available', () => {
        const mockTOS = { id: 'tos-1', name: 'Test TOS' };
        const selectedTOS = {};
        const items = [];
        const classification = { id: 'class-1' };

        helpers.itemById.mockReturnValue(mockTOS);

        const result = getTOS(selectedTOS, items, classification);

        expect(helpers.itemById).toHaveBeenCalledWith(items, 'class-1');
        expect(result).toBe(mockTOS);
      });

      it('should return null when no classification is available', () => {
        const selectedTOS = {};
        const items = [];
        const classification = {};

        const result = getTOS(selectedTOS, items, classification);

        expect(result).toBeNull();
      });
    });

    describe('getTOSPath', () => {
      it('should return tosPath when available', () => {
        const tos = { tosPath: ['path', 'to', 'tos'], path: ['other', 'path'] };
        const result = getTOSPath(tos);
        expect(result).toEqual(['path', 'to', 'tos']);
      });

      it('should return path when tosPath is not available', () => {
        const tos = { path: ['path', 'to', 'tos'] };
        const result = getTOSPath(tos);
        expect(result).toEqual(['path', 'to', 'tos']);
      });

      it('should return empty array when neither tosPath nor path is available', () => {
        const tos = {};
        const result = getTOSPath(tos);
        expect(result).toEqual([]);
      });

      it('should return empty array when tos is null', () => {
        const result = getTOSPath(null);
        expect(result).toEqual([]);
      });
    });
  });

  describe('Reducer', () => {
    it('should be a function', () => {
      expect(navigationReducer).toBeInstanceOf(Function);
    });

    it('should initialize with correct state', () => {
      expect(navigationReducer(undefined, {})).toEqual(initialState);
    });

    it('should return previous state for unknown actions', () => {
      let state = navigationReducer(undefined, {});
      expect(state).toEqual(initialState);

      state = navigationReducer(state, { type: 'UNKNOWN_ACTION' });
      expect(state).toEqual(initialState);

      state = navigationReducer(state, { type: 'navigation/fetchNavigation/pending', meta: { arg: {} } });
      expect(state.isFetching).toBe(true);

      state = navigationReducer(state, { type: 'UNKNOWN_ACTION' });
      expect(state.isFetching).toBe(true);
    });

    describe('Action Reducers', () => {
      it('should parse navigation and set items', () => {
        const mockItems = [{ id: '1', name: 'Item 1' }];
        const result = testReducerAction(parseNavigationSliceAction({ items: mockItems }));

        expect(result.isFetching).toBe(false);
        expect(result.items).toEqual(mockItems);
        expect(result.timestamp).toEqual(expect.any(String));
      });

      it('should set navigation visibility', () => {
        const result = testReducerAction(setNavigationVisibility(false));
        expect(result.is_open).toBe(false);
      });

      it('should handle navigation error', () => {
        const state = createMockState({
          list: [{ id: '1' }],
          isFetching: true,
          items: [{ id: '1' }],
        });

        const result = testReducerAction(navigationErrorSliceAction(), state);

        expect(result.list).toEqual([]);
        expect(result.isFetching).toBe(false);
        expect(result.items).toEqual([]);
        expect(result.timestamp).toEqual(expect.any(String));
      });

      it('should receive navigation data for first page', () => {
        const mockItems = [{ id: '1', name: 'Item 1' }];
        const result = testReducerAction(
          receiveNavigationSliceAction({
            items: mockItems,
            includeRelated: true,
            page: 1,
          }),
        );

        expect(result.includeRelated).toBe(true);
        expect(result.list).toEqual(mockItems);
        expect(result.page).toBe(1);
      });

      it('should append navigation data for subsequent pages', () => {
        const initialItems = [{ id: '1', name: 'Item 1' }];
        const newItems = [{ id: '2', name: 'Item 2' }];
        const state = createMockState({ list: initialItems });

        const result = testReducerAction(
          receiveNavigationSliceAction({
            items: newItems,
            includeRelated: true,
            page: 2,
          }),
          state,
        );

        expect(result.list).toEqual([...initialItems, ...newItems]);
        expect(result.page).toBe(2);
      });
    });
  });

  describe('Async Thunks', () => {
    describe('fetchNavigationThunk', () => {
      it('should fetch navigation successfully', async () => {
        helpers.convertToTree.mockReturnValue([]);
        const actions = await testAsyncThunk(
          fetchNavigationThunk({ includeRelated: false, page: 1 }),
          setupApiMock('get', mockClassificationResponse),
          { navigation: { includeRelated: false, isFetching: false, list: [] } },
        );

        expectAsyncActions(actions, 'navigation/fetchNavigation');
        expect(hasReceiveNavigation(actions)).toBe(true);
        expect(hasParseNavigation(actions)).toBe(true);
      });

      it('should fetch navigation with token when provided', async () => {
        helpers.convertToTree.mockReturnValue([]);
        const mockApiGet = vi.spyOn(api, 'get').mockResolvedValueOnce({
          ok: true,
          json: createJsonResponse(mockClassificationResponse),
        });

        const store = mockStore({ navigation: { includeRelated: false, isFetching: false, list: [] } });
        await store.dispatch(fetchNavigationThunk({ includeRelated: false, page: 1, token: 'test-token' }));

        expect(mockApiGet).toHaveBeenCalledWith(
          'classification',
          {
            include_related: false,
            page_size: expect.any(Number),
            page: 1,
          },
          {},
          'test-token',
        );
      });

      it('should handle pagination correctly', async () => {
        helpers.convertToTree.mockReturnValue([]);
        vi.spyOn(api, 'get')
          .mockResolvedValueOnce({
            ok: true,
            json: createJsonResponse(mockClassificationResponseWithNext),
          })
          .mockResolvedValueOnce({
            ok: true,
            json: createJsonResponse(mockClassificationResponsePage2),
          });

        const store = mockStore({ navigation: { includeRelated: false, isFetching: false, list: [] } });
        await store.dispatch(fetchNavigationThunk({ includeRelated: false, page: 1 }));

        const actions = store.getActions();

        const receiveActions = filterReceiveActions(actions);
        expect(receiveActions.length).toBe(2);
        expect(receiveActions[0].payload.page).toBe(1);
        expect(receiveActions[1].payload.page).toBe(2);
      });

      it('should prevent concurrent fetches when appropriate', async () => {
        const store = mockStore({
          navigation: {
            includeRelated: true,
            isFetching: true,
            list: [],
          },
        });

        const result = await store.dispatch(fetchNavigationThunk({ includeRelated: false, page: 1 }));

        expect(result.payload).toBeNull();
      });

      it('should handle fetch navigation error', async () => {
        const actions = await testAsyncThunk(
          fetchNavigationThunk({ includeRelated: false, page: 1 }),
          setupApiMockError('get', new Error('Network error')),
          { navigation: { includeRelated: false, isFetching: false, list: [] } },
        );

        expectAsyncActions(actions, 'navigation/fetchNavigation', 'rejected');
        expect(hasNavigationError(actions)).toBe(true);
      });

      it('should handle non-Error exceptions', async () => {
        const actions = await testAsyncThunk(
          fetchNavigationThunk({ includeRelated: false, page: 1 }),
          setupApiMockError('get', 'String error'),
          { navigation: { includeRelated: false, isFetching: false, list: [] } },
        );

        expectAsyncActions(actions, 'navigation/fetchNavigation', 'rejected');
        const rejectedAction = findRejectedAction(actions);
        expect(rejectedAction.payload).toBe('Failed to fetch navigation');
      });
    });
  });

  describe('Extra Reducers', () => {
    describe('fetchNavigationThunk lifecycle', () => {
      it('should handle pending state', () => {
        const action = {
          type: fetchNavigationThunk.pending.type,
          meta: { arg: { includeRelated: true } },
        };

        const result = testReducerAction(action);

        expect(result.isFetching).toBe(true);
        expect(result.includeRelated).toBe(true);
      });

      it('should handle fulfilled state', () => {
        const state = createMockState({ isFetching: true });
        const action = { type: fetchNavigationThunk.fulfilled.type };

        const result = testReducerAction(action, state);

        expect(result.isFetching).toBe(false);
      });

      it('should handle rejected state', () => {
        const state = createMockState({
          isFetching: true,
          list: [{ id: '1' }],
          items: [{ id: '1' }],
        });
        const action = { type: fetchNavigationThunk.rejected.type };

        const result = testReducerAction(action, state);

        expect(result.isFetching).toBe(false);
        expect(result.list).toEqual([]);
        expect(result.items).toEqual([]);
        expect(result.timestamp).toEqual(expect.any(String));
      });
    });
  });

  describe('Selectors', () => {
    const mockState = {
      navigation: createMockState({
        items: [{ id: '1', name: 'Item 1' }],
        isFetching: true,
        includeRelated: true,
        is_open: false,
        list: [{ id: '1' }, { id: '2' }],
        timestamp: '12345',
      }),
    };

    it('should select items', () => {
      expect(itemsSelector(mockState)).toEqual(mockState.navigation.items);
    });

    it('should select isFetching', () => {
      expect(isFetchingSelector(mockState)).toBe(true);
    });

    it('should select includeRelated', () => {
      expect(includeRelatedSelector(mockState)).toBe(true);
    });

    it('should select is_open', () => {
      expect(isOpenSelector(mockState)).toBe(false);
    });

    it('should select list', () => {
      expect(navigationListSelector(mockState)).toEqual(mockState.navigation.list);
    });

    it('should select timestamp', () => {
      expect(timestampSelector(mockState)).toBe('12345');
    });

    describe('navigationItemsSelector', () => {
      it('should return items when includeRelated is true', () => {
        const state = {
          navigation: createMockState({
            includeRelated: true,
            items: [{ id: '1' }],
          }),
        };
        expect(navigationItemsSelector(state)).toEqual([{ id: '1' }]);
      });

      it('should return empty array when includeRelated is false', () => {
        const state = {
          navigation: createMockState({
            includeRelated: false,
            items: [{ id: '1' }],
          }),
        };
        expect(navigationItemsSelector(state)).toEqual([]);
      });
    });
  });
});
