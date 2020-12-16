import fetch from 'isomorphic-fetch';
import { forEach, merge } from 'lodash';
import { config } from '../config';
import { getStorageItem, removeStorageItem } from './storage';

/**
 * Which actions are allowed without authentication
 * @type {[*]}
 */
const ALLOWED_METHODS_WITHOUT_AUTHENTICATION = ['GET'];


/**
 * Custom error to throw when 401 is received
 * @extends Error
 */
class Unauthorized extends Error {
  constructor(message) {
    super(message);
    this.name = 'Unauthorized';
  }
}

/**
 *
 * @param endpoint
 * @param params
 * @param options
 * @returns {*}
 */
export function get(endpoint, params = {}, options = {}) {
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
export function post(endpoint, data, params = {}, options = {}) {
  if (typeof data !== 'string') {
    data = JSON.stringify(data);
    options.headers = merge(
      { 'Content-Type': 'application/json' },
      options.headers
    );
  }
  return callApi(
    endpoint,
    params,
    merge({ body: data, method: 'POST' }, options)
  );
}

/**
 *
 * @param endpoint
 * @param data
 * @param params
 * @param options
 * @returns {*}
 */
export function put(endpoint, data, params = {}, options = {}) {
  if (typeof data !== 'string') {
    data = JSON.stringify(data);
    options.headers = merge(
      { 'Content-Type': 'application/json' },
      options.headers
    );
  }
  return callApi(
    endpoint,
    params,
    merge({ body: data, method: 'PUT' }, options)
  );
}

export function patch(endpoint, data, params = {}, options = {}) {
  if (typeof data !== 'string') {
    data = JSON.stringify(data);
    options.headers = merge(
      { 'Content-Type': 'application/json' },
      options.headers
    );
  }
  return callApi(
    endpoint,
    params,
    merge({ body: data, method: 'PATCH' }, options)
  );
}

/**
 *
 * @param endpoint
 * @param params
 * @param options
 * @returns {*}
 */
export function del(endpoint, params = {}, options = { method: 'DELETE' }) {
  return callApi(endpoint, params, options);
}

/**
 *
 * @param endpoint
 * @param params
 * @param options
 * @returns {*}
 */
export function callApi(endpoint, params, options = {}) {
  const token = getStorageItem('token');
  const defaultHeaders = new Headers();
  const url = getApiUrl(endpoint, params);
  const finalOptions = merge(
    {
      method: 'GET',
      credentials: 'include',
      mode: 'cors'
    },
    options
  );

  defaultHeaders.append('Accept', 'application/json');

  if (
    !token &&
    ALLOWED_METHODS_WITHOUT_AUTHENTICATION.indexOf(finalOptions.method) !== 0
  ) {
    throw Error(
      `Following methods for API-endpoint require authentication: ${ALLOWED_METHODS_WITHOUT_AUTHENTICATION.join(
        ', '
      )}`
    );
  }

  if (token) {
    defaultHeaders.append('Authorization', `JWT ${token}`);
  }

  if (options.headers) {
    Object.keys(options.headers).forEach((key) => {
      defaultHeaders.append(key, options.headers[key]);
    });
  }

  finalOptions.headers = defaultHeaders;
  return fetch(url, finalOptions).then((res) => {
    if (res.status === 401) {
      // Actions dispatched based on the response cannot
      // happen here, because it will introduce circular
      // dependencies api -> reducer -> api (with or without
      // intermediate modules).
      // Now it clears the token from localStorage and redirects
      // user to logout endpoint (ending the sso session) or
      // if the user was not logged in at all, redirects to login.
      if (token) {
        removeStorageItem('token');
        window.location.assign(`/auth/logout?next=${window.location.origin}`);
      } else {
        window.location.assign(
          `/auth/login/helsinki?next=${window.location.href}`
        );
      }
      throw new Unauthorized(url);
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
export function getApiUrl(url, query = {}) {
  const queryString = buildQueryString(query);
  return [
    config.API_URL,
    config.API_VERSION,
    url,
    queryString
  ].join('/');
}

/**
 *
 * @param query
 * @returns {string}
 */
export function buildQueryString(query) {
  const pairs = [];

  forEach(query, (value, key) => {
    pairs.push([key, value].join('='));
  });

  return pairs.length ? '?' + pairs.join('&') : '';
}
const methods = { get, post, put, patch, del };
export default methods;
