import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  mode: 'light'
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action) => {
      state.mode = action.payload;
    },
    switchTheme: (state) => {
      state.mode = state.mode === 'light' ? 'dark' : 'light';
    },
  },
});

export const getTheme = (store) => store.theme.mode;

export const { setTheme, switchTheme } = themeSlice.actions;

export default themeSlice.reducer;
