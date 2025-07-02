import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setTheme } from '../store/themeSlice';

const useSystemThemeSync = () => {
  const dispatch = useDispatch();
  const currentTheme = useSelector((state) => state.theme.mode);

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Seulement si aucun thème enregistré dans localStorage
    if (!localStorage.getItem('theme')) {
      dispatch(setTheme(prefersDark ? 'dark' : 'light'));
    }

    const meta = document.querySelector('meta[name="color-scheme"]');
    if (meta) {
      meta.setAttribute('content', prefersDark ? 'dark light' : 'light dark');
    }
  }, [dispatch]);
};

export default useSystemThemeSync;
