import fetch from 'isomorphic-fetch';
import update from 'immutability-helper';
import { createAction, handleActions } from 'redux-actions';
import { isEmpty, get, isString } from 'lodash';

// import { centeredPopUp } from '../../utils/helpers';
import { default as api } from '../../utils/api';
import { setStorageItem, removeStorageItem } from '../../utils/storage';

const initialState = {
  data: null,
  isFetching: false
};

export const RECEIVE_USERDATA = 'receiveUserDataAction';
export const CLEAR_USERDATA = 'clearUserDataAction';
export const RETRIEVE_USERDATA = 'retrieveUserFromSessionAction';
export const ERROR_USERDATA = 'errorUserDataAction';
export const LOGIN = 'login';
export const LOGOUT = 'logout';

export function receiveUserData (user) {
  return createAction(RECEIVE_USERDATA)(user);
}

export function clearUserData () {
  return createAction(CLEAR_USERDATA)();
}

export function retrieveUserFromSession () {
  return function (dispatch) {
    dispatch(createAction(RETRIEVE_USERDATA)());
    return fetch(`/auth/me?${+new Date()}`, {
      method: 'GET',
      credentials: 'same-origin'
    })
      .then(res => {
        return res.json();
      })
      .then(user => {
        if (isString(user.token) && !isEmpty(user.token)) {
          setStorageItem('token', user.token);
          const url = `user/${user.id}`;
          return api
            .get(url)
            .then(helermUserData => {
              if (helermUserData.status === 401) {
                return logout()(dispatch);
              }
              return helermUserData.json();
            })
            .then(helermUser => {
              const permissions = get(helermUser, 'permissions', []);
              const userWithPermissions = Object.assign({}, user, {
                permissions: permissions
              });
              return dispatch(receiveUserData(userWithPermissions));
            })
            .catch(() => {
              dispatch(createAction(ERROR_USERDATA)());
            });
        }
        return dispatch(receiveUserData(user));
      })
      .catch(() => {
        dispatch(createAction(ERROR_USERDATA)());
      });
  };
}

export function login () {
  window.location.assign(`/auth/login/helsinki?next=${window.location.href}`);
  return createAction(LOGIN);
}

export function logout () {
  return function (dispatch) {
    dispatch(createAction(LOGOUT));
    removeStorageItem('token');
    dispatch(clearUserData());
    window.location.assign(`/auth/logout?next=${window.location.origin}`);
  };
}

export function logoutUnauthorized () {
  return function (dispatch) {
    dispatch(createAction(LOGOUT));
    removeStorageItem('token');
    dispatch(clearUserData());
    window.location.assign(`/auth/login/helsinki?next=${window.location.href}`);
  };
}

const retrieveUserFromSessionAction = (state) => update(state, {
  isFetching: { $set: true }
});

const receiveUserDataAction = (state, { payload }) => {
  return update(state, {
    data: { $set: payload },
    isFetching: { $set: false }
  });
};

const clearUserDataAction = state => {
  return update(state, {
    $set: initialState
  });
};

const errorUserDataAction = state => {
  return update(state, {
    data: { $set: {} },
    isFetching: { $set: false }
  });
};

export default handleActions(
  {
    receiveUserDataAction,
    clearUserDataAction,
    retrieveUserFromSessionAction,
    errorUserDataAction
  },
  initialState
);
