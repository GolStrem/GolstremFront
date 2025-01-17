import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isAuthenticated: false,
    userCode: '',
  },
  reducers: {
    login(state, action) {
      state.isAuthenticated = true;
      state.userCode = action.payload;
    },
    logout(state) {
      state.isAuthenticated = false;
      state.userCode = '';
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
