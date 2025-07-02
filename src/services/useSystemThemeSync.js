// hooks/useSystemThemeSync.js
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setTheme } from '../store/themeSlice'; // adapte à ton path réel

const useSystemThemeSync = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    dispatch(setTheme(prefersDark ? 'dark' : 'light'));

    // Empêche les navigateurs (Samsung Internet, etc.) d'inverser automatiquement les couleurs
    const meta = document.querySelector('meta[name="color-scheme"]');
    if (meta) {
      meta.setAttribute('content', prefersDark ? 'dark light' : 'light dark');
    }
  }, [dispatch]);
};

export default useSystemThemeSync;
