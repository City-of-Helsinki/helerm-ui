/* eslint-disable no-underscore-dangle */
import { cloneDeep } from 'lodash';

import { createTestStore } from '../../../utils/renderWithProviders';
import uiReducer, {
  initialState,
  fetchAttributeTypesThunk,
  fetchTemplatesThunk,
  uiSelector,
  errorSelector,
  templateByIdSelector,
  attributeTypeByIdentifierSelector,
} from '../ui';
import api from '../../../utils/api';

vi.mock('../../../utils/api', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('(Redux Module) UI', () => {
  describe('(Reducer) uiReducer', () => {
    let _initialState;
    beforeEach(() => {
      _initialState = cloneDeep(initialState);
      api.get.mockReset();
    });

    it('Should be a function.', () => {
      expect(uiReducer).toBeInstanceOf(Function);
    });

    it('Should initialize with a correct state', () => {
      expect(uiReducer(undefined, {})).toEqual(initialState);
    });

    it('Should return the previous state if an action was not matched.', () => {
      let state = uiReducer(undefined, {});
      expect(state).toEqual(_initialState);
      state = uiReducer(state, {
        type: 'DOESNOTACTUALLYEXISTLOL',
      });
      expect(state).toEqual(_initialState);
      state = uiReducer(state, {
        type: 'DOESNOTACTUALLYEXISTLOL',
      });
      expect(state).toEqual(_initialState);
    });

    describe('fetchAttributeTypesThunk', () => {
      const validationRules = {
        phase: {
          properties: {
            InformationSystem: { anyOf: [{ type: 'string' }, { type: 'array' }] },
          },
          required: ['InformationSystem'],
          allOf: [
            {
              oneOf: [
                {
                  required: ['InformationSystem'],
                  properties: { InformationSystem: { type: ['string'] } },
                },
              ],
            },
          ],
          extra_validations: { allow_values_outside_choices: ['InformationSystem'] },
        },
        record: {
          properties: { InformationSystem: {} },
          required: [],
        },
      };

      const attributes = {
        results: [
          {
            identifier: 'InformationSystem',
            index: 1,
            name: 'Info',
            values: true,
          },
          {
            identifier: 'NoValues',
            index: 2,
            name: 'NoValues',
            values: null,
          },
          {
            identifier: 'PhaseType',
            index: 3,
            name: 'PhaseType',
            values: [{ id: 'phase-1', value: 'Phase 1' }],
          },
          {
            identifier: 'ActionType',
            index: 4,
            name: 'ActionType',
            values: null,
          },
          {
            identifier: 'RecordType',
            index: 5,
            name: 'RecordType',
            values: [{ id: 'record-1', value: 'Record 1' }],
          },
        ],
      };

      it('sets isFetching on pending', () => {
        const state = uiReducer(_initialState, fetchAttributeTypesThunk.pending());
        expect(state.isFetching).toBe(true);
        expect(state.error).toBeNull();
      });

      it('processes attributes and type lists on fulfilled', async () => {
        api.get
          .mockResolvedValueOnce({ json: async () => validationRules })
          .mockResolvedValueOnce({ json: async () => attributes });

        const store = createTestStore();
        await store.dispatch(fetchAttributeTypesThunk());

        const state = store.getState().ui;
        expect(state.isFetching).toBe(false);
        expect(state.error).toBeNull();

        const infoSystem = state.attributeTypes.InformationSystem;
        expect(infoSystem.allowedIn).toEqual(['phase', 'record']);
        expect(infoSystem.defaultIn).toEqual(['phase', 'record']);
        expect(infoSystem.multiIn).toEqual(['phase']);
        expect(infoSystem.requiredIn).toEqual(['phase']);
        expect(infoSystem.requiredIf).toEqual([{ key: 'InformationSystem', values: ['string'] }]);
        expect(infoSystem.allowValuesOutsideChoicesIn).toEqual(['phase']);
        expect(infoSystem.required).toBe(false);

        expect(state.attributeTypes.NoValues).toBeUndefined();

        expect(state.phaseTypes.phase1).toEqual({ id: 'phase-1', value: 'Phase 1' });
        expect(state.recordTypes.record1).toEqual({ id: 'record-1', value: 'Record 1' });
        expect(state.actionTypes).toEqual({});
      });

      it('sets required to true when identifier is in record.required', async () => {
        api.get
          .mockResolvedValueOnce({
            json: async () => ({
              record: { properties: { RetentionPeriod: {} }, required: ['RetentionPeriod'] },
            }),
          })
          .mockResolvedValueOnce({
            json: async () => ({
              results: [{ identifier: 'RetentionPeriod', index: 1, name: 'Retention', values: true }],
            }),
          });

        const store = createTestStore();
        await store.dispatch(fetchAttributeTypesThunk());

        expect(store.getState().ui.attributeTypes.RetentionPeriod.required).toBe(true);
      });

      it('sets error message with fallback text when rejected without an Error instance', async () => {
         
        api.get.mockRejectedValueOnce('network down');

        const store = createTestStore();
        await store.dispatch(fetchAttributeTypesThunk());

        const state = store.getState().ui;
        expect(state.isFetching).toBe(false);
        expect(state.error).toBe('Failed to fetch attribute types');
      });

      it('sets error message from an Error instance when rejected', async () => {
        api.get.mockRejectedValueOnce(new Error('boom'));

        const store = createTestStore();
        await store.dispatch(fetchAttributeTypesThunk());

        expect(store.getState().ui.error).toBe('boom');
      });
    });

    describe('fetchTemplatesThunk', () => {
      it('sets isFetching on pending', () => {
        const state = uiReducer(_initialState, fetchTemplatesThunk.pending());
        expect(state.isFetching).toBe(true);
        expect(state.error).toBeNull();
      });

      it('processes templates on fulfilled', async () => {
        api.get.mockResolvedValueOnce({
          json: async () => ({ results: [{ id: 1, name: 'Template 1' }] }),
        });

        const store = createTestStore();
        await store.dispatch(fetchTemplatesThunk());

        const state = store.getState().ui;
        expect(state.isFetching).toBe(false);
        expect(state.error).toBeNull();
        expect(state.templates).toEqual([{ id: 1, name: 'Template 1' }]);
      });

      it('sets error message with fallback text when rejected without an Error instance', async () => {
         
        api.get.mockRejectedValueOnce('network down');

        const store = createTestStore();
        await store.dispatch(fetchTemplatesThunk());

        const state = store.getState().ui;
        expect(state.isFetching).toBe(false);
        expect(state.error).toBe('Failed to fetch templates');
      });
    });

    describe('selectors', () => {
      it('uiSelector returns the whole state', () => {
        expect(uiSelector({ ui: _initialState })).toEqual(_initialState);
      });

      it('errorSelector returns the error', () => {
        const state = { ..._initialState, error: 'oops' };
        expect(errorSelector({ ui: state })).toBe('oops');
      });

      it('templateByIdSelector finds a template by id', () => {
        const state = { ..._initialState, templates: [{ id: 1, name: 'One' }, { id: 2, name: 'Two' }] };
        expect(templateByIdSelector({ ui: state }, 2)).toEqual({ id: 2, name: 'Two' });
      });

      it('attributeTypeByIdentifierSelector finds an attribute type by identifier', () => {
        const state = { ..._initialState, attributeTypes: { Foo: { name: 'Foo' } } };
        expect(attributeTypeByIdentifierSelector({ ui: state }, 'Foo')).toEqual({ name: 'Foo' });
      });
    });
  });
});
