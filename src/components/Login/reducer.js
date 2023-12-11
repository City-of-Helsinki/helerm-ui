/* eslint-disable import/no-named-as-default-member */
import update from 'immutability-helper';
import { createAction, handleActions } from 'redux-actions';
import { get } from 'lodash';
import { getApiTokenFromStorage } from 'hds-react'

import api, { Unauthorized } from '../../utils/api';
import { USER_LOGIN_STATUS } from '../../constants'
import config from '../../config';

const initialState = {
  data: null,
  isFetching: false,
  status: USER_LOGIN_STATUS.NONE,
};

export const RECEIVE_USERDATA = 'receiveUserDataAction';
export const RETRIEVE_USERDATA = 'retrieveUserFromSessionAction';
export const ERROR_USERDATA = 'errorUserDataAction';
export const LOGIN_STATUS = 'loginStatusAction';

export function receiveUserData(user) {
  return createAction(RECEIVE_USERDATA)(user);
}

export function retrieveUserFromSession(id) {
  return (dispatch) => {
    const token = getApiTokenFromStorage(config.API_TOKEN_AUTH_AUDIENCE);

    if (!id || !token) {
      dispatch(createAction(ERROR_USERDATA)());
      dispatch(createAction(LOGIN_STATUS)(USER_LOGIN_STATUS.NONE));
      return null
    }
    dispatch(createAction(RETRIEVE_USERDATA)());
    dispatch(createAction(LOGIN_STATUS)(USER_LOGIN_STATUS.INITIALIZING));
    const url = `user/${id}`;
    return api
      .get(url)
      .then((helermUserData) => {
        if (helermUserData.status === 401) {
          throw new Unauthorized(url)
        }
        return helermUserData.json();
      })
      .then((helermUser) => {
        const permissions = get(helermUser, 'permissions', []);
        const userWithPermissions = {
          id,
          firstName: helermUser.first_name,
          lastName: helermUser.last_name,
          permissions,
        };
        return dispatch(receiveUserData(userWithPermissions));
      })
      .catch(() => {
        dispatch(createAction(ERROR_USERDATA)());
      });
  };
}

const retrieveUserFromSessionAction = (state) =>
  update(state, {
    isFetching: { $set: true }
  });

const receiveUserDataAction = (state, { payload }) => update(state, {
  data: { $set: payload },
  isFetching: { $set: false }
});

export default handleActions(
  {
    retrieveUserFromSessionAction,
    receiveUserDataAction
  },
  initialState
);
