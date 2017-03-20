import fetch from 'isomorphic-fetch';
import Promise from 'promise-polyfill';
import {
  forEach,
  merge
} from 'lodash';

import { getStorageItem, removeStorageItem } from './storage';

/**
 * Which actions are allowed without authentication
 * @type {[*]}
 */
const ALLOWED_METHODS_WITHOUT_AUTHENTICATION = ['GET'];

// Add Promise to window if not supported...
if (!window.Promise) {
  window.Promise = Promise;
}

/**
 *
 * @param endpoint
 * @param params
 * @param options
 * @returns {*}
 */
export function get (endpoint, params = {}, options = {}) {
  return callApi(endpoint, params, options);
}

/**
 *
 * @param endpoint
 * @param data
 * @param params
 * @param options
 * @returns {*}
 */
export function post (endpoint, data, params = {}, options = {}) {
  if (typeof data !== 'string') {
    data = JSON.stringify(data);
    options.headers = merge(
      { 'Content-Type': 'application/json' },
      options.headers
    );
  }
  return callApi(endpoint, params, merge({ body: data, method: 'POST' }, options));
}

/**
 *
 * @param endpoint
 * @param data
 * @param params
 * @param options
 * @returns {*}
 */
export function put (endpoint, data, params = {}, options = {}) {
  if (typeof data !== 'string') {
    data = JSON.stringify(data);
    options.headers = merge(
      { 'Content-Type': 'application/json' },
      options.headers
    );
  }
  return callApi(endpoint, params, merge({ body: data, method: 'PUT' }, options));
}

export function patch (endpoint, data, params = {}, options = {}) {
  if (typeof data !== 'string') {
    data = JSON.stringify(data);
    options.headers = merge(
      { 'Content-Type': 'application/json' },
      options.headers
    );
  }
  return callApi(endpoint, params, merge({ body: data, method: 'PATCH' }, options));
}

/**
 *
 * @param endpoint
 * @param params
 * @param options
 * @returns {*}
 */
export function del (endpoint, params = {}, options = { method: 'DELETE' }) {
  return callApi(endpoint, params, options);
}

/**
 *
 * @param endpoint
 * @param params
 * @param options
 * @returns {*}
 */
export function callApi (endpoint, params, options = {}) {
  const token = getStorageItem('token');
  const defaultHeaders = new Headers();
  const url = getApiUrl(endpoint, params);
  const finalOptions = merge({
    method: 'GET',
    credentials: 'include',
    mode: 'cors'
  }, options);

  defaultHeaders.append('Accept', 'application/json');

  if (!token && ALLOWED_METHODS_WITHOUT_AUTHENTICATION.indexOf(finalOptions.method) !== 0) {
    throw Error(`Following methods for API-endpoint require authentication: ${ALLOWED_METHODS_WITHOUT_AUTHENTICATION.join(', ')}`);
  }

  if (token) {
    defaultHeaders.append('Authorization', `JWT ${token}`);
  }

  if (options.headers) {
    Object.keys(options.headers).map(key => {
      defaultHeaders.append(key, options.headers[key]);
    });
  }

  finalOptions.headers = defaultHeaders;
  return fetch(url, finalOptions)
    .then(res => {
      // TODO: Remove me & use refresh token
      if (res.status === 401) {
        removeStorageItem('token', () => {
          return window.location.reload();
        });
      }
      return res;
    });
}

/**
 *
 * @param url
 * @param query
 * @returns {string}
 */
export function getApiUrl (url, query = {}) {
  const queryString = buildQueryString(query);
  return [API_URL, API_VERSION, url, queryString].join('/');
}

/**
 *
 * @param query
 * @returns {string}
 */
export function buildQueryString (query) {
  const pairs = [];

  forEach(query, (value, key) => {
    pairs.push([key, value].join('='));
  });

  return pairs.length ? '?' + pairs.join('&') : '';
}

export default { get, post, put, patch, del };
