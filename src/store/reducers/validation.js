import { createSlice } from '@reduxjs/toolkit';

export const initialState = {
  is_open: false,
};

const validationSlice = createSlice({
  name: 'validation',
  initialState,
  reducers: {
    setValidationVisibility: (state, action) => {
      state.is_open = action.payload;
    },
  },
  selectors: {
    isOpenSelector: (state) => state.is_open,
  },
});

export const { setValidationVisibility } = validationSlice.actions;

export const { isOpenSelector } = validationSlice.selectors;

export default validationSlice.reducer;
