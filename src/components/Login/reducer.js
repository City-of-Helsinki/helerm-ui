/* eslint-disable import/no-named-as-default-member */
import update from 'immutability-helper';
import { createAction, handleActions } from 'redux-actions';
import { get } from 'lodash';

import api from '../../utils/api';
import { getClient } from '../../utils/oidcClient'
import { getStorageItem } from '../../utils/storage';
import { USER_LOGIN_STATUS } from '../../constants'

const initialState = {
  data: null,
  isFetching: false,
  status: USER_LOGIN_STATUS.NONE,
};

export const RECEIVE_USERDATA = 'receiveUserDataAction';
export const CLEAR_USERDATA = 'clearUserDataAction';
export const RETRIEVE_USERDATA = 'retrieveUserFromSessionAction';
export const ERROR_USERDATA = 'errorUserDataAction';
export const LOGIN = 'login';
export const LOGOUT = 'logout';
export const LOGIN_STATUS = 'loginStatusAction';

export function receiveUserData(user) {
  return createAction(RECEIVE_USERDATA)(user);
}

export function clearUserData() {
  return createAction(CLEAR_USERDATA)();
}

export function logout() {
  return (dispatch) => {
    dispatch(createAction(LOGOUT));
    getClient().logout();
    dispatch(clearUserData());
  };
}

export function retrieveUserFromSession() {
  return (dispatch) => {
    const id = getStorageItem('user')
    const token = getStorageItem('oidctoken')
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
          return logout()(dispatch);
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

export function handleLoginCallback() {
  return (dispatch) => {
    dispatch(createAction(LOGIN_STATUS)(USER_LOGIN_STATUS.INITIALIZING));
    return getClient().handleCallback()
      .then(() => {
        dispatch(createAction(LOGIN_STATUS)(USER_LOGIN_STATUS.AUTHORIZED));
        dispatch(retrieveUserFromSession())
      })
      .catch(() => {
        dispatch(createAction(LOGIN_STATUS)(USER_LOGIN_STATUS.UNAUTHORIZED));
      });
  };
}

export function handleRenewCallback() {
  return (dispatch) => {
    dispatch(createAction(LOGIN_STATUS)(USER_LOGIN_STATUS.INITIALIZING));
    return getClient().handleRenewCallback()
      .then(() => {
        dispatch(createAction(LOGIN_STATUS)(USER_LOGIN_STATUS.AUTHORIZED));
      })
      .catch(() => {
        dispatch(createAction(LOGIN_STATUS)(USER_LOGIN_STATUS.UNAUTHORIZED));
      });
  };
}

export function login() {
  return (dispatch) => {
    getClient().login();
    dispatch(createAction(LOGIN));
  };
}

export function logoutUnauthorized() {
  return (dispatch) => {
    dispatch(createAction(LOGOUT));
    getClient().logout();
    dispatch(clearUserData());
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

const clearUserDataAction = (state) => update(state, {
  $set: initialState
});

const errorUserDataAction = (state) => update(state, {
  data: { $set: {} },
  isFetching: { $set: false }
});

const loginStatusAction = (state, { payload }) => update(state, {
  status: { $set: payload },
})

export default handleActions(
  {
    receiveUserDataAction,
    clearUserDataAction,
    retrieveUserFromSessionAction,
    errorUserDataAction,
    loginStatusAction,
  },
  initialState
);
