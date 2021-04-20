import update from 'immutability-helper';
import { createAction, handleActions } from 'redux-actions';
import { get } from 'lodash';

import api from '../../utils/api';
import { getClient } from '../../utils/oidcClient'
import { removeStorageItem, getStorageItem } from '../../utils/storage';
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

export function handleLoginCallback() {
  return function (dispatch) {
    dispatch(createAction(LOGIN_STATUS)(USER_LOGIN_STATUS.INITIALIZING));
    return getClient().handleCallback()
      .then(res => {
        dispatch(createAction(LOGIN_STATUS)(USER_LOGIN_STATUS.AUTHORIZED));
        dispatch(retrieveUserFromSession())
      })
      .catch((err) => {
        dispatch(createAction(LOGIN_STATUS)(USER_LOGIN_STATUS.UNAUTHORIZED));
      });
  };
}

export function retrieveUserFromSession() {
  return function (dispatch) {
    const id = getStorageItem('user')
    const token = getStorageItem('oidctoken')
    if (!id || !token) {
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
      .catch((err) => {
        dispatch(createAction(ERROR_USERDATA)());
      });
  };
}

export function login() {
  return function (dispatch) {
    getClient().login();
    dispatch(createAction(LOGIN));
  };
}

export function logout() {
  return function (dispatch) {
    dispatch(createAction(LOGOUT));
    removeStorageItem('token');
    removeStorageItem('oidctoken');
    removeStorageItem('user');
    getClient().logout();
    dispatch(clearUserData());
  };
}

export function logoutUnauthorized() {
  return function (dispatch) {
    dispatch(createAction(LOGOUT));
    removeStorageItem('token');
    removeStorageItem('oidctoken');
    removeStorageItem('user');
    getClient().logout();
    dispatch(clearUserData());
  };
}

const retrieveUserFromSessionAction = (state) =>
  update(state, {
    isFetching: { $set: true }
  });

const receiveUserDataAction = (state, { payload }) => {
  return update(state, {
    data: { $set: payload },
    isFetching: { $set: false }
  });
};

const clearUserDataAction = (state) => {
  return update(state, {
    $set: initialState
  });
};

const errorUserDataAction = (state) => {
  return update(state, {
    data: { $set: {} },
    isFetching: { $set: false }
  });
};

const loginStatusAction = (state, { payload }) => {
  return update(state, {
    status: { $set: payload },
  });
}

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
