import LTT from 'list-to-tree';
import { normalize, schema } from 'normalizr';
import { toastr } from 'react-redux-toastr';
import moment from 'moment';
import {
  filter,
  find,
  flatten,
  includes,
  isEmpty,
  map,
  orderBy
} from 'lodash';

import {
  DRAFT,
  SENT_FOR_REVIEW,
  WAITING_FOR_APPROVAL,
  APPROVED
} from '../../config/constants';

export function convertToTree (itemList) {
  // ------------------------------------
  // Combine navigation number and names
  // and
  // Give each item in the navigation a level specific id for sorting
  // ------------------------------------
  itemList.results.map(item => {
    item.name = item.function_id + ' ' + item.name;
    item.sort_id = item.function_id.substring(item.function_id.length - 2, item.function_id.length);
    item.path = [];
  });
  const ltt = new LTT(itemList.results, {
    key_id: 'id',
    key_parent: 'parent',
    key_child: 'children'
  });
  const unOrderedTree = ltt.GetTree();
  // ------------------------------------
  // Sort the tree, as ltt doesnt automatically do it
  // ------------------------------------
  const sortTree = tree => {
    tree = orderBy(tree, ['sort_id'], 'asc');
    return tree.map(item => {
      if (item.children !== undefined) {
        // ------------------------------------
        // Generate path to show when navigation is minimized and Tos is shown
        // ------------------------------------
        item.path.push(item.name);
        item.children.map(child => {
          item.path.map(path => child.path.push(path));
        });
        item.children = orderBy(item.children, ['sort_id'], 'asc');
        sortTree(item.children);
      }
      return item;
    });
  };
  return sortTree(unOrderedTree);
}

/**
 * Normalize TOS coming from API
 * @param tos
 * @returns {{entities: any, result: any}}
 */
export function normalizeTosFromApi (tos) {
  tos.phases.map((phase, phaseIndex) => {
    phase.index = phase.index || phaseIndex;
    phase.is_open = false;
    phase.actions.map((action, actionIndex) => {
      action.index = action.index || actionIndex;
      action.records.map((record, recordIndex) => {
        record.index = record.index || recordIndex;
        record.is_open = false;
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
 * Normalize tos for API
 * @param tos
 * @returns {*}
 */
export function normalizeTosForApi (tos) {
  // TODO: needs some serious refactoring...
  const finalTos = Object.assign({}, tos);
  const phases = map(finalTos.phases, phase => Object.assign({}, phase));
  const finalPhases = [];

  phases.map((phase, phaseIndex) => {
    finalPhases.push(Object.assign({}, phase));
    return phase.actions.map((action, actionIndex) => {
      const actionId = typeof action === 'string' ? action : action.id;
      Object.assign(finalPhases[phaseIndex].actions, { [actionIndex]: finalTos.actions[actionId] });
      return finalTos.actions[actionId].records.map((record, recordsIndex) => {
        const recordId = typeof record === 'string' ? record : record.id;
        return Object.assign(finalPhases[phaseIndex].actions[actionIndex].records, { [recordsIndex]: finalTos.records[recordId] });
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
export function itemById (items, id) {
  let searchResult = find(items, (item) => (item.id === id));

  if (!searchResult) {
    let filteredItems = filter(items, (item) => (item.children));
    let subset = flatten(map(filteredItems, (item) => (item.children)));

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
export function centeredPopUp (url, title, w, h) {
  const left = (screen.width / 2) - (w / 2);
  const top = (screen.height / 2) - (h / 2);
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
  `);
}

/**
 * Check for user permissions
 * @param user
 * @param permission
 * @returns {*}
 */
export function checkPermissions (user, permission) {
  return !isEmpty(user) && includes(user.permissions, permission);
}

/**
 * Get status's label
 * @param status
 * @returns {*}
 */
export function getStatusLabel (status) {
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
export function displayMessage (message, opts = { type: 'success' }) {
  const { title, body } = message;
  return toastr[opts.type](title, body, opts);
}

/**
 * Format datetime-object
 * @param dateTime
 * @param format
 * @returns {string}
 */
export function formatDateTime (dateTime, format = 'DD.MM.YYYY HH:mm') {
  return moment(dateTime).format(format);
}
