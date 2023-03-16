/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable default-param-last */
/* eslint-disable import/no-named-as-default-member */
/* eslint-disable no-param-reassign */
import update from 'immutability-helper';
import { createAction, handleActions } from 'redux-actions';
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
  words
} from 'lodash';

import {
  FACETED_SEARCH_DEFAULT_ATTRIBUTES,
  TYPE_ACTION,
  TYPE_CLASSIFICATION,
  TYPE_FUNCTION,
  TYPE_PHASE,
  TYPE_RECORD
} from '../../constants';
import config from '../../config';
import api from '../../utils/api';

const initialState = {
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
  terms: []
};

export const CLASSIFICATIONS_ERROR = 'classificationsErrorAction';
export const CLASSIFICATIONS_READY = 'classificationsReadyAction';
export const REQUEST_CLASSIFICATIONS = 'requestClassificationsAction';
export const RECEIVE_CLASSIFICATIONS = 'receiveClassificationsAction';
export const FILTER_ITEMS = 'filterItemsAction';
export const SEARCH_ITEMS = 'searchItemsAction';
export const SEARCH_SUGGESTIONS = 'searchSuggestionsAction';
export const SET_ATTRIBUTE_TYPES = 'setAttributeTypesAction';
export const TOGGLE_ATTRIBUTE = 'toggleAttributeAction';
export const TOGGLE_ATTRIBUTE_OPTION = 'toggleAttributeOptionAction';
export const TOGGLE_SHOW_ALL_ATTRIBUTE_OPTIONS =
  'toggleShowAllAttributeOptionsAction';

export function requestNavigation() {
  return createAction(REQUEST_CLASSIFICATIONS)();
}

export function receiveNavigation(items, page) {
  return createAction(RECEIVE_CLASSIFICATIONS)({
    items,
    page
  });
}

export function receivedNavigation() {
  return createAction(CLASSIFICATIONS_READY)();
}

export function updateAttributeTypes(attributeTypes) {
  const attributes = Object.keys(attributeTypes).reduce((acc, key) => {
    if (Object.prototype.hasOwnProperty.call(attributeTypes, key)) {
      const attr = attributeTypes[key];
      attr.allowedIn.forEach((type) => {
        acc.push({
          key,
          name: attr.name,
          type
        });
      });
    }
    return acc;
  }, []);
  const metadata = FACETED_SEARCH_DEFAULT_ATTRIBUTES.reduce(
    (acc, attr) => {
      acc[attr.key] = {
        name: attr.name
      };
      return acc;
    },
    { ...attributeTypes }
  );
  const allAttributes = [...FACETED_SEARCH_DEFAULT_ATTRIBUTES, ...attributes];
  allAttributes.forEach((attr) => {
    attr.open = false;
    attr.showAll = false;
    attr.options = [];
  });
  return createAction(SET_ATTRIBUTE_TYPES)({
    attributes: allAttributes,
    metadata
  });
}

export function fetchClassifications(page = 1) {
  const pageSize = config.SEARCH_PAGE_SIZE;
  return (dispatch, getState) => {
    if (page === 1) {
      dispatch(updateAttributeTypes(getState().ui.attributeTypes));
    }
    dispatch(requestNavigation());
    return api
      .get('classification', {
        include_related: true,
        page_size: pageSize,
        page
      })
      .then((response) => response.json())
      .then((json) => {
        dispatch(receiveNavigation(json.results, page));
        return json;
      })
      .then((json) => dispatch(
        json.next ? fetchClassifications(page + 1) : receivedNavigation()
      ))
      .catch(() => dispatch(createAction(CLASSIFICATIONS_ERROR)()));
  };
}

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
    if (Object.prototype.hasOwnProperty.call(acc, facet.key)) {
      acc[facet.key].push(...facet.hits);
    } else {
      acc[facet.key] = [...facet.hits];
    }
    return acc;
  }, {});
  const ids = Object.keys(byKeys || {}).reduce((acc, key, index) => {
    const hits = [];
    if (Object.prototype.hasOwnProperty.call(byKeys, key)) {
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
        Object.prototype.hasOwnProperty.call(item.attributes, attribute.key) &&
        !isEmpty(item.attributes[attribute.key])
      ) {
        const index = findIndex(attribute.options, {
          value: item.attributes[attribute.key]
        });
        if (index >= 0) {
          attribute.options[index].hits.push(item.id);
        } else {
          attribute.options.push({
            hits: [item.id],
            ref: toLower(item.attributes[attribute.key]),
            value: item.attributes[attribute.key],
            selected: false
          });
        }
      }
    });
  });
  return typeAttributes;
};

export function searchItems(searchTerm, isSuggestionsOnly = false, type) {
  const TERM_AND = 'AND';
  const TERM_NOT = 'NOT';
  const TERM_OR = 'OR';
  const terms = words(searchTerm, /[^, ]+/g);
  const splitted = terms.reduce(
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
      lastOperator: null
    }
  );
  const { andTerms, notTerms, orTerms } = splitted;

  return (dispatch, getState) => {
    const { attributes } = getState().search;
    const filteredAttributes = searchTerm
      ? attributes.reduce((acc, attr) => {
        const options = filter(attr.options, (option) => (
          (isEmpty(andTerms) ||
            every(andTerms, (st) => includes(option.ref, st))) &&
          (isEmpty(orTerms) ||
            some(orTerms, (st) => includes(option.ref, st))) &&
          (isEmpty(notTerms) ||
            every(notTerms, (st) => !includes(option.ref, st)))
        ));
        if (!isEmpty(options)) {
          acc.push({ ...attr, options, open: false, showAll: false });
        }
        return acc;
      }, [])
      : attributes;

    const classifications = getFilteredHits(
      filteredAttributes,
      TYPE_CLASSIFICATION
    );
    const functions = getFilteredHits(filteredAttributes, TYPE_FUNCTION);
    const phases = getFilteredHits(filteredAttributes, TYPE_PHASE);
    const actions = getFilteredHits(filteredAttributes, TYPE_ACTION);
    const records = getFilteredHits(filteredAttributes, TYPE_RECORD);
    const suggestions = [
      {
        type: TYPE_CLASSIFICATION,
        hits: classifications
      },
      {
        type: TYPE_FUNCTION,
        hits: functions
      },
      {
        type: TYPE_PHASE,
        hits: phases
      },
      {
        type: TYPE_ACTION,
        hits: actions
      },
      {
        type: TYPE_RECORD,
        hits: records
      }
    ];
    if (isSuggestionsOnly) {
      return dispatch(createAction(SEARCH_SUGGESTIONS)(suggestions));
    }
    return dispatch(
      createAction(SEARCH_ITEMS)({
        classifications:
          !type || type === TYPE_CLASSIFICATION ? classifications : [],
        filteredAttributes,
        functions:
          type === TYPE_FUNCTION || (!type && isEmpty(classifications))
            ? functions
            : [],
        phases:
          type === TYPE_PHASE ||
            (!type && isEmpty(classifications) && isEmpty(functions))
            ? phases
            : [],
        actions:
          type === TYPE_ACTION ||
            (!type &&
              isEmpty(classifications) &&
              isEmpty(functions) &&
              isEmpty(phases))
            ? actions
            : [],
        records:
          type === TYPE_RECORD ||
            (!type &&
              isEmpty(classifications) &&
              isEmpty(functions) &&
              isEmpty(phases) &&
              isEmpty(actions))
            ? records
            : [],
        suggestions: [],
        terms: [...andTerms, ...orTerms]
      })
    );
  };
}

export function resetSuggestions() {
  return createAction(SEARCH_SUGGESTIONS)([]);
}

export function filterItems(selectedFacets) {
  return (dispatch, getState) => {
    let classifications = getFacetHits(selectedFacets[TYPE_CLASSIFICATION]);
    let functions = getFacetHits(selectedFacets[TYPE_FUNCTION]);
    let phases = getFacetHits(selectedFacets[TYPE_PHASE]);
    let actions = getFacetHits(selectedFacets[TYPE_ACTION]);
    let records = getFacetHits(selectedFacets[TYPE_RECORD]);
    if (
      !isEmpty(selectedFacets[TYPE_CLASSIFICATION]) ||
      !isEmpty(selectedFacets[TYPE_FUNCTION]) ||
      !isEmpty(selectedFacets[TYPE_PHASE]) ||
      !isEmpty(selectedFacets[TYPE_ACTION]) ||
      !isEmpty(selectedFacets[TYPE_RECORD])
    ) {
      return dispatch(
        createAction(SEARCH_ITEMS)({
          classifications,
          functions,
          phases,
          actions,
          records
        })
      );
    }
    const { filteredAttributes } = getState().search;
    classifications = getFilteredHits(filteredAttributes, TYPE_CLASSIFICATION);
    functions = isEmpty(classifications)
      ? getFilteredHits(filteredAttributes, TYPE_FUNCTION)
      : [];
    phases =
      isEmpty(classifications) && isEmpty(functions)
        ? getFilteredHits(filteredAttributes, TYPE_PHASE)
        : [];
    actions =
      isEmpty(classifications) && isEmpty(functions) && isEmpty(phases)
        ? getFilteredHits(filteredAttributes, TYPE_ACTION)
        : [];
    records =
      isEmpty(classifications) &&
        isEmpty(functions) &&
        isEmpty(phases) &&
        isEmpty(actions)
        ? getFilteredHits(filteredAttributes, TYPE_RECORD)
        : [];
    return dispatch(
      createAction(SEARCH_ITEMS)({
        classifications,
        functions,
        phases,
        actions,
        records
      })
    );
  };
}

export function toggleAttributeOpen(attribute) {
  return createAction(TOGGLE_ATTRIBUTE)(attribute);
}

export function toggleAttributeOption(attribute, option) {
  return createAction(TOGGLE_ATTRIBUTE_OPTION)({ attribute, option });
}

export function toggleShowAllAttributeOptions(attribute) {
  return createAction(TOGGLE_SHOW_ALL_ATTRIBUTE_OPTIONS)(attribute);
}

const classificationsErrorAction = (state) => update(state, {
  isFetching: { $set: false },
  items: { $set: [] }
});

const classificationsReadyAction = (state) => update(state, {
  isFetching: { $set: false }
});

const requestClassificationsAction = (state) => update(state, {
  isFetching: { $set: true }
});

const receiveClassificationsAction = (state, { payload }) => {
  const { items, page } = payload;
  const isAdd = page > 1;

  const data = items.reduce(
    (acc, item) => {
      const name = `${item.code} ${item.title}`;
      const parent = item.parent
        ? acc.headers[item.parent.id] || state.headers[item.parent.id]
        : null;
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
          description_internal: item.description_internal
        },
        classification: item.id,
        function: item.function || null,
        name,
        parents,
        path: parent ? parent.path : [],
        type: TYPE_CLASSIFICATION
      });
      if (item.function) {
        parents.push(item.id);
        acc.functions.push({
          attributes: {
            ...item.function_attributes,
            function_state: item.function_state,
            function_valid_from: item.function_valid_from,
            function_valid_to: item.function_valid_to
          },
          children: null,
          classification: item.id,
          function: item.function,
          id: item.function,
          name,
          parents,
          path,
          type: TYPE_FUNCTION
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
            type: TYPE_PHASE
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
                type: TYPE_ACTION
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
                    type: TYPE_RECORD
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
      records: []
    }
  );
  const {
    actions,
    classifications,
    functions,
    headers,
    phases,
    records
  } = data;
  const { attributes } = state;
  const classificationAttr = getFacetAttributesForType(
    attributes,
    classifications,
    TYPE_CLASSIFICATION
  );
  const functionAttr = getFacetAttributesForType(
    attributes,
    functions,
    TYPE_FUNCTION
  );
  const phaseAttr = getFacetAttributesForType(attributes, phases, TYPE_PHASE);
  const actionAttr = getFacetAttributesForType(
    attributes,
    actions,
    TYPE_ACTION
  );
  const recordAttr = getFacetAttributesForType(
    attributes,
    records,
    TYPE_RECORD
  );
  const filteredAttributes = [
    ...classificationAttr,
    ...functionAttr,
    ...phaseAttr,
    ...actionAttr,
    ...recordAttr
  ];

  return update(state, {
    actions: isAdd
      ? { $splice: [[state.actions.length, 0, ...actions]] }
      : { $set: actions },
    attributes: { $set: filteredAttributes },
    filteredAttributes: { $set: filteredAttributes },
    classifications: isAdd
      ? { $splice: [[state.classifications.length, 0, ...classifications]] }
      : { $set: classifications },
    exportItems: { $set: [...state.exportItems, ...classifications] },
    functions: isAdd
      ? { $splice: [[state.functions.length, 0, ...functions]] }
      : { $set: functions },
    headers: { $merge: headers },
    items: isAdd
      ? { $splice: [[state.classifications.length, 0, ...classifications]] }
      : { $set: classifications },
    page: { $set: payload.page },
    phases: isAdd
      ? { $splice: [[state.phases.length, 0, ...phases]] }
      : { $set: phases },
    records: isAdd
      ? { $splice: [[state.records.length, 0, ...records]] }
      : { $set: records }
  });
};

const searchSuggestionsAction = (state, { payload }) => update(state, {
  suggestions: { $set: payload }
});

const searchItemsAction = (state, { payload }) => {
  const { classifications, functions, phases, actions, records } = state;
  const { filteredAttributes } = payload;
  const terms = payload.terms || state.terms;
  if (
    isEmpty(payload.classifications) &&
    isEmpty(payload.functions) &&
    isEmpty(payload.phases) &&
    isEmpty(payload.actions) &&
    isEmpty(payload.records)
  ) {
    return update(state, {
      exportItems: { $set: !filteredAttributes ? functions : [] },
      filteredAttributes: {
        $set: filteredAttributes || state.filteredAttributes
      },
      items: { $set: [] },
      suggestions: { $set: [] }
    });
  }
  const filteredItems = [
    {
      facet: payload.classifications,
      items: classifications
    },
    {
      facet: payload.functions,
      items: functions
    },
    {
      facet: payload.phases,
      items: phases
    },
    {
      facet: payload.actions,
      items: actions
    },
    {
      facet: payload.records,
      items: records
    }
  ].reduce((acc, current) => {
    if (!isEmpty(current.facet)) {
      return filter(current.items, (item) => (
        includes(current.facet, item.id) &&
        (isEmpty(acc) ||
          (!isEmpty(acc) && some(acc, (a) => includes(item.parents, a.id))))
      ));
    }
    return acc;
  }, []);

  const items = filteredItems.map((item) => {
    if (!isEmpty(terms)) {
      const matchedAttributes = Object.keys(item.attributes || {}).reduce(
        (acc, key) => {
          if (Object.prototype.hasOwnProperty.call(item.attributes, key) && key !== 'name') {
            const attrValue = isArray(item.attributes[key])
              ? item.attributes[key].join(', ')
              : item.attributes[key];
            const isHit = some(terms, (term) =>
              new RegExp(term, 'gi').test(attrValue)
            );
            if (isHit) {
              const value = terms.reduce((valAcc, term) => valAcc.replace(
                new RegExp(term, 'gi'),
                (match) => `<mark>${match}</mark>`
              ), attrValue);
              acc.push({ key, value });
            }
          }
          return acc;
        },
        []
      );
      return {
        ...item,
        matchedAttributes,
        matchedName: isEmpty(terms)
          ? item.name
          : terms.reduce((acc, term) => acc.replace(
            new RegExp(term, 'gi'),
            (match) => `<mark>${match}</mark>`
          ), item.name || '')
      };
    }
    return item;
  });

  const exportItems = items.reduce((acc, item) => {
    const accClass = item.classification
      ? find(acc, { classification: item.classification })
      : null;
    if (!accClass) {
      if (item.type === TYPE_CLASSIFICATION) {
        acc.push(item);
      } else {
        const classification = find(classifications, {
          id: item.classification
        });
        if (classification) {
          acc.push(classification);
        }
      }
    }
    return acc;
  }, []);

  return update(state, {
    filteredAttributes: {
      $set: filteredAttributes || state.filteredAttributes
    },
    exportItems: { $set: exportItems },
    items: { $set: items },
    suggestions: { $set: [] },
    terms: { $set: payload.terms || terms }
  });
};

const setAttributeTypesAction = (state, { payload }) => update(state, {
  attributes: { $set: payload.attributes },
  metadata: { $set: payload.metadata },
  filteredAttributes: { $set: payload.attributes }
});

const toggleAttributeAction = (state, { payload }) => {
  const { key, open, showAll, type } = payload;
  const index = findIndex(state.filteredAttributes, { key, type });
  if (index >= 0) {
    return update(state, {
      filteredAttributes: {
        [index]: {
          open: { $set: !open },
          showAll: { $set: !open ? false : showAll }
        }
      }
    });
  }
  return state;
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

const toggleAttributeOptionAction = (state, { payload }) => {
  const {
    actions,
    filteredAttributes,
    classifications,
    functions,
    phases,
    records
  } = state;
  const { key, type, options } = payload.attribute;
  const { selected, value } = payload.option;
  const attributeIndex = findIndex(filteredAttributes, { key, type });
  const valueIndex = findIndex(options, { value });
  if (attributeIndex >= 0 && valueIndex >= 0) {
    const classificationItems = getSelectedItemsForType(
      filteredAttributes,
      TYPE_CLASSIFICATION,
      classifications
    );
    const functionItems = getSelectedItemsForType(
      filteredAttributes,
      TYPE_FUNCTION,
      functions
    );
    const phaseItems = getSelectedItemsForType(
      filteredAttributes,
      TYPE_PHASE,
      phases
    );
    const actionItems = getSelectedItemsForType(
      filteredAttributes,
      TYPE_ACTION,
      actions
    );
    const recordItems = getSelectedItemsForType(
      filteredAttributes,
      TYPE_RECORD,
      records
    );
    return update(state, {
      filteredAttributes: {
        [attributeIndex]: {
          options: { [valueIndex]: { selected: { $set: !selected } } }
        }
      },
      items: {
        $set: [
          ...classificationItems,
          ...functionItems,
          ...phaseItems,
          ...actionItems,
          ...recordItems
        ]
      }
    });
  }
  return state;
};

const toggleShowAllAttributeOptionsAction = (state, { payload }) => {
  const { key, showAll, type } = payload;
  const index = findIndex(state.filteredAttributes, { key, type });
  if (index >= 0) {
    return update(state, {
      filteredAttributes: { [index]: { showAll: { $set: !showAll } } }
    });
  }
  return state;
};

export default handleActions(
  {
    classificationsErrorAction,
    classificationsReadyAction,
    requestClassificationsAction,
    receiveClassificationsAction,
    searchItemsAction,
    searchSuggestionsAction,
    setAttributeTypesAction,
    toggleAttributeAction,
    toggleAttributeOptionAction,
    toggleShowAllAttributeOptionsAction
  },
  initialState
);
