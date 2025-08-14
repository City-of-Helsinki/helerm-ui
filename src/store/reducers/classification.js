import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import api from '../../utils/api';
import { fetchNavigationThunk } from './navigation';

export const initialState = {
  id: null,
  function: null,
  code: null,
  parent: null,
  title: null,
  description: null,
  description_internal: null,
  related_classification: null,
  additional_information: null,
  state: null,
  created_at: null,
  modified_at: null,
  isFetching: false,

  version: null,
  version_history: [],
  function_allowed: false,
  function_version: null,
  error: null,
};

export const fetchClassificationThunk = createAsyncThunk(
  'classification/fetchClassification',
  async ({ id, params = {} }, { rejectWithValue }) => {
    try {
      const response = await api.get(`classification/${id}`, params);

      if (!response.ok) {
        throw new URIError(response.statusText);
      }

      const data = await response.json();

      return { ...initialState, ...data };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch classification');
    }
  },
);

export const createTosThunk = createAsyncThunk(
  'classification/createTos',
  async (_, { dispatch, getState, rejectWithValue }) => {
    try {
      const classification = { ...getState().classification };
      const newTos = {
        classification: { id: classification.id, version: classification.version },
      };

      const response = await api.post('function', newTos);

      if (!response.ok) {
        throw Error(response.statusText);
      }

      const json = await response.json();

      const { includeRelated } = getState().navigation;

      dispatch(fetchNavigationThunk({ includeRelated }));

      return json;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create TOS');
    }
  },
);

const classificationSlice = createSlice({
  name: 'classification',
  initialState,
  reducers: {
    clearClassification: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchClassificationThunk.pending, (state) => {
        state.isFetching = true;
        state.error = null;
      })
      .addCase(fetchClassificationThunk.fulfilled, (state, action) => {
        return { ...state, ...action.payload, isFetching: false, error: null };
      })
      .addCase(fetchClassificationThunk.rejected, (state, action) => {
        state.isFetching = false;
        state.error = action.payload || 'Failed to fetch classification';
      })

      .addCase(createTosThunk.pending, (state) => {
        state.isFetching = true;
        state.error = null;
      })
      .addCase(createTosThunk.fulfilled, (state, action) => {
        state.isFetching = false;
        state.function = action.payload.id;
        state.function_version = action.payload.version;
        state.error = null;
      })
      .addCase(createTosThunk.rejected, (state, action) => {
        state.isFetching = false;
        state.error = action.payload || 'Failed to create TOS';
      });
  },
  selectors: {
    classificationSelector: (state) => state,
    idSelector: (state) => state.id,
    functionSelector: (state) => state.function,
    codeSelector: (state) => state.code,
    titleSelector: (state) => state.title,
    descriptionSelector: (state) => state.description,
    stateSelector: (state) => state.state,
    versionSelector: (state) => state.version,
    versionHistorySelector: (state) => state.version_history,
    descriptionInternalSelector: (state) => state.description_internal,
    relatedClassificationSelector: (state) => state.related_classification,
    additionalInformationSelector: (state) => state.additional_information,
    parentSelector: (state) => state.parent,
    isFetchingSelector: (state) => state.isFetching,
    errorSelector: (state) => state.error,
    hasFunctionSelector: (state) => !!state.function,
    canCreateTosSelector: (state) => !state.function && state.function_allowed,
    createdAtSelector: (state) => state.created_at,
    modifiedAtSelector: (state) => state.modified_at,
    functionVersionSelector: (state) => state.function_version,
  },
});

export const { clearClassification } = classificationSlice.actions;

export const {
  classificationSelector,
  idSelector,
  functionSelector,
  codeSelector,
  titleSelector,
  descriptionSelector,
  stateSelector,
  versionSelector,
  versionHistorySelector,
  descriptionInternalSelector,
  relatedClassificationSelector,
  additionalInformationSelector,
  parentSelector,
  isFetchingSelector,
  errorSelector,
  hasFunctionSelector,
  canCreateTosSelector,
  createdAtSelector,
  modifiedAtSelector,
  functionVersionSelector,
} = classificationSlice.selectors;

export default classificationSlice.reducer;
