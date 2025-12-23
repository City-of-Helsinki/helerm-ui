/* eslint-disable sonarjs/no-nested-functions */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  cloneDeep,
  every,
  filter,
  find,
  findIndex,
  includes,
  isArray,
  isEmpty,
  some,
  toLower,
  uniq,
  words,
} from 'lodash';

import {
  FACETED_SEARCH_DEFAULT_ATTRIBUTES,
  TYPE_ACTION,
  TYPE_CLASSIFICATION,
  TYPE_FUNCTION,
  TYPE_PHASE,
  TYPE_RECORD,
} from '../../constants';
import config from '../../config';
import api from '../../utils/api';

export const initialState = {
  actions: [],
  attributes: [],
  exportItems: [],
  metadata: {},
  classifications: [],
  filteredAttributes: [],
  functions: [],
  headers: {},
  isFetching: false,
  items: [],
  page: 1,
  phases: [],
  records: [],
  suggestions: [],
  terms: [],
};

const getFilteredHits = (filteredAttributes, type) => {
  const ids = filter(filteredAttributes, { type }).reduce((acc, attribute) => {
    const hits = attribute.options.reduce((optAcc, option) => {
      optAcc.push(...option.hits);
      return optAcc;
    }, []);
    acc.push(...hits);
    return acc;
  }, []);
  return uniq(ids);
};

const getFacetHits = (facets) => {
  const byKeys = facets.reduce((acc, facet) => {
    if (Object.hasOwn(acc, facet.key)) {
      acc[facet.key].push(...facet.hits);
    } else {
      acc[facet.key] = [...facet.hits];
    }
    return acc;
  }, {});
  const ids = Object.keys(byKeys || {}).reduce((acc, key, index) => {
    const hits = [];
    if (Object.hasOwn(byKeys, key)) {
      byKeys[key].forEach((hit) => {
        if ((index === 0 && isEmpty(acc)) || includes(acc, hit)) {
          hits.push(hit);
        }
      });
    }
    return hits;
  }, []);
  return uniq(ids);
};

const getFacetAttributesForType = (attributes, items, type) => {
  const typeAttributes = cloneDeep(filter(attributes, { type }));
  typeAttributes.forEach((attribute) => {
    items.forEach((item) => {
      if (
        item.attributes &&
        Object.hasOwn(item.attributes, attribute.key) &&
        !isEmpty(item.attributes[attribute.key])
      ) {
        const index = findIndex(attribute.options, {
          value: item.attributes[attribute.key],
        });
        if (index >= 0) {
          attribute.options[index].hits.push(item.id);
        } else {
          attribute.options.push({
            hits: [item.id],
            ref: toLower(item.attributes[attribute.key]),
            value: item.attributes[attribute.key],
            selected: false,
          });
        }
      }
    });
  });
  return typeAttributes;
};

const getSearchTermsFilteredAttributes = (searchTerm, attributes, andTerms, orTerms, notTerms) => {
  if (!searchTerm) {
    return attributes;
  }

  return attributes.reduce((acc, attr) => {
    const options = filter(
      attr.options,
      (option) =>
        (isEmpty(andTerms) || every(andTerms, (st) => includes(option.ref, st))) &&
        (isEmpty(orTerms) || some(orTerms, (st) => includes(option.ref, st))) &&
        (isEmpty(notTerms) || every(notTerms, (st) => !includes(option.ref, st))),
    );

    if (!isEmpty(options)) {
      acc.push({ ...attr, options, open: false, showAll: false });
    }

    return acc;
  }, []);
};

const getSelectedItemsForType = (attributes, type, items) => {
  const ids = filter(attributes, { type }).reduce((acc, attribute) => {
    const attrHits = attribute.options.reduce((valAcc, val) => {
      if (val.selected) {
        valAcc.push(...val.hits);
      }
      return valAcc;
    }, []);
    acc.push(...attrHits);
    return acc;
  }, []);
  const uniqIds = uniq(ids);
  return filter(items, (item) => includes(uniqIds, item.id));
};

const parseTerms = (searchTerm) => {
  const TERM_AND = 'AND';
  const TERM_NOT = 'NOT';
  const TERM_OR = 'OR';
  const terms = words(searchTerm, /[^, ]+/g);

  return terms.reduce(
    (acc, term, index) => {
      const isOperator = includes([TERM_AND, TERM_NOT, TERM_OR], term);
      if (!isOperator) {
        acc.terms.push(toLower(term).trim());
      }
      if (isOperator || index + 1 === terms.length) {
        if (term === TERM_OR || acc.lastOperator === TERM_OR) {
          acc.orTerms.push(acc.terms.join(' '));
          acc.terms = [];
        } else if (acc.lastOperator === TERM_NOT) {
          acc.notTerms.push(acc.terms.join(' '));
          acc.terms = [];
        } else {
          acc.andTerms.push(acc.terms.join(' '));
          acc.terms = [];
        }
      }
      if (isOperator) {
        acc.lastOperator = term;
      }
      return acc;
    },
    {
      andTerms: [],
      notTerms: [],
      orTerms: [],
      terms: [],
      lastOperator: null,
    },
  );
};

let isFetchingClassifications = false;

export const fetchClassificationsThunk = createAsyncThunk(
  'search/fetchClassifications',
  async (page = 1, { dispatch, getState }) => {
    if (isFetchingClassifications && page == 1) {
      return { skipped: true };
    }

    try {
      if (page == 1) {
        isFetchingClassifications = true;
        dispatch(requestClassifications());
      }

      const pageSize = config.SEARCH_PAGE_SIZE;

      if (page == 1) {
        await dispatch(updateAttributeTypesThunk(getState().ui.attributeTypes));
      }

      const response = await api.get('classification', {
        include_related: true,
        page_size: pageSize,
        page,
      });

      const json = await response.json();

      dispatch(receiveClassifications({ items: json.results, page }));

      if (json.next) {
        return dispatch(fetchClassificationsThunk(page + 1));
      } else {
        dispatch(classificationsReady());

        if (page >= 1) {
          isFetchingClassifications = false;
        }

        return { complete: true, page };
      }
    } catch (error) {
      if (page == 1) {
        isFetchingClassifications = false;
      }

      dispatch(classificationsError());
      return { error: error instanceof Error ? error.message : 'Failed to fetch classifications' };
    }
  },
);

export const updateAttributeTypesThunk = createAsyncThunk(
  'search/updateAttributeTypes',
  async (attributeTypes, { dispatch }) => {
    const attributes = Object.keys(attributeTypes || {}).reduce((acc, key) => {
      if (Object.hasOwn(attributeTypes, key)) {
        const attr = attributeTypes[key];
        attr.allowedIn.forEach((type) => {
          acc.push({
            key,
            name: attr.name,
            type,
          });
        });
      }
      return acc;
    }, []);

    const metadata = FACETED_SEARCH_DEFAULT_ATTRIBUTES.reduce(
      (acc, attr) => {
        acc[attr.key] = {
          name: attr.name,
        };
        return acc;
      },
      { ...attributeTypes },
    );

    const allAttributes = [...FACETED_SEARCH_DEFAULT_ATTRIBUTES, ...attributes];
    allAttributes.forEach((attr) => {
      attr.open = false;
      attr.showAll = false;
      attr.options = [];
    });

    dispatch(
      setAttributeTypes({
        attributes: allAttributes,
        metadata,
      }),
    );

    return {
      attributes: allAttributes,
      metadata,
    };
  },
);

export const searchItemsThunk = createAsyncThunk(
  'search/searchItems',
  async ({ searchTerm, type, isSuggestionsOnly = false }, { dispatch, getState }) => {
    const { attributes } = getState().search;
    const parsed = parseTerms(searchTerm);
    const { andTerms, notTerms, orTerms } = parsed;

    const filteredAttributes = getSearchTermsFilteredAttributes(searchTerm, attributes, andTerms, orTerms, notTerms);

    const classifications = getFilteredHits(filteredAttributes, TYPE_CLASSIFICATION);

    const functions = getFilteredHits(filteredAttributes, TYPE_FUNCTION);
    const phases = getFilteredHits(filteredAttributes, TYPE_PHASE);
    const actions = getFilteredHits(filteredAttributes, TYPE_ACTION);
    const records = getFilteredHits(filteredAttributes, TYPE_RECORD);

    const suggestions = [
      {
        type: TYPE_CLASSIFICATION,
        hits: classifications,
      },
      {
        type: TYPE_FUNCTION,
        hits: functions,
      },
      {
        type: TYPE_PHASE,
        hits: phases,
      },
      {
        type: TYPE_ACTION,
        hits: actions,
      },
      {
        type: TYPE_RECORD,
        hits: records,
      },
    ];

    if (isSuggestionsOnly) {
      dispatch(searchSuggestionsAction(suggestions));
      return { suggestions };
    }

    dispatch(
      searchItemsAction({
        classifications: !type || type === TYPE_CLASSIFICATION ? classifications : [],
        filteredAttributes,
        functions: type === TYPE_FUNCTION || (!type && isEmpty(classifications)) ? functions : [],
        phases: type === TYPE_PHASE || (!type && isEmpty(classifications) && isEmpty(functions)) ? phases : [],
        actions:
          type === TYPE_ACTION || (!type && isEmpty(classifications) && isEmpty(functions) && isEmpty(phases))
            ? actions
            : [],
        records:
          type === TYPE_RECORD ||
          (!type && isEmpty(classifications) && isEmpty(functions) && isEmpty(phases) && isEmpty(actions))
            ? records
            : [],
        suggestions: [],
        terms: [...andTerms, ...orTerms],
      }),
    );

    return {
      classifications,
      functions,
      phases,
      actions,
      records,
      filteredAttributes,
    };
  },
);

export const filterItemsThunk = createAsyncThunk(
  'search/filterItems',
  async (selectedFacets, { dispatch, getState }) => {
    if (
      !isEmpty(selectedFacets[TYPE_CLASSIFICATION]) ||
      !isEmpty(selectedFacets[TYPE_FUNCTION]) ||
      !isEmpty(selectedFacets[TYPE_PHASE]) ||
      !isEmpty(selectedFacets[TYPE_ACTION]) ||
      !isEmpty(selectedFacets[TYPE_RECORD])
    ) {
      const classifications = getFacetHits(selectedFacets[TYPE_CLASSIFICATION]);
      const functions = getFacetHits(selectedFacets[TYPE_FUNCTION]);
      const phases = getFacetHits(selectedFacets[TYPE_PHASE]);
      const actions = getFacetHits(selectedFacets[TYPE_ACTION]);
      const records = getFacetHits(selectedFacets[TYPE_RECORD]);

      dispatch(
        searchItemsAction({
          classifications,
          functions,
          phases,
          actions,
          records,
        }),
      );
      return {
        classifications,
        functions,
        phases,
        actions,
        records,
      };
    }

    const { filteredAttributes } = getState().search;
    const classifications = getFilteredHits(filteredAttributes, TYPE_CLASSIFICATION);
    const functions = isEmpty(classifications) ? getFilteredHits(filteredAttributes, TYPE_FUNCTION) : [];
    const phases =
      isEmpty(classifications) && isEmpty(functions) ? getFilteredHits(filteredAttributes, TYPE_PHASE) : [];
    const actions =
      isEmpty(classifications) && isEmpty(functions) && isEmpty(phases)
        ? getFilteredHits(filteredAttributes, TYPE_ACTION)
        : [];
    const records =
      isEmpty(classifications) && isEmpty(functions) && isEmpty(phases) && isEmpty(actions)
        ? getFilteredHits(filteredAttributes, TYPE_RECORD)
        : [];

    dispatch(
      searchItemsAction({
        classifications,
        functions,
        phases,
        actions,
        records,
      }),
    );

    return {
      classifications,
      functions,
      phases,
      actions,
      records,
    };
  },
);

export const resetSuggestionsThunk = createAsyncThunk('search/resetSuggestions', async (_, { dispatch }) => {
  dispatch(searchSuggestionsAction([]));
});

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    classificationsError: (state) => {
      state.isFetching = false;
      state.items = [];
    },
    classificationsReady: (state) => {
      state.isFetching = false;
    },
    requestClassifications: (state) => {
      state.isFetching = true;
    },
    receiveClassifications: (state, action) => {
      const { items, page } = action.payload;
      const isAdd = page > 1;

      const data = items.reduce(
        (acc, item) => {
          const name = `${item.code} ${item.title}`;
          const parent = item.parent ? acc.headers[item.parent.id] || state.headers[item.parent.id] : null;
          const path = parent ? [...parent.path, name] : [name];
          const parents = parent ? [...parent.parents, item.parent.id] : [];
          acc.headers[item.id] = { name, parents, path };
          acc.classifications.push({
            ...item,
            attributes: {
              additional_information: item.additional_information,
              name,
              description: item.description,
              related_classification: item.related_classification,
              description_internal: item.description_internal,
            },
            classification: item.id,
            function: item.function || null,
            name,
            parents,
            path: parent ? parent.path : [],
            type: TYPE_CLASSIFICATION,
          });
          if (item.function) {
            parents.push(item.id);
            acc.functions.push({
              attributes: {
                ...item.function_attributes,
                function_state: item.function_state,
                function_valid_from: item.function_valid_from,
                function_valid_to: item.function_valid_to,
              },
              children: null,
              classification: item.id,
              function: item.function,
              id: item.function,
              name,
              parents,
              path,
              type: TYPE_FUNCTION,
            });
          }
          if (item.phases) {
            item.phases.forEach((phase) => {
              acc.phases.push({
                attributes: phase.attributes,
                classification: item.id,
                function: item.function,
                id: phase.id,
                name: phase.name || '',
                parents: [...parents, phase.function],
                path,
                type: TYPE_PHASE,
              });
              if (phase.actions) {
                phase.actions.forEach((action) => {
                  acc.actions.push({
                    attributes: action.attributes,
                    classification: item.id,
                    function: item.function,
                    id: action.id,
                    name: action.name || '',
                    parents: [...parents, phase.function, phase.id],
                    path,
                    type: TYPE_ACTION,
                  });
                  if (action.records) {
                    action.records.forEach((record) => {
                      acc.records.push({
                        attributes: record.attributes,
                        classification: item.id,
                        function: item.function,
                        id: record.id,
                        name: record.name || '',
                        parents: [...parents, phase.function, phase.id, action.id],
                        path,
                        type: TYPE_RECORD,
                      });
                    });
                  }
                });
              }
            });
          }
          return acc;
        },
        {
          actions: [],
          classifications: [],
          functions: [],
          headers: {},
          phases: [],
          records: [],
        },
      );

      const { actions, classifications, functions, headers, phases, records } = data;

      const classificationAttr = getFacetAttributesForType(state.attributes, classifications, TYPE_CLASSIFICATION);
      const functionAttr = getFacetAttributesForType(state.attributes, functions, TYPE_FUNCTION);
      const phaseAttr = getFacetAttributesForType(state.attributes, phases, TYPE_PHASE);
      const actionAttr = getFacetAttributesForType(state.attributes, actions, TYPE_ACTION);
      const recordAttr = getFacetAttributesForType(state.attributes, records, TYPE_RECORD);
      const filteredAttributes = [...classificationAttr, ...functionAttr, ...phaseAttr, ...actionAttr, ...recordAttr];

      // Preserve UI state (open/showAll) from existing filteredAttributes
      filteredAttributes.forEach((attr) => {
        const existing = find(state.filteredAttributes, { key: attr.key, type: attr.type });
        if (existing) {
          attr.open = existing.open;
          attr.showAll = existing.showAll;
        }
      });

      if (isAdd) {
        state.actions.push(...actions);
        state.classifications.push(...classifications);
        state.functions.push(...functions);
        state.phases.push(...phases);
        state.records.push(...records);
        state.items.push(...classifications);
        state.exportItems.push(...classifications);
      } else {
        state.actions = actions;
        state.classifications = classifications;
        state.functions = functions;
        state.phases = phases;
        state.records = records;
        state.items = classifications;
        state.exportItems = [...state.exportItems, ...classifications];
      }

      state.attributes = filteredAttributes;
      state.filteredAttributes = filteredAttributes;
      Object.assign(state.headers, headers);
      state.page = page;
    },
    setAttributeTypes: (state, action) => {
      state.attributes = action.payload.attributes;
      state.metadata = action.payload.metadata;
      state.filteredAttributes = action.payload.attributes;
    },
    searchItemsAction: (state, action) => {
      const { classifications, functions, phases, actions, records } = state;
      const { filteredAttributes } = action.payload;
      const terms = action.payload.terms || state.terms;

      if (
        isEmpty(action.payload.classifications) &&
        isEmpty(action.payload.functions) &&
        isEmpty(action.payload.phases) &&
        isEmpty(action.payload.actions) &&
        isEmpty(action.payload.records)
      ) {
        state.exportItems = !filteredAttributes ? functions : [];
        state.filteredAttributes = filteredAttributes || state.filteredAttributes;
        state.items = [];
        state.suggestions = [];
        state.terms = terms;
        return;
      }

      const filteredItems = [
        {
          facet: action.payload.classifications,
          items: classifications,
        },
        {
          facet: action.payload.functions,
          items: functions,
        },
        {
          facet: action.payload.phases,
          items: phases,
        },
        {
          facet: action.payload.actions,
          items: actions,
        },
        {
          facet: action.payload.records,
          items: records,
        },
      ].reduce((acc, current) => {
        if (!isEmpty(current.facet)) {
          return filter(
            current.items,
            (item) =>
              includes(current.facet, item.id) &&
              (isEmpty(acc) || (!isEmpty(acc) && some(acc, (a) => includes(item.parents, a.id)))),
          );
        }
        return acc;
      }, []);

      const items = filteredItems.map((item) => {
        if (!isEmpty(terms)) {
          const matchedAttributes = Object.keys(item.attributes || {}).reduce((acc, key) => {
            if (Object.hasOwn(item.attributes, key) && key !== 'name') {
              const attrValue = isArray(item.attributes[key]) ? item.attributes[key].join(', ') : item.attributes[key];
              const isHit = some(terms, (term) => new RegExp(term, 'gi').test(attrValue));
              if (isHit) {
                const value = terms.reduce(
                  (valAcc, term) => valAcc.replace(new RegExp(term, 'gi'), (match) => `<mark>${match}</mark>`),
                  attrValue,
                );
                acc.push({ key, value });
              }
            }
            return acc;
          }, []);
          return {
            ...item,
            matchedAttributes,
            matchedName: isEmpty(terms)
              ? item.name
              : terms.reduce(
                  (acc, term) => acc.replace(new RegExp(term, 'gi'), (match) => `<mark>${match}</mark>`),
                  item.name || '',
                ),
          };
        }
        return item;
      });

      const exportItems = items.reduce((acc, item) => {
        const accClass = item.classification ? find(acc, { classification: item.classification }) : null;
        if (!accClass) {
          if (item.type === TYPE_CLASSIFICATION) {
            acc.push(item);
          } else {
            const classification = find(classifications, {
              id: item.classification,
            });
            if (classification) {
              acc.push(classification);
            }
          }
        }
        return acc;
      }, []);

      state.filteredAttributes = filteredAttributes || state.filteredAttributes;
      state.exportItems = exportItems;
      state.items = items;
      state.suggestions = [];
      state.terms = action.payload.terms || terms;
    },
    searchSuggestionsAction: (state, action) => {
      state.suggestions = action.payload;
    },
    toggleAttribute: (state, action) => {
      const { key, open, showAll, type } = action.payload;
      const index = findIndex(state.filteredAttributes, { key, type });

      if (index >= 0) {
        state.filteredAttributes[index].open = !open;
        state.filteredAttributes[index].showAll = !open ? false : showAll;
      }
    },
    toggleAttributeOption: (state, action) => {
      const { key, type, options } = action.payload.attribute;
      const { selected, value } = action.payload.option;
      const attributeIndex = findIndex(state.filteredAttributes, { key, type });
      const valueIndex = findIndex(options, { value });

      if (attributeIndex >= 0 && valueIndex >= 0) {
        state.filteredAttributes[attributeIndex].options[valueIndex].selected = !selected;

        const classificationItems = getSelectedItemsForType(
          state.filteredAttributes,
          TYPE_CLASSIFICATION,
          state.classifications,
        );
        const functionItems = getSelectedItemsForType(state.filteredAttributes, TYPE_FUNCTION, state.functions);
        const phaseItems = getSelectedItemsForType(state.filteredAttributes, TYPE_PHASE, state.phases);
        const actionItems = getSelectedItemsForType(state.filteredAttributes, TYPE_ACTION, state.actions);
        const recordItems = getSelectedItemsForType(state.filteredAttributes, TYPE_RECORD, state.records);

        state.items = [...classificationItems, ...functionItems, ...phaseItems, ...actionItems, ...recordItems];
      }
    },
    toggleShowAllAttributeOptions: (state, action) => {
      const { key, showAll, type } = action.payload;
      const index = findIndex(state.filteredAttributes, { key, type });

      if (index >= 0) {
        state.filteredAttributes[index].showAll = !showAll;
      }
    },
  },
});

export const {
  classificationsError,
  classificationsReady,
  requestClassifications,
  receiveClassifications,
  setAttributeTypes,
  searchItemsAction,
  searchSuggestionsAction,
  toggleAttribute,
  toggleAttributeOption,
  toggleShowAllAttributeOptions,
} = searchSlice.actions;

export const attributesSelector = (state) => state.search.attributes;
export const classificationsSelector = (state) => state.search.classifications;
export const filteredAttributesSelector = (state) => state.search.filteredAttributes;
export const itemsSelector = (state) => state.search.items;
export const suggestionsSelector = (state) => state.search.suggestions;
export const termsSelector = (state) => state.search.terms;
export const isFetchingSelector = (state) => state.search.isFetching;
export const exportItemsSelector = (state) => state.search.exportItems;
export const metadataSelector = (state) => state.search.metadata;
export const functionsSelector = (state) => state.search.functions;
export const phasesSelector = (state) => state.search.phases;
export const actionsSelector = (state) => state.search.actions;
export const recordsSelector = (state) => state.search.records;

export default searchSlice.reducer;
