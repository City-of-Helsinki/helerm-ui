/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-return-assign */
/* eslint-disable react/react-in-jsx-scope */
import { normalize, schema } from 'normalizr';
import { toastr } from 'react-redux-toastr';
import moment from 'moment';
import { filter, find, flatten, includes, isEmpty, map, orderBy } from 'lodash';

import {
  DRAFT,
  SENT_FOR_REVIEW,
  WAITING_FOR_APPROVAL,
  APPROVED
} from '../constants';

export function convertToTree(itemList) {
  // ------------------------------------
  // Combine navigation number and names and
  // give each item in the navigation a level specific id for sorting.
  // ------------------------------------
  const newList = itemList.map((item) => ({
    name: `${item.code} ${item.title}`,
    sort_id: item.code.substring(item.code.length - 2, item.code.length),
    path: [],
    parent_id: item.parent ? item.parent.id : null,
    ...item
  }));

  const dict = {};
  newList.forEach((item) => (dict[item.id] = item));
  const mem = new Set();

  const resolveParent = (item) => {
    if (item.parent_id !== null && !mem.has(item.id)) {
      const parent = dict[item.parent_id];
      if (!parent) {
        // in case of a broken tree parent will be null
        throw Error(`Parent with id ${item.parent_id} not found`);
      }
      if (Array.isArray(parent.children)) {
        parent.children.push(item);
        // keep the children sorted
        parent.children.sort((a, b) => a.sort_id.localeCompare(b.sort_id));
      } else {
        parent.children = [item];
      }
      mem.add(item.id);
      resolveParent(parent);
    }
  };

  for (const item of newList) {
    if (!mem.has(item.id)) {
      resolveParent(item);
    }
  }
  // recurse throught the tree to resolve paths for UI
  const affixPath = (rootNode) => {
    if (!rootNode.children) {
      return;
    }
    for (const kid of rootNode.children) {
      kid.path = kid.path.concat(...rootNode.path, rootNode.name);
      affixPath(kid);
    }
  };
  const roots = newList.filter((l) => l.parent_id === null);
  roots.forEach((root) => affixPath(root));
  return roots.sort((a, b) => a.sort_id.localeCompare(b.sort_id));
}

/**
 * Normalize TOS coming from API
 * @param tos
 * @returns {{entities: any, result: any}}
 */
export function normalizeTosFromApi(tos) {
  tos.phases.forEach((p, phaseIndex) => {
    p.index = p.index || phaseIndex;
    p.is_attributes_open = false;
    p.is_open = false;
    p.actions.forEach((a, actionIndex) => {
      a.index = a.index || actionIndex;
      a.is_open = false;
      a.records.forEach((r, recordIndex) => {
        r.index = r.index || recordIndex;
        r.is_open = false;
      });
    });
  });
  const tosSchema = new schema.Entity('tos');
  const phase = new schema.Entity('phases');
  const action = new schema.Entity('actions');
  const record = new schema.Entity('records');

  tosSchema.define({
    phases: [phase]
  });
  phase.define({
    actions: [action]
  });
  action.define({
    records: [record]
  });
  return normalize(tos, tosSchema);
}

/**
 * Remove empty attributes for API
 * @param tosCopy
 * @returns {*}
 */
export function trimAttributes(tosCopy) {
  Object.keys(tosCopy.phases).forEach((phase) => {
    if (Object.prototype.hasOwnProperty.call(tosCopy.phases, phase)) {
      Object.keys(tosCopy.phases[phase].attributes).forEach((attribute) => {
        if (
          Object.prototype.hasOwnProperty.call(tosCopy.phases[phase].attributes, attribute) &&
          (tosCopy.phases[phase].attributes[attribute] === '' ||
            tosCopy.phases[phase].attributes[attribute] === null)
        ) {
          delete tosCopy.phases[phase].attributes[attribute];
        }
      });
    }
  });
  Object.keys(tosCopy.actions).forEach((action) => {
    if (Object.prototype.hasOwnProperty.call(tosCopy.actions, action)) {
      Object.keys(tosCopy.actions[action].attributes).forEach((attribute) => {
        if (
          Object.prototype.hasOwnProperty.call(tosCopy.actions[action].attributes, attribute) &&
          (tosCopy.actions[action].attributes[attribute] === '' ||
            tosCopy.actions[action].attributes[attribute] === null)
        ) {
          delete tosCopy.actions[action].attributes[attribute];
        }
      });
    }
  });
  Object.keys(tosCopy.records).forEach((record) => {
    if (Object.prototype.hasOwnProperty.call(tosCopy.records, record)) {
      Object.keys(tosCopy.records[record].attributes).forEach((attribute) => {
        if (
          Object.prototype.hasOwnProperty.call(tosCopy.records[record].attributes, attribute) &&
          (tosCopy.records[record].attributes[attribute] === '' ||
            tosCopy.records[record].attributes[attribute] === null)
        ) {
          delete tosCopy.records[record].attributes[attribute];
        }
      });
    }
  });

  return tosCopy;
}

/**
 * Normalize tos for API
 * @param tos
 * @returns {*}
 */
export function normalizeTosForApi(tos) {
  // TODO: needs some serious refactoring...
  const tosCopy = { ...tos };
  const finalTos = trimAttributes(tosCopy);
  const phases = map(finalTos.phases, (phase) => ({ ...phase }));
  const finalPhases = [];

  phases.map((phase, phaseIndex) => {
    finalPhases.push({ ...phase });
    return phase.actions.map((action, actionIndex) => {
      const actionId = typeof action === 'string' ? action : action.id;
      Object.assign(finalPhases[phaseIndex].actions, {
        [actionIndex]: finalTos.actions[actionId]
      });
      return finalTos.actions[actionId].records.map((record, recordsIndex) => {
        const recordId = typeof record === 'string' ? record : record.id;
        return Object.assign(
          finalPhases[phaseIndex].actions[actionIndex].records,
          { [recordsIndex]: finalTos.records[recordId] }
        );
      });
    });
  });

  return finalPhases;
}

/**
 * Find item by id (nested array with `children`-key)
 * @param items
 * @param id
 * @returns {*}
 */
export function itemById(items, id) {
  const searchResult = find(items, (item) => item.id === id);

  if (!searchResult) {
    const filteredItems = filter(items, (item) => item.children);
    const subset = flatten(map(filteredItems, (item) => item.children));

    if (subset.length !== 0) {
      return itemById(subset, id);
    }
    return null;
  }
  return searchResult;
}

/**
 * Centered PopUp-Window
 * @param url
 * @param title
 * @param w
 * @param h
 * @returns {Window}
 */
export function centeredPopUp(url, title, w, h) {
  const left = window.screen.width / 2 - w / 2;
  const top = window.screen.height / 2 - h / 2;
  return window.open(
    url,
    title,
    `
    toolbar=no,
    location=no,
    directories=no,
    status=no, menubar=no,
    scrollbars=no,
    resizable=no,
    copyhistory=no,
    width=${w}, height=${h}, top=${top}, left=${left}
  `
  );
}

/**
 * Check for user permissions
 * @param user
 * @param permission
 * @returns {*}
 */
export function checkPermissions(user, permission) {
  return !isEmpty(user) && includes(user.permissions, permission);
}

/**
 * Get status's label
 * @param status
 * @returns {*}
 */
export function getStatusLabel(status) {
  switch (status) {
    case DRAFT:
      return 'Luonnos';
    case SENT_FOR_REVIEW:
      return 'Tarkastettavana';
    case WAITING_FOR_APPROVAL:
      return 'Hyväksyttävänä';
    case APPROVED:
      return 'Hyväksytty';
    default:
      return 'Luonnos';
  }
}

/**
 * Display message in UI
 * @param message
 * @param opts
 */
export function displayMessage(message, opts = { type: 'success' }) {
  const { title, body } = message;
  return toastr[opts.type](title, body, opts);
}

export function confirmMessage(message, options = { onOk: () => { }, onCancel: () => { } }) {
  toastr.removeByType('confirm');
  toastr.confirm(
    null,
    {
      ...options,
      component: () => (
        <div className="confirm-toastr-component">
          <div><i className='fa-solid fa-triangle-exclamation' /></div>
          <div>{message}</div>
        </div>
      )
    }
  );
}

/**
 * Format datetime-object
 * @param dateTime
 * @param format
 * @returns {string}
 */
export function formatDateTime(dateTime, format = 'DD.MM.YYYY HH:mm') {
  return moment(dateTime).format(format);
}

/**
 * Return array of base values in order
 * @param attributeTypes
 * @param type
 * @returns {Array}
 */
export function getBaseValues(attributeTypes) {
  const baseValues = [
    { index: attributeTypes.PhaseType.index, type: 'PhaseType' },
    { index: attributeTypes.RecordType.index, type: 'RecordType' },
    { index: attributeTypes.ActionType.index, type: 'ActionType' },
    { index: attributeTypes.TypeSpecifier.index, type: 'TypeSpecifier' }
  ];
  const orderedBaseValues = orderBy(baseValues, ['index']);
  return orderedBaseValues.map((baseValue) => baseValue.type);
}

/**
 * Calculate new absolute path given current absolute path and relative path.
 * @param  {string} absolutePath
 * @param  {string} relativePath
 * @return {string}
 */
export function getNewPath(absolutePath, relativePath) {
  const pathParts = absolutePath.split('/').filter(Boolean);
  const relativeParts = relativePath.split('/').filter(Boolean);

  // Assume that all relative paths start with any other character than '/'.
  const isRelativeRelative = relativePath.charAt(0) !== '/';

  if (!isRelativeRelative) {
    // Assume that supposed relative path is aboslute if it's not relative.
    return relativePath;
  }

  return (
    `/${relativeParts
      .reduce((absoluteParts, part) => {
        switch (part) {
          case '..': {
            return absoluteParts.slice(0, absoluteParts.length - 1);
          }
          case '.': {
            return absoluteParts;
          }
          default: {
            return [...absoluteParts, part];
          }
        }
      }, pathParts)
      .join('/')}`
  );
}

/**
 * React-select can behave as multi- or single-select which have different
 * behaviours in emitting and displaying values. This general helper is used
 * when value(s) are mapped to be displayed.
 * @param options
 * @param receivedValue
 * @returns {null | Array<*> | * }
 */
export const resolveSelectValues = (options, receivedValue, multi = false) => {
  if (!receivedValue) {
    return null;
  }
  if (multi && Array.isArray(receivedValue)) {
    return options.filter(({ value }) => receivedValue.includes(value));
  }
  return options.find(({ value }) => value === receivedValue);
};

/**
 * React-select can behave as multi- or single-select which have different
 * behaviours in emitting and displaying values. This general helper is used
 * when value(s) are returned to the change handler.
 * Clearing the last element sets the value as null
 * while clearing the whole selection sets value as an empty array
 * (https://github.com/JedWatson/react-select/issues/3632)
 * @param {Array<any>}options
 * @param {any | Array<any>} receivedValue
 * @returns {null | Array<*> | * }
 */
export const resolveReturnValues = (emittedValue, multi = false) => {
  if (multi && !emittedValue) {
    return [];
  }
  return emittedValue;
};
