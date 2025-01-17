import './NotFound.css';
import React from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../store/themeSlice';
import { FaSun, FaMoon } from 'react-icons/fa';

const NotFound = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const mode = useSelector((state) => state.theme.mode); // Récupère le mode (dark/light)
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated); // Vérifie si l'utilisateur est connecté

  const handleRedirect = () => {
    navigate(isAuthenticated ? '/dashboard' : '/'); // Redirige en fonction de l'état de connexion
  };

  return (
    <div className={`notFound ${mode === 'dark' ? 'dark' : 'light'}`}>
      <div
        className="mode-toggle"
        onClick={() => dispatch(toggleTheme())}
        aria-label={`Changer vers le mode ${mode === 'dark' ? 'clair' : 'sombre'}`}
        role="button"
        tabIndex={0}
        onKeyPress={(e) => {
          if (e.key === 'Enter') dispatch(toggleTheme());
        }}
      >
        {mode === 'dark' ? <FaMoon size={24} /> : <FaSun size={24} />}
      </div>

      <div className='number'>404</div>
      <h1 className='error'>Page introuvable</h1>

      {/* Bouton unique avec condition */}
      <button className="redirect-button" onClick={handleRedirect}>
        {isAuthenticated ? 'Retourner au Dashboard' : 'Retourner à l\'accueil'}
      </button>
    </div>
  );
};

export default NotFound;
