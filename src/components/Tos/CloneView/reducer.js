
import update from 'immutability-helper';
import { createAction } from 'redux-actions';

import { normalizeTosFromApi } from '../../../utils/helpers';
import api from '../../../utils/api';

export const RECEIVE_TEMPLATE = 'receiveTemplateAction';
export const REQUEST_TOS = 'requestTosAction';
export const TOS_ERROR = 'tosErrorAction';

/**
 * Clones a template from the specified endpoint using the provided ID.
 *
 * @param {string} endpoint - The endpoint to clone the template from.
 * @param {string} id - The ID of the template to clone.
 * @returns {Function} - A function that dispatches actions to request the template, receive the template, or handle errors.
 */
export function cloneFromTemplate(endpoint, id) {
  return (dispatch) => {
    dispatch(createAction(REQUEST_TOS)());
    return api.get(`${endpoint}/${id}`)
      .then(res => {
        if (!res.ok) {
          throw new URIError(res.statusText);
        }
        return res.json();
      })
      .then(template => dispatch(createAction(RECEIVE_TEMPLATE)(template)))
      .catch(() => dispatch(createAction(TOS_ERROR)()));
  };
}

/**
 * Receive template action and update the state accordingly.
 *
 * @param {Object} state - The current state.
 * @param {Object} payload - The payload containing the template data.
 * @returns {Object} - The updated state.
 */
export const receiveTemplateAction = (state, { payload }) => {
  const { entities: { tos, phases, actions, records }, result } = normalizeTosFromApi(payload);

  return update(state, {
    attributes: {
      $merge: tos[result].attributes || {}
    },
    actions: {
      $merge: actions || {}
    },
    phases: {
      $merge: phases || {}
    },
    records: {
      $merge: records || {}
    },
    lastUpdated: {
      $set: Date.now()
    },
    documentState: {
      $set: 'edit'
    },
    isFetching: {
      $set: false
    },
    is_open: {
      $set: false
    },
    valid_from: {
      $set: null
    },
    valid_to: {
      $set: null
    }
  });
};
