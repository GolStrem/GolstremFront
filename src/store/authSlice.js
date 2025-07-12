import { createSlice } from '@reduxjs/toolkit';

const token = localStorage.getItem('token');

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isAuthenticated: !!token,
    userCode: localStorage.getItem('pseudo') || '',
    token: token || null,
    pseudo: localStorage.getItem('pseudo') || null,
    avatar: localStorage.getItem('avatar') || null,
  },
  reducers: {
    login(state, action) {
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.userCode = action.payload.userCode || '';
      state.pseudo = action.payload.pseudo || '';
      state.avatar = action.payload.avatar || '';
      localStorage.setItem('token', state.token);
    },
    logout(state) {
      state.isAuthenticated = false;
      state.token = null;
      state.userCode = '';
      state.pseudo = null;
      state.avatar = null;
      localStorage.removeItem('token');
    },
    setUserPseudo(state, action) {
      state.pseudo = action.payload;
      state.userCode = action.payload;
    },
    setUserAvatar(state, action) {
      state.avatar = action.payload;
    },
  },
});

export const { login, logout, setUserPseudo, setUserAvatar } = authSlice.actions;
export default authSlice.reducer;