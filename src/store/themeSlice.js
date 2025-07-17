import { createSlice } from '@reduxjs/toolkit';

const initialTheme = localStorage.getItem('theme') || 'dark'; // Récupère le mode enregistré ou par défaut 'dark'
switchColor(initialTheme)

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
      switchColor(state.mode)
    },
    setTheme: (state, action) => {
      state.mode = action.payload; // Définit un mode spécifique
      localStorage.setItem('theme', state.mode);
      document.body.className = state.mode === 'dark' ? 'dark-mode' : 'light-mode';

      switchColor(state.mode)
    },
  },
});

function switchColor(theme) {
  document.documentElement.style.setProperty("--color-text", theme === 'dark' ? '#ddd' : 'black');
  document.documentElement.style.setProperty("--color-button", theme === 'dark' ? 'white' : 'black');
}

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
