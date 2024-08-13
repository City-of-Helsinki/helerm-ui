/* eslint-disable camelcase */
/* eslint-disable import/no-named-as-default-member */
import update from 'immutability-helper';
import { createAction } from 'redux-actions';

import { normalizeTosFromApi } from '../../../utils/helpers';
import api from '../../../utils/api';

export const RECEIVE_TEMPLATE = 'receiveTemplateAction';
export const REQUEST_TOS = 'requestTosAction';
export const TOS_ERROR = 'tosErrorAction';

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
