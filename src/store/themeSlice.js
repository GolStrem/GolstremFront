import { createSlice } from '@reduxjs/toolkit';

const initialTheme = localStorage.getItem('theme') || 'dark'; // Récupère le mode enregistré ou par défaut 'dark'
document.documentElement.style.setProperty("--jaune", localStorage.getItem('color'));
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
  document.documentElement.style.setProperty("--color-text", theme === 'dark' ? '#ddd' : '#000');
  document.documentElement.style.setProperty("--color-button", theme === 'dark' ? '#fff' : '#000');
  document.documentElement.style.setProperty("--color-background", theme === 'dark' ? '#181818' : '#fff');

  document.documentElement.style.setProperty("--color-modal", theme === 'dark' ? '#1f1f1f' : '#fff');
  document.documentElement.style.setProperty("--color-modal-text", theme === 'dark' ? '#f0f0f0' : '#111');
  document.documentElement.style.setProperty("--color-submit-text", theme === 'dark' ? '#f0f0f0' : '#000');

  document.documentElement.style.setProperty("--color-text-muted", theme === 'dark' ? '#bbb' : '#aaa');
  document.documentElement.style.setProperty("--color-border", theme === 'dark' ? '#e9ecef00' : '#ccc');
  document.documentElement.style.setProperty("--color-border-muted", theme === 'dark' ? '#666' : '#ddd');

  document.documentElement.style.setProperty("--color-button-text", theme === 'dark' ? '#000' : '#000');
  document.documentElement.style.setProperty("--icon-filter", theme === 'dark' ? 'brightness(0) invert(1)' : 'none');

  document.documentElement.style.setProperty("--color-header-bg", theme === 'dark' ? '#2e2e2e' : '#fff');
  document.documentElement.style.setProperty("--color-header-text", theme === 'dark' ? '#fff' : '#000');

  document.documentElement.style.setProperty("--color-backgroundBoard", theme === 'dark' ? '#444444' : '#fff');
  document.documentElement.style.setProperty("--color-header", theme === 'dark' ? '#2e2e2e' : '#fff');
  document.documentElement.style.setProperty("--color-hover", theme === 'dark' ? '#575757' : '#e9ecef');

  document.documentElement.style.setProperty("--color-input-bg", theme === 'dark' ? '#2c2c2c' : '#f3f3f3');
  document.documentElement.style.setProperty("--color-field-bg", theme === 'dark' ? '#2c2c2c' : '#f3f3f3');

  document.documentElement.style.setProperty("--btn-hover-bg", theme === 'dark' ? '#3a3a3a' : '#f0f0f0');

  document.documentElement.style.setProperty("--color-story", theme === 'dark' ? '#131313ff' : '#d8d8d8ff');
  document.documentElement.style.setProperty("--color-story-select", theme === 'dark' ? '#4b4b4bff' : '#f0f0f0');

  document.documentElement.style.setProperty("--color-home-gradient", theme === 'dark' ? 'linear-gradient(135deg, #121212, #222)' : 'linear-gradient(135deg, #f5f5f5, #e0e0e0)');

  document.documentElement.style.setProperty("--color-cancel-bg", '#bdc3c7');
  document.documentElement.style.setProperty("--color-cancel-text", '#000');

}



export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
