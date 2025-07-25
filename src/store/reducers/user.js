import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { get } from 'lodash';
import { getApiTokenFromStorage } from 'hds-react'

import api, { Unauthorized } from '../../utils/api';
import { USER_LOGIN_STATUS } from '../../constants'
import config from '../../config';

export const initialState = {
  data: null,
  isFetching: false,
  status: USER_LOGIN_STATUS.NONE,
  error: null
};

export const retrieveUserFromSession = createAsyncThunk(
  'user/retrieveUserFromSession',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const token = getApiTokenFromStorage(config.API_TOKEN_AUTH_AUDIENCE);

      if (!id || !token) {
        dispatch(loginSlice.actions.setLoginStatus(USER_LOGIN_STATUS.NONE));

        return rejectWithValue('No ID or token provided');
      }

      dispatch(loginSlice.actions.setLoginStatus(USER_LOGIN_STATUS.INITIALIZING));

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

      dispatch(loginSlice.actions.setLoginStatus(USER_LOGIN_STATUS.AUTHORIZED));

      return userWithPermissions;
    } catch (error) {
      dispatch(loginSlice.actions.setLoginStatus(USER_LOGIN_STATUS.UNAUTHORIZED));

      return rejectWithValue(error instanceof Error ? error.message : 'Failed to retrieve user data');
    }
  }
);

export const logoutUserThunk = createAsyncThunk(
  'user/logout',
  async (_, { dispatch }) => {
    dispatch(loginSlice.actions.setLoginStatus(USER_LOGIN_STATUS.NONE));

    return null;
  }
);

export const initializeLoginCallbackThunk = createAsyncThunk(
  'user/initializeLoginCallback',
  async (_, { dispatch }) => {
    dispatch(loginSlice.actions.setLoginStatus(USER_LOGIN_STATUS.INITIALIZING));

    return null;
  }
);

export const handleLoginCallbackErrorThunk = createAsyncThunk(
  'user/handleLoginCallbackError',
  async (error, { dispatch, rejectWithValue }) => {
    dispatch(loginSlice.actions.setLoginStatus(USER_LOGIN_STATUS.UNAUTHORIZED));

    return rejectWithValue(error instanceof Error ? error.message : String(error));
  }
);

const loginSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUserData: () => initialState,
    setLoginStatus: (state, action) => {
      state.status = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(retrieveUserFromSession.pending, (state) => {
        state.isFetching = true;
        state.error = null;
      })
      .addCase(retrieveUserFromSession.fulfilled, (state, action) => {
        state.data = action.payload;
        state.isFetching = false;
        state.error = null;
      })
      .addCase(retrieveUserFromSession.rejected, (state, action) => {
        state.data = {};
        state.isFetching = false;
        state.error = action.payload || 'Failed to retrieve user data';
      })

      .addCase(logoutUserThunk.fulfilled, () => {
        return initialState;
      })

      .addCase(initializeLoginCallbackThunk.fulfilled, (state) => {
        state.status = USER_LOGIN_STATUS.INITIALIZING;
      })

      .addCase(handleLoginCallbackErrorThunk.fulfilled, (state) => {
        state.status = USER_LOGIN_STATUS.UNAUTHORIZED;
        state.data = null;
      });
  },
  selectors: {
    userDataSelector: (state) => state.data,
    userPermissionsSelector: (state) => state.data?.permissions || [],
    loginStatusSelector: (state) => state.status,
    isFetchingSelector: (state) => state.isFetching,
    errorSelector: (state) => state.error,
    isAuthorizedSelector: (state) => state.status === USER_LOGIN_STATUS.AUTHORIZED,
    isAuthenticatedSelector: (state) =>
      state.status === USER_LOGIN_STATUS.AUTHORIZED ||
      state.status === USER_LOGIN_STATUS.INITIALIZING,
    hasPermissionSelector: (state, permission) =>
      (state.data?.permissions || []).includes(permission),
  }
});

export const {
  clearUserData,
  setLoginStatus: loginStatus,
} = loginSlice.actions;

export const {
  userDataSelector,
  userPermissionsSelector,
  loginStatusSelector,
  isFetchingSelector,
  errorSelector,
  isAuthorizedSelector,
  isAuthenticatedSelector,
  hasPermissionSelector,
} = loginSlice.selectors;

export default loginSlice.reducer;
