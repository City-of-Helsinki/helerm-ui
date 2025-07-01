import { createSlice } from '@reduxjs/toolkit';

export const initialState = {
  location: null,
  action: null
};

const routerSlice = createSlice({
  name: 'router',
  initialState,
  reducers: {
    locationChange: (state, action) => {
      state.location = action.payload.location;
      state.action = action.payload.action;
    }
  }
});

export const { locationChange } = routerSlice.actions;

export default routerSlice.reducer;
