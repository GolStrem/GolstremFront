// Exporte store et persistor
export { default as store, persistor } from './store';

// Exporte les reducers par défaut
export { default as authSlice } from './authSlice';
export { default as themeSlice } from './themeSlice';

// Exporte les actions nommées (⚠️ tu dois les exporter dans les fichiers originaux aussi)
export { logout, setUserPseudo, setUserAvatar, } from './authSlice';
export { toggleTheme } from './themeSlice';
