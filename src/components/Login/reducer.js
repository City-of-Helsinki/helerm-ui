import fetch from 'isomorphic-fetch';
import update from 'immutability-helper';
import { createAction, handleActions } from 'redux-actions';
import { isEmpty, get, isString } from 'lodash';

// import { centeredPopUp } from '../../utils/helpers';
import { default as api } from '../../utils/api';
import { setStorageItem, removeStorageItem } from '../../utils/storage';

const initialState = {};

export const RECEIVE_USERDATA = 'receiveUserDataAction';
export const CLEAR_USERDATA = 'clearUserDataAction';
export const LOGIN = 'login';

export function receiveUserData (user) {
  return createAction(RECEIVE_USERDATA)(user);
}

export function clearUserData () {
  return createAction(CLEAR_USERDATA)();
}

export function retrieveUserFromSession () {
  return function (dispatch) {
    return fetch(`/auth/me?${+new Date()}`, { method: 'GET', credentials: 'same-origin' })
      .then((res) => {
        return res.json();
      })
      .then((user) => {
        if (isString(user.token) && !isEmpty(user.token)) {
          setStorageItem('token', user.token);
          const url = `user/${user.id}`;
          return api.get(url)
            .then((helermUserData) => {
              if (helermUserData.status === 401) {
                return fetch('/auth/logout', {
                  method: 'POST',
                  credentials: 'same-origin',
                  mode: 'no-cors'
                })
                  .then(() => {
                    removeStorageItem('token');
                    dispatch(clearUserData());
                    return window.location.reload();
                  });
              }
              return helermUserData.json();
            })
            .then((helermUser) => {
              const permissions = get(helermUser, 'permissions', []);
              const userWithPermissions = Object.assign({},
                user,
                { permissions: permissions }
              );
              return dispatch(receiveUserData(userWithPermissions));
            });
        }
        return dispatch(receiveUserData(user));
      });
  };
}

export function login () {
  window.location.assign('/auth/login/helsinki');
  return createAction(LOGIN);
}

export function logout () {
  return function (dispatch) {
    return fetch('/auth/logout', {
      method: 'POST',
      credentials: 'same-origin',
      mode: 'no-cors'
    })
      .then(() => {
        removeStorageItem('token');
        dispatch(clearUserData());
      });
  };
}

const receiveUserDataAction = (state, { payload }) => {
  return update(state, {
    $merge: payload
  });
};

const clearUserDataAction = (state) => {
  return update(state, {
    $set: initialState
  });
};

export default handleActions({
  receiveUserDataAction,
  clearUserDataAction
}, initialState);
