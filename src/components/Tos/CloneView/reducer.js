import update from 'immutability-helper';
import { createAction } from 'redux-actions';

import { REQUEST_TOS, TOS_ERROR } from '../reducer';
import { normalizeTosFromApi } from '../../../utils/helpers';
import { default as api } from '../../../utils/api';

export const RECEIVE_TEMPLATE = 'receiveTemplateAction';

export function cloneFromTemplate (endpoint, id) {
  return function (dispatch) {
    dispatch(createAction(REQUEST_TOS)());
    return api.get(`${endpoint}/${id}`)
      .then(res => {
        if (!res.ok) {
          dispatch(createAction(TOS_ERROR)());
          throw new URIError(res.statusText);
        }
        return res.json();
      })
      .then(template => dispatch(createAction(RECEIVE_TEMPLATE)(template)));
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
    }
  });
};
