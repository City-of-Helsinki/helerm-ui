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

    dispatch(clearUserData());
  };
}

export function retrieveUserFromSession(id) {
  return async (dispatch) => {
    try {
      const token = getApiTokenFromStorage(config.API_TOKEN_AUTH_AUDIENCE);

      if (!id || !token) {
        dispatch(createAction(ERROR_USERDATA)());
        dispatch(createAction(LOGIN_STATUS)(USER_LOGIN_STATUS.NONE));

        return null
      }

      dispatch(createAction(RETRIEVE_USERDATA)());
      dispatch(createAction(LOGIN_STATUS)(USER_LOGIN_STATUS.INITIALIZING));

      const url = `user/${id}`;

      const response = await api.get(url);

      if (response.status === 401) {
        throw new Unauthorized(url);
      }

      const json = await response.json();

      const permissions = get(json, 'permissions', []);

      const userWithPermissions = {
        id,
        firstName: json.first_name,
        lastName: json.last_name,
        permissions,
      };

      dispatch(createAction(LOGIN_STATUS)(USER_LOGIN_STATUS.AUTHORIZED));

      return dispatch(receiveUserData(userWithPermissions));
      // eslint-disable-next-line sonarjs/no-ignored-exceptions, no-unused-vars
    } catch (error) {
      dispatch(createAction(LOGIN_STATUS)(USER_LOGIN_STATUS.UNAUTHORIZED));

      return dispatch(createAction(ERROR_USERDATA)());
    }
  };
}

export function handleLoginCallbackInitialize() {
  return (dispatch) => { dispatch(createAction(LOGIN_STATUS)(USER_LOGIN_STATUS.INITIALIZING)) };
}

export function handleLoginCallbackError() {
  return (dispatch) => {
    dispatch(createAction(LOGIN_STATUS)(USER_LOGIN_STATUS.UNAUTHORIZED));
  };
}

export function login() {
  return (dispatch) => {
    dispatch(createAction(LOGIN));
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
