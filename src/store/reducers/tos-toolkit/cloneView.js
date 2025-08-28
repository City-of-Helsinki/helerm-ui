import { createAsyncThunk } from '@reduxjs/toolkit';

import { normalizeTosFromApi } from '../../../utils/helpers';
import api from '../../../utils/api';

export const cloneFromTemplateThunk = createAsyncThunk(
  'selectedTOS/cloneFromTemplate',
  async ({ endpoint, id, token }, { rejectWithValue }) => {
    try {
      const response = await api.get(`${endpoint}/${id}`, {}, {}, token);

      if (!response.ok) {
        throw new URIError(response.statusText);
      }

      const template = await response.json();
      return template;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to clone template');
    }
  },
);

export const receiveTemplateReducer = (state, action) => {
  const template = action.payload;
  const {
    entities: { tos, phases, actions, records },
    result,
  } = normalizeTosFromApi(template);

  state.attributes = { ...state.attributes, ...(tos[result].attributes || {}) };
  state.actions = { ...state.actions, ...(actions || {}) };
  state.phases = { ...state.phases, ...(phases || {}) };
  state.records = { ...state.records, ...(records || {}) };
  state.lastUpdated = Date.now();
  state.documentState = 'edit';
  state.isFetching = false;
  state.is_open = false;
  state.valid_from = null;
  state.valid_to = null;

  return state;
};
