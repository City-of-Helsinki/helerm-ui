/* eslint-disable sonarjs/todo-tag */
/* eslint-disable no-alert */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cloneDeep, isEmpty, values } from 'lodash';

import { fetchNavigationThunk } from '../navigation';
import api from '../../../utils/api';
import { normalizeTosFromApi, normalizeTosForApi } from '../../../utils/helpers';
import { addActionReducer, editActionReducer, editActionAttributeReducer, removeActionReducer, setActionVisibilityReducer } from './action';
import {
  addPhaseReducer,
  editPhaseReducer,
  editPhaseAttributeReducer,
  removePhaseReducer,
  setPhaseAttributesVisibilityReducer,
  setPhaseVisibilityReducer,
  setPhasesVisibilityReducer
} from './phase';
import {
  addRecordReducer,
  editRecordReducer,
  editRecordAttributeReducer,
  removeRecordReducer,
  setRecordVisibilityReducer
} from './record';
import { executeImportReducer, importItemsThunk } from './importView';
import { receiveTemplateReducer, cloneFromTemplateThunk } from './cloneView';
import { executeOrderChangeReducer, changeOrderThunk } from './reorder';

export const initialState = {
  id: null,
  function_id: null,
  parent: null,
  version: null,
  name: null,
  error_count: null,
  state: null,
  created_at: null,
  modified_at: null,
  modified_by: null,
  valid_from: null,
  valid_to: null,
  actions: {},
  phases: {},
  records: {},
  attributes: {},
  documentState: 'view',
  lastUpdated: 0,
  isFetching: false,
  is_classification_open: false,
  is_open: false,
  is_version_open: false
};

export const fetchTOSThunk = createAsyncThunk(
  'selectedTOS/fetchTOS',
  async ({ tosId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await api.get(`function/${tosId}`, params);

      if (!response.ok) {
        throw new URIError(response.statusText);
      }

      const json = await response.json();

      return json;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch TOS');
    }
  }
);

export const saveDraftThunk = createAsyncThunk(
  'selectedTOS/saveDraft',
  async (_, { getState, rejectWithValue }) => {
    try {
      const tos = cloneDeep(getState().selectedTOS);
      const newTos = cloneDeep(tos);
      const finalPhases = normalizeTosForApi(newTos);
      const denormalizedTos = { ...tos, phases: finalPhases };
      const currentVersion = tos.version;

      const response = await api.put(`function/${tos.id}`, denormalizedTos);

      if (!response.ok) {
        const json = await response.json();
        const message = !isEmpty(json) ? values(json).join(',') : response.statusText;
        throw new Error(message);
      }

      const json = await response.json();

      if (json.version !== currentVersion + 1) {
        alert(
          `Muokkasit luonnoksen versiota ${currentVersion}, ` +
          `mutta tallennettaessa versionumero kasvoi enemmän ` +
          `kuin yhdellä. Tarkistathan, että tallentamasi luonnoksen (versio ${json.version}) tiedot ovat ajantasalla.`
        );
      }

      return json;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to save draft');
    }
  }
);

export const changeStatusThunk = createAsyncThunk(
  'selectedTOS/changeStatus',
  async (status, { getState, dispatch, rejectWithValue }) => {
    try {
      const tos = { ...getState().selectedTOS };
      const { includeRelated } = getState().navigation;

      const response = await api.patch(`function/${tos.id}`, { state: status });

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      const json = await response.json();
      dispatch(fetchNavigationThunk({ includeRelated }));
      return json;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to change status');
    }
  }
);

const updateStateWithNormalizedTos = (state, tosData) => {
  const normalizedTos = normalizeTosFromApi(tosData);
  const tos = normalizedTos.entities.tos[normalizedTos.result];

  Object.assign(state, tos);
  state.attributes = tos.attributes;
  state.actions = normalizedTos.entities.actions || {};
  state.phases = normalizedTos.entities.phases || {};
  state.records = normalizedTos.entities.records || {};
  state.lastUpdated = Date.now();
  state.isFetching = false;
};

const tosSlice = createSlice({
  name: 'selectedTOS',
  initialState,
  reducers: {
    clearTos: () => initialState,
    resetTos: (state, action) => {
      return { ...initialState, ...action.payload };
    },
    editMetaData: (state, action) => {
      const attributes = action.payload;
      const editedMetaData = {};

      Object.keys(attributes).forEach((key) => {
        if (Object.hasOwn(attributes, key) && attributes[key].checked) {
          editedMetaData[key] = attributes[key].value;
        }
      });

      state.attributes = editedMetaData;
    },
    editValidDates: (state, action) => {
      if (action.payload.validFrom !== undefined) {
        state.valid_from = action.payload.validFrom;
      }
      if (action.payload.validTo !== undefined) {
        state.valid_to = action.payload.validTo;
      }
    },
    setDocumentState: (state, action) => {
      state.documentState = action.payload;
    },
    setClassificationVisibility: (state, action) => {
      state.is_classification_open = action.payload;
    },
    setMetadataVisibility: (state, action) => {
      state.is_open = action.payload;
    },
    setVersionVisibility: (state, action) => {
      state.is_version_open = action.payload;
    },
    updateTosVisibility: (state, action) => {
      const { actions, phases, records, basicVisibility, metaDataVisibility } = action.payload;
      state.actions = actions;
      state.phases = phases;
      state.records = records;
      state.is_classification_open = basicVisibility;
      state.is_open = metaDataVisibility;
      state.is_version_open = metaDataVisibility;
    },

    addAction: addActionReducer,
    editAction: editActionReducer,
    editActionAttribute: editActionAttributeReducer,
    removeAction: removeActionReducer,
    setActionVisibility: setActionVisibilityReducer,

    addPhase: addPhaseReducer,
    editPhase: editPhaseReducer,
    editPhaseAttribute: editPhaseAttributeReducer,
    removePhase: removePhaseReducer,
    setPhaseAttributesVisibility: setPhaseAttributesVisibilityReducer,
    setPhaseVisibility: setPhaseVisibilityReducer,
    setPhasesVisibility: setPhasesVisibilityReducer,

    addRecord: addRecordReducer,
    editRecord: editRecordReducer,
    editRecordAttribute: editRecordAttributeReducer,
    removeRecord: removeRecordReducer,
    setRecordVisibility: setRecordVisibilityReducer,

    executeImport: executeImportReducer,
    receiveTemplate: receiveTemplateReducer,
    executeOrderChange: executeOrderChangeReducer
  },
  extraReducers: (builder) => {
    builder
      .addCase(importItemsThunk.fulfilled, executeImportReducer)
      .addCase(cloneFromTemplateThunk.fulfilled, receiveTemplateReducer)
      .addCase(changeOrderThunk.fulfilled, (state, action) => {
        if (!action.payload) return;

        executeOrderChangeReducer(state, action);
      })

      .addMatcher(
        (action) => action.type.endsWith('/pending') && [
          fetchTOSThunk.pending.type,
          saveDraftThunk.pending.type,
          changeStatusThunk.pending.type
        ].includes(action.type),
        (state) => {
          state.isFetching = true;
        }
      )
      .addMatcher(
        (action) => action.type.endsWith('/fulfilled') && [
          fetchTOSThunk.fulfilled.type,
          saveDraftThunk.fulfilled.type,
          changeStatusThunk.fulfilled.type
        ].includes(action.type),
        (state, action) => {
          updateStateWithNormalizedTos(state, action.payload);
        }
      )
      .addMatcher(
        (action) => action.type.endsWith('/rejected') && [
          fetchTOSThunk.rejected.type,
          saveDraftThunk.rejected.type,
          changeStatusThunk.rejected.type
        ].includes(action.type),
        (state) => {
          state.isFetching = false;
        }
      )
  },
  selectors: {
    selectedTOSSelector: (state) => state,
    isFetchingSelector: (state) => state.isFetching
  }
});

export const { selectedTOSSelector, isFetchingSelector } = tosSlice.selectors;

export const {
  clearTos,
  resetTos,
  editMetaData,
  editValidDates,
  setDocumentState,
  setClassificationVisibility,
  setMetadataVisibility,
  updateTosVisibility,
  setVersionVisibility,

  // Action reducers
  addAction,
  editAction,
  editActionAttribute,
  removeAction,
  setActionVisibility,

  // Phase reducers
  addPhase,
  editPhase,
  editPhaseAttribute,
  removePhase,
  setPhaseAttributesVisibility,
  setPhaseVisibility,
  setPhasesVisibility,

  // Record reducers
  addRecord,
  editRecord,
  editRecordAttribute,
  removeRecord,
  setRecordVisibility,

  // Other reducers
  executeImport,
  receiveTemplate,
  executeOrderChange
} = tosSlice.actions;

export default tosSlice.reducer;
