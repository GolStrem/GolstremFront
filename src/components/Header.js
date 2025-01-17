import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../store/themeSlice'; // Import de l'action Redux
import "./Header.css";
import logo from '../assets/logo.png';
import { FaSun, FaMoon, FaSignOutAlt } from 'react-icons/fa';

const Header = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const mode = useSelector((state) => state.theme.mode); // Récupère le mode depuis Redux

  // Détermine le nom de la page
  const getPageName = (pathname) => {
    switch (pathname) {
      case "/task-manager":
        return "Gestion des tâches";
      case "/portfolio":
        return "Portfolio";
      case "/expense-tracker":
        return "Suivi des Dépenses";
      case "/social-network":
        return "Réseau Social";
      case "/appointment-scheduler":
        return "Gestion des Rendez-vous";
      default:
        return "Dashboard";
    }
  };

  // Fonction de déconnexion
  const handleLogout = () => {
    // Ajoutez ici une logique de déconnexion si nécessaire (exemple : suppression du token)
    navigate("/"); // Redirige vers la page de connexion
  };

  return (
    <header className="header">
      <div className="header-left">
        <Link to="/dashboard">
          <img src={logo} alt="Logo" className="header-logo" />
        </Link>
        <span className="header-title">{getPageName(location.pathname)}</span>
      </div>
      <div className="header-right">
        {/* Bascule entre clair/sombre */}
        <div onClick={() => dispatch(toggleTheme())} className="icon">
          {mode === 'dark' ? <FaMoon size={24} /> : <FaSun size={24} />}
        </div>
        {/* Bouton de déconnexion */}
        <div onClick={handleLogout} className="icon">
          <FaSignOutAlt size={24} title="Se déconnecter" />
        </div>
      </div>
    </header>
  );
};

export default Header;
