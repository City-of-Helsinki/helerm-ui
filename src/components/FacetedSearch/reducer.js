import update from 'immutability-helper';
import { createAction, handleActions } from 'redux-actions';
import { cloneDeep, every, filter, findIndex, includes, isEmpty, some, toLower, uniq } from 'lodash';

import {
  DEFAULT_SEARCH_PAGE_SIZE,
  FACETED_SEARCH_DEFAULT_ATTRIBUTES,
  TYPE_ACTION,
  TYPE_CLASSIFICATION,
  TYPE_FUNCTION,
  TYPE_PHASE,
  TYPE_RECORD
} from '../../../config/constants';

import { default as api } from '../../utils/api.js';

const initialState = {
  actions: [],
  classifications: [],
  attributes: [],
  filteredAttributes: [],
  functions: [],
  headers: {},
  isFetching: false,
  items: [],
  page: 1,
  phases: [],
  records: []
};

export const CLASSIFICATIONS_ERROR = 'classificationsErrorAction';
export const CLASSIFICATIONS_READY = 'classificationsReadyAction';
export const REQUEST_CLASSIFICATIONS = 'requestClassificationsAction';
export const RECEIVE_CLASSIFICATIONS = 'receiveClassificationsAction';
export const FILTER_ITEMS = 'filterItemsAction';
export const SEARCH_ITEMS = 'searchItemsAction';
export const SET_ATTRIBUTE_TYPES = 'setAttributeTypesAction';
export const TOGGLE_ATTRIBUTE = 'toggleAttributeAction';
export const TOGGLE_ATTRIBUTE_OPTION = 'toggleAttributeOptionAction';
export const TOGGLE_SHOW_ALL_ATTRIBUTE_OPTIONS = 'toggleShowAllAttributeOptionsAction';

export function requestNavigation () {
  return createAction(REQUEST_CLASSIFICATIONS)();
}

export function receiveNavigation (items, page) {
  return createAction(RECEIVE_CLASSIFICATIONS)({
    items,
    page
  });
}

export function receivedNavigation () {
  return createAction(CLASSIFICATIONS_READY)();
}

export function setAttributeTypes (attributeTypes) {
  const attributes = [...FACETED_SEARCH_DEFAULT_ATTRIBUTES, ...attributeTypes];
  return createAction(SET_ATTRIBUTE_TYPES, attributes);
}

export function updateAttributeTypes (attributeTypes) {
  const attributes = Object.keys(attributeTypes).reduce((acc, key) => {
    if (attributeTypes.hasOwnProperty(key)) {
      const attr = attributeTypes[key];
      attr.allowedIn.forEach(type => {
        acc.push({
          key,
          name: attr.name,
          type
        });
      });
    }
    return acc;
  }, []);
  const allAttributes = [...FACETED_SEARCH_DEFAULT_ATTRIBUTES, ...attributes];
  allAttributes.forEach(attr => {
    attr.open = false;
    attr.showAll = false;
    attr.options = [];
  });
  return createAction(SET_ATTRIBUTE_TYPES)(allAttributes);
};

export function fetchClassifications (page = 1) {
  const pageSize = SEARCH_PAGE_SIZE || DEFAULT_SEARCH_PAGE_SIZE;
  return function (dispatch, getState) {
    if (page === 1) {
      dispatch(updateAttributeTypes(getState().ui.attributeTypes));
    }
    dispatch(requestNavigation());
    return api.get('classification', {
      include_related: true,
      page_size: pageSize,
      page
    })
      .then(response => response.json())
      .then(json => {
        dispatch(receiveNavigation(json.results, page));
        return json;
      })
      .then(json => {
        return dispatch(json.next ? fetchClassifications(page + 1) : receivedNavigation());
      })
      .catch(() => dispatch(createAction(CLASSIFICATIONS_ERROR)()));
  };
};

export function searchItems (searchTerm) {
  const term = toLower(searchTerm);
  const isAnd = includes(term, 'and');
  const searchTerms = toLower(searchTerm).split(isAnd ? 'and' : 'or').map(term => term.trim());

  return function (dispatch, getState) {
    const attributes = getState().search.attributes;
    const filteredAttributes = searchTerm
      ? attributes.reduce((acc, attr) => {
        const options = filter(attr.options, option => {
          return isAnd
            ? every(searchTerms, st => includes(option.ref, st))
            : some(searchTerms, st => includes(option.ref, st));
        });
        if (!isEmpty(options)) {
          acc.push({ ...attr, options, open: false, showAll: false });
        }
        return acc;
      }, [])
      : attributes;

    const classifications = getFilteredHits(filteredAttributes, TYPE_CLASSIFICATION);
    const functions = isEmpty(classifications) ? getFilteredHits(filteredAttributes, TYPE_FUNCTION) : [];
    const phases = isEmpty(classifications) && isEmpty(functions) ? getFilteredHits(filteredAttributes, TYPE_PHASE) : [];
    const actions = isEmpty(classifications) && isEmpty(functions) && isEmpty(phases) ? getFilteredHits(filteredAttributes, TYPE_ACTION) : [];
    const records = isEmpty(classifications) && isEmpty(functions) && isEmpty(phases) && isEmpty(actions) ? getFilteredHits(filteredAttributes, TYPE_RECORD) : [];
    return dispatch(createAction(SEARCH_ITEMS)({
      classifications, filteredAttributes, functions, phases, actions, records
    }));
  };
}

export function filterItems (selectedFacets) {
  return function (dispatch, getState) {
    let classifications = getFacetHits(selectedFacets[TYPE_CLASSIFICATION]);
    let functions = getFacetHits(selectedFacets[TYPE_FUNCTION]);
    let phases = getFacetHits(selectedFacets[TYPE_PHASE]);
    let actions = getFacetHits(selectedFacets[TYPE_ACTION]);
    let records = getFacetHits(selectedFacets[TYPE_RECORD]);
    if (!isEmpty(classifications) || !isEmpty(functions) || !isEmpty(phases) || !isEmpty(actions) || !isEmpty(records)) {
      return dispatch(createAction(SEARCH_ITEMS)({
        classifications, functions, phases, actions, records
      }));
    }
    const filteredAttributes = getState().search.filteredAttributes;
    classifications = getFilteredHits(filteredAttributes, TYPE_CLASSIFICATION);
    functions = isEmpty(classifications) ? getFilteredHits(filteredAttributes, TYPE_FUNCTION) : [];
    phases = isEmpty(classifications) && isEmpty(functions) ? getFilteredHits(filteredAttributes, TYPE_PHASE) : [];
    actions = isEmpty(classifications) && isEmpty(functions) && isEmpty(phases) ? getFilteredHits(filteredAttributes, TYPE_ACTION) : [];
    records = isEmpty(classifications) && isEmpty(functions) && isEmpty(phases) && isEmpty(actions) ? getFilteredHits(filteredAttributes, TYPE_RECORD) : [];
    return dispatch(createAction(SEARCH_ITEMS)({
      classifications, functions, phases, actions, records
    }));
  };
}

export function toggleAttributeOpen (attribute) {
  return createAction(TOGGLE_ATTRIBUTE)(attribute);
};

export function toggleAttributeOption (attribute, option) {
  return createAction(TOGGLE_ATTRIBUTE_OPTION)({ attribute, option });
};

export function toggleShowAllAttributeOptions (attribute) {
  return createAction(TOGGLE_SHOW_ALL_ATTRIBUTE_OPTIONS)(attribute);
};

const classificationsErrorAction = (state) => {
  return update(state, {
    isFetching: { $set: false },
    items: { $set : [] }
  });
};

const classificationsReadyAction = (state) => {
  return update(state, {
    isFetching: { $set: false }
  });
};

const requestClassificationsAction = (state) => {
  return update(state, {
    isFetching: { $set: true }
  });
};

const receiveClassificationsAction = (state, { payload }) => {
  const { items, page } = payload;
  const isAdd = page > 1;

  const data = items.reduce((acc, item) => {
    const name = `${item.code} ${item.title}`;
    const parent = item.parent ? acc.headers[item.parent] || state.headers[item.parent] : null;
    const path = parent
      ? [...parent.path, name]
      : [name];
    const parents = parent ? [...parent.parents, item.parent] : [];
    acc.headers[item.id] = { name, parents, path };
    acc.classifications.push({
      attributes: {
        additional_information: item.additional_information,
        name,
        description: item.description,
        related_classification: item.related_classification,
        description_internal: item.description_internal
      },
      id: item.id,
      name,
      parents,
      path: parent ? parent.path : [],
      type: TYPE_CLASSIFICATION
    });
    if (item.function) {
      parents.push(item.id);
      acc.functions.push({
        ...item,
        attributes: { ...item.function_attributes, function_state: item.function_state },
        id: item.function,
        name,
        parents,
        path,
        type: TYPE_FUNCTION
      });
    }
    if (item.phases) {
      item.phases.forEach(phase => {
        acc.phases.push({ ...phase, parents: [...parents, phase.function], path, type: TYPE_PHASE });
        if (phase.actions) {
          phase.actions.forEach(action => {
            acc.actions.push({ ...action, parents: [...parents, phase.function, phase.id], path, type: TYPE_ACTION });
            if (action.records) {
              action.records.forEach(record => {
                acc.records.push({ ...record, parents: [...parents, phase.function, phase.id, action.id], path, type: TYPE_RECORD });
              });
            }
          });
        }
      });
    }
    return acc;
  }, {
    actions: [],
    classifications: [],
    functions: [],
    headers: {},
    phases: [],
    records: []
  });
  const { actions, classifications, functions, headers, phases, records } = data;
  const { attributes } = state;
  const classificationAttr = getFacetAttributesForType(attributes, classifications, TYPE_CLASSIFICATION);
  const functionAttr = getFacetAttributesForType(attributes, functions, TYPE_FUNCTION);
  const phaseAttr = getFacetAttributesForType(attributes, phases, TYPE_PHASE);
  const actionAttr = getFacetAttributesForType(attributes, actions, TYPE_ACTION);
  const recordAttr = getFacetAttributesForType(attributes, records, TYPE_RECORD);
  const filteredAttributes = [...classificationAttr, ...functionAttr, ...phaseAttr, ...actionAttr, ...recordAttr];

  return update(state, {
    actions: isAdd ? { $splice: [[state.actions.length, 0, ...actions]] } : { $set: actions },
    attributes: { $set: filteredAttributes },
    filteredAttributes: { $set: filteredAttributes },
    classifications: isAdd ? { $splice: [[state.classifications.length, 0, ...classifications]] } : { $set: classifications },
    functions: isAdd ? { $splice: [[state.functions.length, 0, ...functions]] } : { $set: functions },
    headers: { $merge: headers },
    items: isAdd ? { $splice: [[state.classifications.length, 0, ...classifications]] } : { $set: classifications },
    page: { $set: payload.page },
    phases: isAdd ? { $splice: [[state.phases.length, 0, ...phases]] } : { $set: phases },
    records: isAdd ? { $splice: [[state.records.length, 0, ...records]] } : { $set: records }
  });
};

const searchItemsAction = (state, { payload }) => {
  const { classifications, functions, phases, actions, records } = state;
  const { filteredAttributes } = payload;
  if (isEmpty(payload.classifications) && isEmpty(payload.functions) && isEmpty(payload.phases) &&
    isEmpty(payload.actions) && isEmpty(payload.records)) {
    return update(state, {
      filteredAttributes: { $set: filteredAttributes || state.filteredAttributes },
      items: { $set: !filteredAttributes ? classifications : [] }
    });
  }
  const items = [{
    facet: payload.classifications,
    items: classifications
  }, {
    facet: payload.functions,
    items: functions
  }, {
    facet: payload.phases,
    items: phases
  }, {
    facet: payload.actions,
    items: actions
  }, {
    facet: payload.records,
    items: records
  }].reduce((acc, current) => {
    if (!isEmpty(current.facet)) {
      return filter(current.items, item => {
        return includes(current.facet, item.id) && (
          isEmpty(acc) ||
          (!isEmpty(acc) && some(acc, a => includes(item.parents, a.id)))
        );
      });
    }
    return acc;
  }, []);

  return update(state, {
    filteredAttributes: { $set: filteredAttributes || state.filteredAttributes },
    items: { $set: items }
  });
};

const setAttributeTypesAction = (state, { payload }) => {
  return update(state, {
    attributes: { $set: payload },
    filteredAttributes: { $set: payload }
  });
};

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

const toggleAttributeOptionAction = (state, { payload }) => {
  const { actions, filteredAttributes, classifications, functions, phases, records } = state;
  const { key, type, options } = payload.attribute;
  const { selected, value } = payload.option;
  console.log('toggleAttributeOptionAction', key, value);
  const attributeIndex = findIndex(filteredAttributes, { key, type });
  const valueIndex = findIndex(options, { value });
  if (attributeIndex >= 0 && valueIndex >= 0) {
    const classificationItems = getSelectedItemsForType(filteredAttributes, TYPE_CLASSIFICATION, classifications);
    const functionItems = getSelectedItemsForType(filteredAttributes, TYPE_FUNCTION, functions);
    const phaseItems = getSelectedItemsForType(filteredAttributes, TYPE_PHASE, phases);
    const actionItems = getSelectedItemsForType(filteredAttributes, TYPE_ACTION, actions);
    const recordItems = getSelectedItemsForType(filteredAttributes, TYPE_RECORD, records);
    return update(state, {
      filteredAttributes: { [attributeIndex]: { options: { [valueIndex]: { selected: { $set: !selected } } } } },
      items: { $set: [...classificationItems, ...functionItems, ...phaseItems, ...actionItems, ...recordItems] }
    });
  }
  return state;
};

const toggleShowAllAttributeOptionsAction = (state, { payload }) => {
  const { key, showAll, type } = payload;
  const index = findIndex(state.filteredAttributes, { key, type });
  if (index >= 0) {
    return update(state, { filteredAttributes: { [index]: { showAll: { $set: !showAll } } } });
  }
  return state;
};

const getFacetAttributesForType = (attributes, items, type) => {
  const typeAttributes = cloneDeep(filter(attributes, { type }));
  typeAttributes.forEach(attribute => {
    items.forEach(item => {
      if (item.attributes && item.attributes.hasOwnProperty(attribute.key) && !isEmpty(item.attributes[attribute.key])) {
        const index = findIndex(attribute.options, { value: item.attributes[attribute.key] });
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
  return filter(items, item => includes(uniqIds, item.id));
};

const getFacetHits = (facets) => {
  return facets.reduce((acc, facet) => {
    acc.push(...facet.hits);
    return acc;
  }, []);
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

export default handleActions({
  classificationsErrorAction,
  classificationsReadyAction,
  requestClassificationsAction,
  receiveClassificationsAction,
  searchItemsAction,
  setAttributeTypesAction,
  toggleAttributeAction,
  toggleAttributeOptionAction,
  toggleShowAllAttributeOptionsAction
}, initialState);
