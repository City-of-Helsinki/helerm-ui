/* eslint-disable no-param-reassign */
import fetch from 'isomorphic-fetch';
import { forEach, merge } from 'lodash';

import config from '../config';

/**
 * Which actions are allowed without authentication
 * @type {[*]}
 */
const ALLOWED_METHODS_WITHOUT_AUTHENTICATION = ['GET'];

const CONTENT_TYPE_JSON = 'application/json';

/**
 * Custom error to throw when 401 is received
 * @extends Error
 */
export class Unauthorized extends Error {
  constructor(message) {
    super(message);
    this.name = 'Unauthorized';
  }
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

  return pairs.length ? `?${pairs.join('&')}` : '';
}

/**
 *
 * @param url
 * @param query
 * @returns {string}
 */
export function getApiUrl(url, query = {}) {
  const queryString = buildQueryString(query);
  return [config.API_URL, config.API_VERSION, url, queryString].join('/');
}

/**
 *
 * @param endpoint
 * @param params
 * @param options
 * @param token - Required token parameter for authenticated requests
 * @returns {*}
 */
export function callApi(endpoint, params, options = {}, token = null) {
  const defaultHeaders = new Headers();
  const url = getApiUrl(endpoint, params);
  const finalOptions = merge(
    {
      method: 'GET',
      credentials: 'include',
      mode: 'cors',
    },
    options,
  );

  defaultHeaders.append('Accept', CONTENT_TYPE_JSON);

  if (!token && ALLOWED_METHODS_WITHOUT_AUTHENTICATION.indexOf(finalOptions.method) !== 0) {
    throw Error(
      `Following methods for API-endpoint require authentication: ${ALLOWED_METHODS_WITHOUT_AUTHENTICATION.join(', ')}`,
    );
  }

  if (token) {
    defaultHeaders.append('Authorization', `Bearer ${token}`);
  }

  if (options.headers) {
    Object.keys(options.headers).forEach((key) => {
      defaultHeaders.append(key, options.headers[key]);
    });
  }

  finalOptions.headers = defaultHeaders;

  return fetch(url, finalOptions).then((res) => {
    if (res.status === 401) {
      throw new Unauthorized(url);
    }
    return res;
  });
}

/**
 *
 * @param endpoint
 * @param params
 * @param options
 * @returns {*}
 */
export function get(endpoint, params = {}, options = {}, token = null) {
  return callApi(endpoint, params, options, token);
}

/**
 *
 * @param endpoint
 * @param data
 * @param params
 * @param options
 * @param token
 * @returns {*}
 */
export function post(endpoint, data, params = {}, options = {}, token = null) {
  if (typeof data !== 'string') {
    data = JSON.stringify(data);
    options.headers = merge({ 'Content-Type': CONTENT_TYPE_JSON }, options.headers);
  }
  return callApi(endpoint, params, merge({ body: data, method: 'POST' }, options), token);
}

/**
 *
 * @param endpoint
 * @param data
 * @param params
 * @param options
 * @param token
 * @returns {*}
 */
export function put(endpoint, data, params = {}, options = {}, token = null) {
  if (typeof data !== 'string') {
    data = JSON.stringify(data);
    options.headers = merge({ 'Content-Type': CONTENT_TYPE_JSON }, options.headers);
  }
  return callApi(endpoint, params, merge({ body: data, method: 'PUT' }, options), token);
}

export function patch(endpoint, data, params = {}, options = {}, token = null) {
  if (typeof data !== 'string') {
    data = JSON.stringify(data);
    options.headers = merge({ 'Content-Type': CONTENT_TYPE_JSON }, options.headers);
  }
  return callApi(endpoint, params, merge({ body: data, method: 'PATCH' }, options), token);
}

/**
 *
 * @param endpoint
 * @param params
 * @param options
 * @param token
 * @returns {*}
 */
export function del(endpoint, params = {}, options = { method: 'DELETE' }, token = null) {
  return callApi(endpoint, params, options, token);
}

const methods = { get, post, put, patch, del };

export default methods;
