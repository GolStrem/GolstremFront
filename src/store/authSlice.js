// store/authSlice.js
import { createSlice } from '@reduxjs/toolkit';

// Récupère le token depuis localStorage au chargement
const token = localStorage.getItem('token');

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isAuthenticated: !!token,
    userCode: '',
    token: token || null,
  },
  reducers: {
    login(state, action) {
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.userCode = action.payload.userCode || '';
      localStorage.setItem('token', state.token);
    },
    logout(state) {
      state.isAuthenticated = false;
      state.token = null;
      state.userCode = '';
      localStorage.removeItem('token');
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
