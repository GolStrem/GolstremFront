import { createSlice } from '@reduxjs/toolkit';

const token = localStorage.getItem('token');

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isAuthenticated: !!token,
    token: token || null,
    pseudo: localStorage.getItem('pseudo') || null,
    avatar: localStorage.getItem('avatar') || null,
  },
  reducers: {
    login(state, action) {
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.pseudo = action.payload.pseudo || '';
      state.avatar = action.payload.avatar || '';
      localStorage.setItem('token', state.token);
    },
    logout(state) {
      state.isAuthenticated = false;
      state.token = null;
      state.pseudo = null;
      state.avatar = null;
      localStorage.removeItem('token');
    },
    setUserData(state, action) {
      const entries = Object.entries(action.payload);
      entries.forEach(([key, value]) => {
        state[key] = value;
        localStorage.setItem(key, value);
      });
    }
  },
});

export const { login, logout, setUserData } = authSlice.actions;
export default authSlice.reducer;
