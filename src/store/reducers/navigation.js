import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';

import config from '../../config';
import { convertToTree, itemById } from '../../utils/helpers';
import api from '../../utils/api';

export const getTOS = (selectedTOS, items, classification) => {
  if (selectedTOS.classification) {
    return itemById(items, selectedTOS.classification.id);
  }

  if (classification.id) {
    return itemById(items, classification.id);
  }

  return null;
};

export const getTOSPath = (tos) => {
  if (tos?.tosPath) {
    return tos.tosPath;
  } else if (tos?.path) {
    return tos.path;
  }

  return [];
};

export const initialState = {
  includeRelated: false,
  isFetching: false,
  items: [],
  is_open: true,
  list: [],
  page: 1,
  timestamp: '',
};

export const fetchNavigationThunk = createAsyncThunk(
  'navigation/fetchNavigation',
  async ({ includeRelated = false, page = 1 }, { dispatch, getState, rejectWithValue }) => {
    try {
      const pageSize = includeRelated ? config.SEARCH_PAGE_SIZE : config.RESULTS_PER_PAGE;

      const state = getState().navigation;

      const includeRelatedAlreadySet = state.includeRelated;
      const { isFetching } = state;

      if (includeRelatedAlreadySet && !includeRelated && isFetching && page === 1) {
        // If we are in the middle of a recursive fetch, prevent firing another
        // search (e.g. returning immediately from bulkview to main page,
        // navigation tries to construct the classification tree menu
        // and another state update from a finishing recursive fetch crashes it).
        return null;
      }

      const response = await api.get('classification', {
        include_related: includeRelated,
        page_size: pageSize,
        page,
      });

      const json = await response.json();

      dispatch(
        receiveNavigationSliceAction({
          items: json.results,
          includeRelated,
          page,
        }),
      );

      if (json.next) {
        await dispatch(fetchNavigationThunk({ includeRelated, page: page + 1 }));
      } else {
        const list = getState().navigation.list || [];
        const orderedTree = convertToTree(list);
        dispatch(parseNavigationSliceAction({ items: orderedTree }));
      }

      return json;
    } catch (error) {
      dispatch(navigationErrorSliceAction());
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch navigation');
    }
  },
);

const navigationSlice = createSlice({
  name: 'navigation',
  initialState,
  reducers: {
    parseNavigation: (state, action) => {
      state.isFetching = false;
      state.items = action.payload.items;
      state.timestamp = Date.now().toString();
    },
    setNavigationVisibility: (state, action) => {
      state.is_open = action.payload;
    },
    navigationError: (state) => {
      state.list = [];
      state.isFetching = false;
      state.items = [];
      state.timestamp = Date.now().toString();
    },
    receiveNavigation: (state, action) => {
      state.includeRelated = action.payload.includeRelated;

      if (action.payload.page > 1) {
        state.list = [...state.list, ...action.payload.items];
      } else {
        state.list = action.payload.items;
      }

      state.page = action.payload.page;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNavigationThunk.pending, (state, action) => {
        const { includeRelated } = action.meta.arg || {};

        state.isFetching = true;

        if (includeRelated !== undefined) {
          state.includeRelated = includeRelated;
        }
      })
      .addCase(fetchNavigationThunk.fulfilled, (state) => {
        state.isFetching = false;
      })
      .addCase(fetchNavigationThunk.rejected, (state) => {
        state.list = [];
        state.isFetching = false;
        state.items = [];
        state.timestamp = Date.now().toString();
      });
  },
  selectors: {
    itemsSelector: (state) => state.items,
    isFetchingSelector: (state) => state.isFetching,
    includeRelatedSelector: (state) => state.includeRelated,
    isOpenSelector: (state) => state.is_open,
    navigationListSelector: (state) => state.list,
    timestampSelector: (state) => state.timestamp,
    // Memoized selector to get items based on includeRelated flag
    navigationItemsSelector: createSelector(
      [(state) => state.includeRelated, (state) => state.items],
      (includeRelated, items) => (includeRelated ? items : []),
    ),
  },
});

export const {
  parseNavigation: parseNavigationSliceAction,
  setNavigationVisibility,
  navigationError: navigationErrorSliceAction,
  receiveNavigation: receiveNavigationSliceAction,
} = navigationSlice.actions;

export const {
  itemsSelector,
  isFetchingSelector,
  includeRelatedSelector,
  isOpenSelector,
  navigationListSelector,
  timestampSelector,
  navigationItemsSelector,
} = navigationSlice.selectors;

export default navigationSlice.reducer;
