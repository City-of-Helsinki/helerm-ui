import update from 'immutability-helper';
import { createAction } from 'redux-actions';

import { REQUEST_TOS, TOS_ERROR } from '../reducer';
import { normalizeTosFromApi } from '../../../utils/helpers';
import { default as api } from '../../../utils/api';

export const RECEIVE_TEMPLATE = 'receiveTemplateAction';

export function cloneFromTemplate (id) {
  return function (dispatch) {
    dispatch(createAction(REQUEST_TOS)());
    return api.get(`template/${id}`)
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
      $set: tos[result].attributes
    },
    actions: {
      $set: actions
    },
    phases: {
      $set: phases
    },
    records: {
      $set: records
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
