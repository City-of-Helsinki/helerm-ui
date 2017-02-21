import { get, isString } from 'lodash';
import _debug from 'debug';

const debug = _debug('app:storage');

/**
 *
 * @param {string} key
 */
export function getStorageItem (key) {
  const [root, ...rest] = key.split('.');
  const item = localStorage.getItem(buildStorageKey(root));
  const value = isJson(item) ? JSON.parse(item) : item;
  return rest.length ? get(value, rest.join('.')) : value;
}

/**
 *
 * @param {string} key
 * @param {*} value
 */
export function setStorageItem (key, value) {
  if (!isString(value)) {
    value = JSON.stringify(value);
  }
  try {
    localStorage.setItem(buildStorageKey(key), value);
    debug('storage item set: %s -> %s', key, value);
  } catch (e) {
    // fall silently
  }
}

/**
 *
 * @param {string} key
 */
export function removeStorageItem (key) {
  localStorage.removeItem(buildStorageKey(key));
  debug('storage item removed: %s', key);
}

/**
 *
 * @param {string} key
 * @returns {string}
 */
function buildStorageKey (key) {
  return [STORAGE_PREFIX, key].join('.');
}

/**
 *
 * @param {*} value
 * @returns {boolean}
 */
function isJson (value) {
  try {
    JSON.parse(value);
  } catch (e) {
    return false;
  }
  return true;
}
