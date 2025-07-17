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
  document.documentElement.style.setProperty("--color-background", theme === 'dark' ? '#181818' : 'white');

  document.documentElement.style.setProperty("--color-modal", theme === 'dark' ? '#1f1f1f' : '#fff');
  document.documentElement.style.setProperty("--color-modal-text", theme === 'dark' ? '#f0f0f0' : '#111');
  document.documentElement.style.setProperty("--color-submit-text", theme === 'dark' ? '#f0f0f0' : '#000');

  document.documentElement.style.setProperty("--color-text-muted", theme === 'dark' ? '#bbb' : '#aaa');
  document.documentElement.style.setProperty("--color-border", theme === 'dark' ? '#none' : '#ccc');
  document.documentElement.style.setProperty("--color-button-text", theme === 'dark' ? '#000' : '#000');
  document.documentElement.style.setProperty("--icon-filter", theme === 'dark' ? 'brightness(0) invert(1)' : 'none');
  document.documentElement.style.setProperty("--color-header", theme === 'dark' ? '#2e2e2e' : 'white');
  document.documentElement.style.setProperty("--color-backgroundBoard", theme === 'dark' ? '#444444' : 'white');
  document.documentElement.style.setProperty("--color-input-bg", theme === 'dark' ? '#2c2c2c' : '#f3f3f3');
  document.documentElement.style.setProperty("--color-field-bg", theme === 'dark' ? '#2c2c2c' : '#f3f3f3');
  document.documentElement.style.setProperty("--color-cancel-bg", theme === 'dark' ? '#bdc3c7' : '#bdc3c7');
}



export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
