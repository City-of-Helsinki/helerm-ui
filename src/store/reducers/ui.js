import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import find from 'lodash/find';

import api from '../../utils/api';

export const initialState = {
  isFetching: false,
  phaseTypes: {},
  actionTypes: {},
  recordTypes: {},
  attributeTypes: {},
  templates: [],
  error: null,
};

export const fetchAttributeTypesThunk = createAsyncThunk('ui/fetchAttributeTypes', async (_, { rejectWithValue }) => {
  try {
    const validationRulesResponse = await api.get('attribute/schemas');
    const validationRules = await validationRulesResponse.json();

    const attributesResponse = await api.get('attribute', { page_size: 999 });
    const attributes = await attributesResponse.json();

    const processedData = {
      attributes,
      validationRules,
      processedAttributes: processAttributeTypes(attributes, validationRules),
    };

    return processedData;
  } catch (error) {
    return rejectWithValue({
      message: error instanceof Error ? error.message : 'Failed to fetch attribute types',
      error,
    });
  }
});

export const fetchTemplatesThunk = createAsyncThunk('ui/fetchTemplates', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('template');
    const templates = await response.json();

    const processedTemplates = templates.results.map((item) => ({
      id: item.id,
      name: item.name,
    }));

    return {
      raw: templates,
      processed: processedTemplates,
    };
  } catch (error) {
    return rejectWithValue({
      message: error instanceof Error ? error.message : 'Failed to fetch templates',
      error,
    });
  }
});

const processTypeList = (types, list) => {
  if (!types?.values) {
    return;
  }

  types.values.forEach((result) => {
    const trimmedResult = result.id.replace(/-/g, '');
    list[trimmedResult] = {
      id: result.id,
      value: result.value,
    };
  });
};

const processAttributeTypes = (attributes, validationRules) => {
  const attributeTypeList = {};

  attributes.results.forEach((result) => {
    if (result.values) {
      const allowedIn = [];
      const defaultIn = [];
      let required = false;

      Object.keys(validationRules).forEach((rule) => {
        if (Object.hasOwn(validationRules, rule) && validationRules[rule].properties[result.identifier]) {
          allowedIn.push(rule);
        }
      });

      validationRules.record.required.forEach((rule) => {
        if (rule === result.identifier) {
          required = true;
        }
      });

      const multiIn = Object.keys(validationRules)
        .filter((key) => validationRules[key].properties[result.identifier]?.anyOf)
        .filter((key) =>
          find(validationRules[key].properties[result.identifier]?.anyOf, (item) => item.type === 'array'),
        );

      const requiredIn = Object.keys(validationRules)
        .filter((key) => validationRules[key]?.required)
        .filter((key) => validationRules[key]?.required.some((rule) => rule === result.identifier));

      Object.keys(validationRules).forEach((key) => {
        if (result.identifier === 'InformationSystem') {
          defaultIn.push(key);
        }
      });

      const requiredMap = Object.keys(validationRules)
        .filter((key) => validationRules[key]?.allOf)
        .map((key) => validationRules[key]?.allOf)
        .flatMap((allOfs) => allOfs.flatMap((allOf) => allOf.oneOf))
        .filter((oneOf) => oneOf.required.length > 0)
        .filter((oneOf) => oneOf.required.some((requiredKey) => result.identifier === requiredKey))
        .map((oneOf) => oneOf.properties)
        .map((properties) =>
          Object.keys(properties).map((propertyKey) => {
            const property = properties[propertyKey];
            const values = Object.keys(property)
              // eslint-disable-next-line sonarjs/no-nested-functions
              .map((valueKey) => property[valueKey])
              // eslint-disable-next-line sonarjs/no-nested-functions
              .flatMap((value) => value);

            return { key: propertyKey, values };
          }),
        )
        .flatMap((items) => items);

      const requiredIf = requiredMap.filter(
        (value, index, self) => index === self.findIndex((item) => item.key === value.key),
      );

      const allowValuesOutsideChoicesIn = Object.keys(validationRules)
        .filter((key) => validationRules[key].extra_validations)
        .filter((key) => validationRules[key].extra_validations?.allow_values_outside_choices)
        .filter((key) =>
          validationRules[key].extra_validations?.allow_values_outside_choices?.some(
            (field) => field === result.identifier,
          ),
        );

      attributeTypeList[result.identifier] = {
        index: result.index,
        name: result.name,
        values: result.values,
        allowedIn,
        defaultIn,
        multiIn,
        requiredIf,
        requiredIn,
        required,
        allowValuesOutsideChoicesIn,
      };
    }
  });

  return attributeTypeList;
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  extraReducers: (builder) => {
    builder
      .addCase(fetchAttributeTypesThunk.pending, (state) => {
        state.isFetching = true;
        state.error = null;
      })
      .addCase(fetchAttributeTypesThunk.fulfilled, (state, action) => {
        const attributeTypeList = action.payload.processedAttributes;

        const phaseTypes = attributeTypeList.PhaseType;
        const actionTypes = attributeTypeList.ActionType;
        const recordTypes = attributeTypeList.RecordType;
        const phaseTypeList = {};
        const actionTypeList = {};
        const recordTypeList = {};

        processTypeList(phaseTypes, phaseTypeList);
        processTypeList(actionTypes, actionTypeList);
        processTypeList(recordTypes, recordTypeList);

        state.attributeTypes = attributeTypeList;
        state.phaseTypes = phaseTypeList;
        state.actionTypes = actionTypeList;
        state.recordTypes = recordTypeList;
        state.isFetching = false;
        state.error = null;
      })
      .addCase(fetchAttributeTypesThunk.rejected, (state, action) => {
        state.isFetching = false;
        state.error = action.payload?.message || 'Failed to fetch attribute types';
      })
      .addCase(fetchTemplatesThunk.pending, (state) => {
        state.isFetching = true;
        state.error = null;
      })
      .addCase(fetchTemplatesThunk.fulfilled, (state, action) => {
        state.templates = action.payload.processed;
        state.isFetching = false;
        state.error = null;
      })
      .addCase(fetchTemplatesThunk.rejected, (state, action) => {
        state.isFetching = false;
        state.error = action.payload?.message || 'Failed to fetch templates';
      });
  },
  selectors: {
    uiSelector: (state) => state,
    attributeTypesSelector: (state) => state.attributeTypes,
    phaseTypesSelector: (state) => state.phaseTypes,
    actionTypesSelector: (state) => state.actionTypes,
    recordTypesSelector: (state) => state.recordTypes,
    templatesSelector: (state) => state.templates,
    isFetchingSelector: (state) => state.isFetching,
    errorSelector: (state) => state.error,
    templateByIdSelector: (state, templateId) => state.templates.find((template) => template.id === templateId),
    attributeTypeByIdentifierSelector: (state, identifier) => state.attributeTypes[identifier],
  },
});

export const {
  uiSelector,
  attributeTypesSelector,
  phaseTypesSelector,
  actionTypesSelector,
  recordTypesSelector,
  templatesSelector,
  isFetchingSelector,
  errorSelector,
  templateByIdSelector,
  attributeTypeByIdentifierSelector,
} = uiSlice.selectors;

export default uiSlice.reducer;
