import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { isArray, orderBy } from 'lodash';

import { DEFAULT_PAGE_SIZE } from '../../constants';
import api from '../../utils/api';

export const initialState = {
  selectedBulk: null,
  bulkUpdates: [],
  isFetching: false,
  isFetchingSelected: false,
  isSaving: false,
  isUpdating: false,
};

export const fetchBulkUpdatesThunk = createAsyncThunk(
  'bulk/fetchBulkUpdates',
  async ({ includeApproved = false, token }, { rejectWithValue }) => {
    try {
      const params = includeApproved ? { include_approved: true, page_size: DEFAULT_PAGE_SIZE } : {};
      const response = await api.get('bulk-update', params, {}, token);

      const data = await response.json();
      const results = data.results || [];

      return results;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch bulk updates');
    }
  },
);

export const fetchBulkUpdateThunk = createAsyncThunk(
  'bulk/fetchBulkUpdate',
  async ({ id, token }, { rejectWithValue }) => {
    try {
      const response = await api.get(`bulk-update/${id}`, { include_approved: true }, {}, token);
      const data = await response.json();

      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch bulk update');
    }
  },
);

export const approveBulkUpdateThunk = createAsyncThunk(
  'bulk/approveBulkUpdate',
  async ({ id, token }, { rejectWithValue }) => {
    try {
      const response = await api.post(`bulk-update/${id}/approve`, {}, {}, {}, token);
      if (!response.ok) {
        throw Error(response.statusText);
      }

      return true;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to approve bulk update');
    }
  },
);

export const deleteBulkUpdateThunk = createAsyncThunk(
  'bulk/deleteBulkUpdate',
  async ({ id, token }, { rejectWithValue }) => {
    try {
      const response = await api.del(`bulk-update/${id}`, {}, {}, token);
      if (!response.ok) {
        throw Error(response.statusText);
      }

      return true;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete bulk update');
    }
  },
);

export const saveBulkUpdateThunk = createAsyncThunk(
  'bulk/saveBulkUpdate',
  async ({ bulkUpdate, token }, { rejectWithValue }) => {
    try {
      const response = await api.post('bulk-update', bulkUpdate, {}, {}, token);
      const data = await response.json();

      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to save bulk update');
    }
  },
);

export const updateBulkUpdateThunk = createAsyncThunk(
  'bulk/updateBulkUpdate',
  async ({ id, bulkUpdate, token }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`bulk-update/${id}`, bulkUpdate, {}, {}, token);
      const data = await response.json();

      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update bulk update');
    }
  },
);

const bulkSlice = createSlice({
  name: 'bulk',
  initialState,
  reducers: {
    clearSelectedBulkUpdate: (state) => {
      state.selectedBulk = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBulkUpdatesThunk.pending, (state) => {
        state.isFetching = true;
      })
      .addCase(fetchBulkUpdatesThunk.fulfilled, (state, action) => {
        const sortedBulkUpdates = isArray(action.payload) ? orderBy(action.payload, ['created_at'], ['desc']) : [];

        state.bulkUpdates = sortedBulkUpdates;
        state.isFetching = false;
      })
      .addCase(fetchBulkUpdatesThunk.rejected, (state) => {
        state.isFetching = false;
      })

      .addCase(fetchBulkUpdateThunk.pending, (state) => {
        state.isFetchingSelected = true;
      })
      .addCase(fetchBulkUpdateThunk.fulfilled, (state, action) => {
        state.selectedBulk = action.payload;
        state.isFetchingSelected = false;
      })
      .addCase(fetchBulkUpdateThunk.rejected, (state) => {
        state.isFetchingSelected = false;
      })

      .addCase(approveBulkUpdateThunk.pending, (state) => {
        state.isFetching = true;
      })
      .addCase(approveBulkUpdateThunk.fulfilled, (state) => {
        state.isFetching = false;
      })
      .addCase(approveBulkUpdateThunk.rejected, (state) => {
        state.isFetching = false;
      })

      .addCase(deleteBulkUpdateThunk.pending, (state) => {
        state.isFetching = true;
      })
      .addCase(deleteBulkUpdateThunk.fulfilled, (state) => {
        state.selectedBulk = null;
        state.isFetching = false;
      })
      .addCase(deleteBulkUpdateThunk.rejected, (state) => {
        state.isFetching = false;
      })

      .addCase(saveBulkUpdateThunk.pending, (state) => {
        state.isSaving = true;
      })
      .addCase(saveBulkUpdateThunk.fulfilled, (state) => {
        state.isSaving = false;
      })
      .addCase(saveBulkUpdateThunk.rejected, (state) => {
        state.isSaving = false;
      })

      .addCase(updateBulkUpdateThunk.pending, (state) => {
        state.isUpdating = true;
      })
      .addCase(updateBulkUpdateThunk.fulfilled, (state, action) => {
        state.selectedBulk = action.payload;
        state.isUpdating = false;
      })
      .addCase(updateBulkUpdateThunk.rejected, (state) => {
        state.isUpdating = false;
      });
  },
  selectors: {
    selectedBulkSelector: (state) => state.selectedBulk,
    bulkUpdatesSelector: (state) => state.bulkUpdates,
    isFetchingSelector: (state) => state.isFetching,
    isUpdatingSelector: (state) => state.isUpdating,
  },
});

export const { clearSelectedBulkUpdate } = bulkSlice.actions;

export const { selectedBulkSelector, bulkUpdatesSelector, isFetchingSelector, isUpdatingSelector } =
  bulkSlice.selectors;

export default bulkSlice.reducer;
