import { createSlice } from '@reduxjs/toolkit';

const initialTheme = localStorage.getItem('theme') || 'dark'; // Récupère le mode enregistré ou par défaut 'dark'

const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    mode: initialTheme, // 'dark' ou 'light'
  },
  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', state.mode); // Enregistre dans localStorage
      document.body.className = state.mode === 'dark' ? 'dark-mode' : 'light-mode'; // Applique la classe
    },
    setTheme: (state, action) => {
      state.mode = action.payload; // Définit un mode spécifique
      localStorage.setItem('theme', state.mode);
      document.body.className = state.mode === 'dark' ? 'dark-mode' : 'light-mode';
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
