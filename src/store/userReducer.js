import fetch from 'isomorphic-fetch';
import update from 'immutability-helper';
import { isEmpty, get, isString } from 'lodash';

import { centeredPopUp } from '../utils/helpers';
import { default as api } from '../utils/api';
import { setStorageItem, removeStorageItem } from '../utils/storage';

// ------------------------------------
// Constants
// ------------------------------------
export const RECEIVE_USERDATA = 'user/RECEIVE_USERDATA';
export const CLEAR_USERDATA = 'user/CLEAR_USERDATA';

// ------------------------------------
// Actions
// ------------------------------------

export function receiveUserData (user) {
  return {
    type: RECEIVE_USERDATA,
    user
  };
}

export function clearUserData () {
  return {
    type: CLEAR_USERDATA
  };
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
  return function (dispatch) {
    return new Promise((resolve) => {
      const loginPopup = centeredPopUp(
        '/auth/login/helsinki',
        'helermLoginWindow',
        720,
        600
      );

      const wait = function wait () {
        if (!loginPopup || loginPopup.closed) {
          resolve(true);
          return;
        }
        setTimeout(wait, 500); // Try again in a bit...
      };

      wait();
    })
      .then(() => {
        return dispatch(retrieveUserFromSession());
      });
  };
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

export const actions = {
  login,
  logout,
  retrieveUserFromSession
};

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [RECEIVE_USERDATA]: (state, action) => {
    const { user } = action;
    return update(state, {
      $merge: user
    });
  },
  [CLEAR_USERDATA]: (state) => {
    return update(state, {
      $set: initialState
    });
  }
};

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {};

export default function userReducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type];
  return handler ? handler(state, action) : state;
}
