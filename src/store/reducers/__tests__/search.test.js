import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import searchReducer, {
  initialState,
  fetchClassificationsThunk,
  updateAttributeTypesThunk,
  searchItemsThunk,
  resetSuggestionsThunk,
  classificationsError,
  classificationsReady,
  requestClassifications,
  receiveClassifications,
  filterItemsThunk,
  searchSuggestionsAction,
  toggleAttribute,
  toggleShowAllAttributeOptions,
} from '../search';
import api from '../../../utils/api';
import { TYPE_CLASSIFICATION, TYPE_FUNCTION, TYPE_ACTION, TYPE_PHASE, TYPE_RECORD } from '../../../constants';
import { classification, attributeTypes as mockAttributeTypes } from '../../../utils/__mocks__/mockHelpers';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

vi.mock('../../../utils/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock('../../../config', () => ({
  default: {
    SEARCH_PAGE_SIZE: 10,
  },
}));

const mockClassifications = classification;

const createMappedClassifications = () =>
  classification.map((item) => ({
    id: item.id,
    type: TYPE_CLASSIFICATION,
    title: item.title,
    code: item.code,
    attributes: {
      name: `${item.code} ${item.title}`,
      ...item.function_attributes,
    },
  }));

const createAttributeOption = (value, ref, hits, selected = false) => ({
  value,
  ref,
  hits,
  selected,
});

const createAttribute = (key, name, type, options = []) => ({
  key,
  name,
  type,
  options,
  open: false,
  showAll: false,
});

const createTestStore = (customState = {}) => {
  const state = {
    search: {
      ...initialState,
      ...customState,
    },
    ui: { attributeTypes: mockAttributeTypes },
  };
  return mockStore(state);
};

const HEALTH_GUIDANCE_ID = 'test-classification-health-guidance-001';
const EDUCATION_ID = 'test-classification-education-001';
const EDUCATION_CHILD_ID = 'test-classification-education-child-001';

describe('Search reducer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial state', () => {
    it('should return the initial state', () => {
      expect(searchReducer(undefined, {})).toEqual(initialState);
    });
  });

  describe('Action creators', () => {
    it('should handle classificationsError', () => {
      const action = classificationsError();
      const nextState = searchReducer(initialState, action);
      expect(nextState.isFetching).toBe(false);
      expect(nextState.items).toEqual([]);
    });

    it('should handle classificationsReady', () => {
      const state = { ...initialState, isFetching: true };
      const action = classificationsReady();
      const nextState = searchReducer(state, action);
      expect(nextState.isFetching).toBe(false);
    });

    it('should handle requestClassifications', () => {
      const action = requestClassifications();
      const nextState = searchReducer(initialState, action);
      expect(nextState.isFetching).toBe(true);
    });

    it('should handle receiveClassifications', () => {
      const items = classification.map((item) => ({
        ...item,
        type: TYPE_CLASSIFICATION,
        attributes: {
          name: `${item.code} ${item.title}`,
          description: item.description,
        },
      }));

      const action = receiveClassifications({ items, page: 1 });
      const nextState = searchReducer(initialState, action);

      expect(nextState.items).toHaveLength(items.length);
      expect(nextState.items[0].id).toEqual(items[0].id);
      expect(nextState.items[0].type).toEqual(TYPE_CLASSIFICATION);
      expect(nextState.page).toBe(1);
      expect(nextState.classifications.length).toEqual(classification.length);
      expect(nextState.headers).toBeTruthy();
    });

    it('should preserve UI state (open/showAll) from existing filteredAttributes when receiving classifications', () => {
      // Set up initial state with existing filteredAttributes that have UI state
      const existingFilteredAttributes = [
        {
          key: 'name',
          name: 'Nimi',
          type: TYPE_CLASSIFICATION,
          open: true,
          showAll: true,
          options: [],
        },
        {
          key: 'description',
          name: 'Kuvaus',
          type: TYPE_CLASSIFICATION,
          open: false,
          showAll: false,
          options: [],
        },
        {
          key: 'function_state',
          name: 'Tila',
          type: TYPE_FUNCTION,
          open: true,
          showAll: false,
          options: [],
        },
      ];

      const stateWithExistingAttributes = {
        ...initialState,
        attributes: [
          { key: 'name', name: 'Nimi', type: TYPE_CLASSIFICATION, options: [] },
          { key: 'description', name: 'Kuvaus', type: TYPE_CLASSIFICATION, options: [] },
          { key: 'function_state', name: 'Tila', type: TYPE_FUNCTION, options: [] },
        ],
        filteredAttributes: existingFilteredAttributes,
      };

      const items = classification.map((item) => ({
        ...item,
        type: TYPE_CLASSIFICATION,
        attributes: {
          name: `${item.code} ${item.title}`,
          description: item.description,
        },
      }));

      const action = receiveClassifications({ items, page: 1 });
      const nextState = searchReducer(stateWithExistingAttributes, action);

      // Find the preserved attributes
      const nameAttr = nextState.filteredAttributes.find((attr) => attr.key === 'name' && attr.type === TYPE_CLASSIFICATION);
      const descriptionAttr = nextState.filteredAttributes.find(
        (attr) => attr.key === 'description' && attr.type === TYPE_CLASSIFICATION,
      );
      const functionStateAttr = nextState.filteredAttributes.find(
        (attr) => attr.key === 'function_state' && attr.type === TYPE_FUNCTION,
      );

      // Verify UI state was preserved
      expect(nameAttr).toBeDefined();
      expect(nameAttr.open).toBe(true);
      expect(nameAttr.showAll).toBe(true);

      expect(descriptionAttr).toBeDefined();
      expect(descriptionAttr.open).toBe(false);
      expect(descriptionAttr.showAll).toBe(false);

      expect(functionStateAttr).toBeDefined();
      expect(functionStateAttr.open).toBe(true);
      expect(functionStateAttr.showAll).toBe(false);
    });

    it('should set default UI state (open: false, showAll: false) for new attributes not in existing filteredAttributes', () => {
      // Set up initial state with some existing filteredAttributes
      const existingFilteredAttributes = [
        {
          key: 'name',
          name: 'Nimi',
          type: TYPE_CLASSIFICATION,
          open: true,
          showAll: true,
          options: [],
        },
      ];

      const stateWithExistingAttributes = {
        ...initialState,
        attributes: [
          { key: 'name', name: 'Nimi', type: TYPE_CLASSIFICATION, options: [], open: false, showAll: false },
          { key: 'description', name: 'Kuvaus', type: TYPE_CLASSIFICATION, options: [], open: false, showAll: false },
          { key: 'additional_information', name: 'Lisätiedot', type: TYPE_CLASSIFICATION, options: [], open: false, showAll: false },
        ],
        filteredAttributes: existingFilteredAttributes,
      };

      const items = classification.map((item) => ({
        ...item,
        type: TYPE_CLASSIFICATION,
        attributes: {
          name: `${item.code} ${item.title}`,
          description: item.description,
          additional_information: item.additional_information,
        },
      }));

      const action = receiveClassifications({ items, page: 1 });
      const nextState = searchReducer(stateWithExistingAttributes, action);

      // Find the new attribute (not in existing filteredAttributes)
      const descriptionAttr = nextState.filteredAttributes.find(
        (attr) => attr.key === 'description' && attr.type === TYPE_CLASSIFICATION,
      );
      const additionalInfoAttr = nextState.filteredAttributes.find(
        (attr) => attr.key === 'additional_information' && attr.type === TYPE_CLASSIFICATION,
      );

      // Verify new attributes have default UI state
      expect(descriptionAttr).toBeDefined();
      expect(descriptionAttr.open).toBe(false);
      expect(descriptionAttr.showAll).toBe(false);

      expect(additionalInfoAttr).toBeDefined();
      expect(additionalInfoAttr.open).toBe(false);
      expect(additionalInfoAttr.showAll).toBe(false);
    });

    it('should preserve UI state for different attribute types (CLASSIFICATION, FUNCTION, PHASE, ACTION, RECORD)', () => {
      const existingFilteredAttributes = [
        {
          key: 'name',
          name: 'Nimi',
          type: TYPE_CLASSIFICATION,
          open: true,
          showAll: false,
          options: [],
        },
        {
          key: 'function_state',
          name: 'Tila',
          type: TYPE_FUNCTION,
          open: false,
          showAll: true,
          options: [],
        },
        {
          key: 'phase_name',
          name: 'Vaiheen nimi',
          type: TYPE_PHASE,
          open: true,
          showAll: true,
          options: [],
        },
        {
          key: 'action_name',
          name: 'Toimenpiteen nimi',
          type: TYPE_ACTION,
          open: false,
          showAll: false,
          options: [],
        },
        {
          key: 'record_name',
          name: 'Asiakirjan nimi',
          type: TYPE_RECORD,
          open: true,
          showAll: false,
          options: [],
        },
      ];

      const stateWithExistingAttributes = {
        ...initialState,
        attributes: [
          { key: 'name', name: 'Nimi', type: TYPE_CLASSIFICATION, options: [] },
          { key: 'function_state', name: 'Tila', type: TYPE_FUNCTION, options: [] },
          { key: 'phase_name', name: 'Vaiheen nimi', type: TYPE_PHASE, options: [] },
          { key: 'action_name', name: 'Toimenpiteen nimi', type: TYPE_ACTION, options: [] },
          { key: 'record_name', name: 'Asiakirjan nimi', type: TYPE_RECORD, options: [] },
        ],
        filteredAttributes: existingFilteredAttributes,
      };

      const items = classification.map((item) => ({
        ...item,
        type: TYPE_CLASSIFICATION,
        attributes: {
          name: `${item.code} ${item.title}`,
        },
      }));

      const action = receiveClassifications({ items, page: 1 });
      const nextState = searchReducer(stateWithExistingAttributes, action);

      // Verify preservation for each type
      const classAttr = nextState.filteredAttributes.find(
        (attr) => attr.key === 'name' && attr.type === TYPE_CLASSIFICATION,
      );
      const funcAttr = nextState.filteredAttributes.find(
        (attr) => attr.key === 'function_state' && attr.type === TYPE_FUNCTION,
      );
      const phaseAttr = nextState.filteredAttributes.find(
        (attr) => attr.key === 'phase_name' && attr.type === TYPE_PHASE,
      );
      const actionAttr = nextState.filteredAttributes.find(
        (attr) => attr.key === 'action_name' && attr.type === TYPE_ACTION,
      );
      const recordAttr = nextState.filteredAttributes.find(
        (attr) => attr.key === 'record_name' && attr.type === TYPE_RECORD,
      );

      expect(classAttr?.open).toBe(true);
      expect(classAttr?.showAll).toBe(false);

      expect(funcAttr?.open).toBe(false);
      expect(funcAttr?.showAll).toBe(true);

      expect(phaseAttr?.open).toBe(true);
      expect(phaseAttr?.showAll).toBe(true);

      expect(actionAttr?.open).toBe(false);
      expect(actionAttr?.showAll).toBe(false);

      expect(recordAttr?.open).toBe(true);
      expect(recordAttr?.showAll).toBe(false);
    });

    it('should preserve UI state when receiving classifications with page > 1 (isAdd = true)', () => {
      const existingFilteredAttributes = [
        {
          key: 'name',
          name: 'Nimi',
          type: TYPE_CLASSIFICATION,
          open: true,
          showAll: true,
          options: [],
        },
      ];

      const stateWithExistingAttributes = {
        ...initialState,
        attributes: [{ key: 'name', name: 'Nimi', type: TYPE_CLASSIFICATION, options: [] }],
        filteredAttributes: existingFilteredAttributes,
        classifications: [classification[0]], // Some existing classifications
      };

      const items = [classification[1]]; // New items for page 2

      const action = receiveClassifications({ items, page: 2 });
      const nextState = searchReducer(stateWithExistingAttributes, action);

      // Verify UI state was preserved even when adding (page > 1)
      const nameAttr = nextState.filteredAttributes.find(
        (attr) => attr.key === 'name' && attr.type === TYPE_CLASSIFICATION,
      );

      expect(nameAttr).toBeDefined();
      expect(nameAttr.open).toBe(true);
      expect(nameAttr.showAll).toBe(true);
    });

    it('should handle preservation when existing filteredAttributes is empty', () => {
      const stateWithEmptyAttributes = {
        ...initialState,
        attributes: [{ key: 'name', name: 'Nimi', type: TYPE_CLASSIFICATION, options: [], open: false, showAll: false }],
        filteredAttributes: [],
      };

      const items = classification.map((item) => ({
        ...item,
        type: TYPE_CLASSIFICATION,
        attributes: {
          name: `${item.code} ${item.title}`,
        },
      }));

      const action = receiveClassifications({ items, page: 1 });
      const nextState = searchReducer(stateWithEmptyAttributes, action);

      // All attributes should have default UI state
      const nameAttr = nextState.filteredAttributes.find(
        (attr) => attr.key === 'name' && attr.type === TYPE_CLASSIFICATION,
      );

      expect(nameAttr).toBeDefined();
      expect(nameAttr.open).toBe(false);
      expect(nameAttr.showAll).toBe(false);
    });

    it('should handle searchSuggestionsAction', () => {
      const suggestions = [
        { type: TYPE_CLASSIFICATION, hits: ['class1'] },
        { type: TYPE_FUNCTION, hits: ['func1'] },
      ];

      const action = searchSuggestionsAction(suggestions);
      const nextState = searchReducer(initialState, action);

      expect(nextState.suggestions).toEqual(suggestions);
    });

    it('should handle toggleAttribute', () => {
      const filteredAttributes = [
        { key: 'RetentionPeriod', type: TYPE_FUNCTION, open: false, showAll: false, options: [] },
      ];

      const state = { ...initialState, filteredAttributes };
      const action = toggleAttribute({ key: 'RetentionPeriod', type: TYPE_FUNCTION, open: false, showAll: false });
      const nextState = searchReducer(state, action);

      expect(nextState.filteredAttributes[0].open).toBe(true);
    });

    it('should handle toggleShowAllAttributeOptions', () => {
      const filteredAttributes = [
        { key: 'RetentionPeriod', type: TYPE_FUNCTION, open: true, showAll: false, options: [] },
      ];

      const state = { ...initialState, filteredAttributes };
      const action = toggleShowAllAttributeOptions({ key: 'RetentionPeriod', type: TYPE_FUNCTION, showAll: false });
      const nextState = searchReducer(state, action);

      expect(nextState.filteredAttributes[0].showAll).toBe(true);
    });
  });

  describe('fetchClassificationsThunk', () => {
    it('should fetch classifications successfully', async () => {
      api.get.mockResolvedValueOnce({
        json: async () => ({
          count: classification.length,
          next: null,
          previous: null,
          results: classification,
        }),
      });

      const store = createTestStore();

      await store.dispatch(fetchClassificationsThunk());

      const actions = store.getActions();

      expect(actions.some((action) => action.type === 'search/requestClassifications')).toBe(true);
      expect(actions.some((action) => action.type === 'search/receiveClassifications')).toBe(true);
      expect(actions.some((action) => action.type === 'search/classificationsReady')).toBe(true);

      expect(api.get).toHaveBeenCalledWith(
        'classification',
        expect.objectContaining({
          include_related: true,
          page_size: 10,
          page: 1,
        }),
        expect.objectContaining({
          signal: expect.any(AbortSignal),
        }),
        null,
      );

      const receiveAction = actions.find((action) => action.type === 'search/receiveClassifications');
      expect(receiveAction.payload.items).toEqual(classification);

      const healthGuideItem = receiveAction.payload.items.find((item) => item.id === HEALTH_GUIDANCE_ID);
      expect(healthGuideItem.function_attributes.PublicityClass).toBe('Julkinen');
      expect(healthGuideItem.function_attributes.PersonalData).toBe('Sisältää henkilötietoja');
    });

    it('should handle pagination when fetching classifications', async () => {
      const page1Response = {
        count: mockClassifications.length,
        next: 'https://api.example.com/classification?page=2',
        previous: null,
        results: [mockClassifications[0]],
      };

      const page2Response = {
        count: mockClassifications.length,
        next: null,
        previous: 'https://api.example.com/classification?page=1',
        results: [mockClassifications[1]],
      };

      api.get
        .mockResolvedValueOnce({
          json: async () => page1Response,
        })
        .mockResolvedValueOnce({
          json: async () => page2Response,
        });

      const store = createTestStore();

      await store.dispatch(fetchClassificationsThunk());

      const actions = store.getActions();

      expect(api.get).toHaveBeenCalledTimes(2);
      expect(api.get).toHaveBeenNthCalledWith(
        1,
        'classification',
        expect.objectContaining({ page: 1 }),
        expect.objectContaining({ signal: expect.any(AbortSignal) }),
        null,
      );
      expect(api.get).toHaveBeenNthCalledWith(
        2,
        'classification',
        expect.objectContaining({ page: 2 }),
        expect.objectContaining({ signal: expect.any(AbortSignal) }),
        null,
      );

      expect(actions.some((action) => action.type === 'search/requestClassifications')).toBe(true);
      expect(actions.filter((action) => action.type === 'search/receiveClassifications').length).toBe(2);
      expect(actions.some((action) => action.type === 'search/classificationsReady')).toBe(true);
    });

    it('should handle error when fetching classifications', async () => {
      api.get.mockRejectedValueOnce(new Error('Network error'));

      const store = createTestStore();

      const result = await store.dispatch(fetchClassificationsThunk());

      const actions = store.getActions();
      expect(actions.some((action) => action.type === 'search/requestClassifications')).toBe(true);
      expect(actions.some((action) => action.type === 'search/classificationsError')).toBe(true);
      expect(result.payload.error).toBe('Network error');
    });
  });

  describe('updateAttributeTypesThunk', () => {
    it('should transform attribute types correctly', async () => {
      const store = mockStore({ search: initialState });

      await store.dispatch(updateAttributeTypesThunk(mockAttributeTypes));

      const actions = store.getActions();
      const setAttributesAction = actions.find((action) => action.type === 'search/setAttributeTypes');

      expect(setAttributesAction).toBeTruthy();
      expect(setAttributesAction.payload.attributes).toBeInstanceOf(Array);
      expect(setAttributesAction.payload.attributes.length).toBeGreaterThan(0);
      expect(setAttributesAction.payload.metadata).toBeTruthy();

      const attributeKeys = Object.keys(mockAttributeTypes);
      expect(attributeKeys).toContain('PublicityClass');
      expect(attributeKeys).toContain('PersonalData');
      expect(attributeKeys).toContain('RetentionPeriod');

      setAttributesAction.payload.attributes.forEach((attr) => {
        expect(attr).toHaveProperty('key');
        expect(attr).toHaveProperty('name');
        expect(attr).toHaveProperty('options');
        expect(attr).toHaveProperty('open', false);
        expect(attr).toHaveProperty('showAll', false);
      });
    });
  });

  describe('searchItemsThunk', () => {
    it('should search and filter items by term', async () => {
      const searchTerm = 'terveys';

      const healthClass = classification.find((item) => item.id === HEALTH_GUIDANCE_ID);
      const healthClassValue = `${healthClass.code} ${healthClass.title}`;
      const healthClassRef = healthClassValue.toLowerCase();

      const options = [createAttributeOption(healthClassValue, healthClassRef, [HEALTH_GUIDANCE_ID])];

      const attributes = [createAttribute('name', 'Name', TYPE_CLASSIFICATION, options)];
      const mappedClassifications = createMappedClassifications();

      const store = mockStore({
        search: {
          ...initialState,
          attributes,
          classifications: mappedClassifications,
        },
      });

      await store.dispatch(searchItemsThunk({ searchTerm, type: null }));

      const actions = store.getActions();
      const searchItemsAction = actions.find((action) => action.type === 'search/searchItemsAction');

      expect(searchItemsAction).toBeTruthy();
      expect(searchItemsAction.payload.terms).toContain(searchTerm);
      expect(searchItemsAction.payload.classifications).toBeInstanceOf(Array);
    });

    it('should generate suggestions when isSuggestionsOnly is true', async () => {
      const healthClass = classification.find((item) => item.id === HEALTH_GUIDANCE_ID);

      const classValue = `${healthClass.code} ${healthClass.title}`;
      const classRef = `${healthClass.code.toLowerCase()} ${healthClass.title.toLowerCase()}`;

      const options = [createAttributeOption(classValue, classRef, [HEALTH_GUIDANCE_ID])];
      const attributes = [createAttribute('name', 'Name', TYPE_CLASSIFICATION, options)];

      const mappedClassifications = createMappedClassifications();

      const store = mockStore({
        search: {
          ...initialState,
          attributes,
          classifications: mappedClassifications,
        },
      });

      await store.dispatch(
        searchItemsThunk({
          searchTerm: 'Terveys',
          type: null,
          isSuggestionsOnly: true,
        }),
      );

      const actions = store.getActions();
      const suggestionAction = actions.find((action) => action.type === 'search/searchSuggestionsAction');

      expect(suggestionAction).toBeTruthy();
      expect(suggestionAction.payload).toBeInstanceOf(Array);
      expect(suggestionAction.payload[0].type).toBe(TYPE_CLASSIFICATION);
      expect(suggestionAction.payload[0].hits).toContain(HEALTH_GUIDANCE_ID);
    });

    it('should filter by item type', async () => {
      const firstClassification = classification[0];
      const functionId = firstClassification.function;

      const functionValue = `Toiminto: ${firstClassification.title}`;
      const functionRef = `toiminto: ${firstClassification.title.toLowerCase()}`;
      const options = [createAttributeOption(functionValue, functionRef, [functionId])];
      const attributes = [createAttribute('name', 'Name', TYPE_FUNCTION, options)];

      const functions = classification
        .filter((item) => item.function)
        .map((item) => ({
          id: item.function,
          type: TYPE_FUNCTION,
          title: `Toiminto: ${item.title}`,
          code: item.code,
          attributes: {
            name: `${item.code} ${item.title}`,
            ...item.function_attributes,
          },
        }));

      const store = mockStore({
        search: {
          ...initialState,
          attributes,
          functions,
        },
      });

      await store.dispatch(searchItemsThunk({ searchTerm: 'Toiminto', type: TYPE_FUNCTION }));

      const actions = store.getActions();
      const searchItemsAction = actions.find((action) => action.type === 'search/searchItemsAction');

      expect(searchItemsAction).toBeTruthy();
      expect(searchItemsAction.payload.functions).toBeInstanceOf(Array);
      expect(searchItemsAction.payload.classifications).toEqual([]);
    });
  });

  describe('filterItemsThunk', () => {
    it('should filter items based on selected facets', async () => {
      const options = [createAttributeOption('Julkinen', 'julkinen', [HEALTH_GUIDANCE_ID])];
      const filteredAttributes = [createAttribute('PublicityClass', 'Julkisuusluokka', TYPE_CLASSIFICATION, options)];

      const mappedClassifications = createMappedClassifications();

      const store = mockStore({
        search: {
          ...initialState,
          filteredAttributes,
          classifications: mappedClassifications,
        },
      });

      const selectedFacets = {
        [TYPE_CLASSIFICATION]: [{ key: 'PublicityClass', hits: [HEALTH_GUIDANCE_ID] }],
        [TYPE_FUNCTION]: [],
        [TYPE_PHASE]: [],
        [TYPE_ACTION]: [],
        [TYPE_RECORD]: [],
      };

      const result = await store.dispatch(filterItemsThunk(selectedFacets));

      expect(result.payload).toBeDefined();
      expect(result.payload.classifications).toContain(HEALTH_GUIDANCE_ID);
    });

    it('should use filtered attributes when no facets are selected', async () => {
      const publicityClassAttr = mockAttributeTypes.PublicityClass;

      const options = [
        createAttributeOption('Julkinen', 'julkinen', [HEALTH_GUIDANCE_ID, EDUCATION_ID], false),
        createAttributeOption('Osittain salassa pidettävä', 'osittain salassa pidettävä', [EDUCATION_CHILD_ID], false),
      ];

      const filteredAttributes = [
        createAttribute('PublicityClass', publicityClassAttr.name, TYPE_CLASSIFICATION, options),
      ];

      const mappedClassifications = createMappedClassifications();

      const store = mockStore({
        search: {
          ...initialState,
          filteredAttributes,
          classifications: mappedClassifications,
        },
      });

      const selectedFacets = {
        [TYPE_CLASSIFICATION]: [],
        [TYPE_FUNCTION]: [],
        [TYPE_PHASE]: [],
        [TYPE_ACTION]: [],
        [TYPE_RECORD]: [],
      };

      const result = await store.dispatch(filterItemsThunk(selectedFacets));

      expect(result.payload).toBeDefined();
      expect(result.payload.classifications).toBeInstanceOf(Array);
      expect(result.payload.classifications.length).toBeGreaterThan(0);
    });
  });

  describe('resetSuggestionsThunk', () => {
    it('should clear suggestions', async () => {
      const store = mockStore({
        search: {
          ...initialState,
          suggestions: [{ type: TYPE_CLASSIFICATION, hits: ['class1'] }],
        },
      });

      await store.dispatch(resetSuggestionsThunk());

      const actions = store.getActions();
      const suggestionAction = actions.find((action) => action.type === 'search/searchSuggestionsAction');

      expect(suggestionAction).toBeTruthy();
      expect(suggestionAction.payload).toEqual([]);
    });
  });
});
