import React from 'react';
import { persistor } from '../store/store';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../store/themeSlice';
import { logout } from '../store/authSlice';
import "./Header.css";
import logo from '../assets/logo.png';
import { FaSun, FaMoon, FaSignOutAlt } from 'react-icons/fa';

const Header = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const mode = useSelector((state) => state.theme.mode);
  const { id } = useParams(); // Récupère l'ID dynamique du workspace

  // Fonction pour mettre la première lettre en majuscule
  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  // Détermine dynamiquement le nom de la page
  const getPageName = () => {
    const path = location.pathname;

    if (path.startsWith("/workspace") && id) {
      return capitalize(decodeURIComponent(id));
    }

    switch (path) {
      case "/portfolio":
        return "Portfolio";
      case "/expense-tracker":
        return "Suivi des Dépenses";
      case "/social-network":
        return "Réseau Social";
      case "/appointment-scheduler":
        return "Gestion des Rendez-vous";
      case "/dashboard":
        return "Dashboard";
      default:
        return "Application";
    }
  };

  // Fonction de déconnexion
  const handleLogout = () => {
    dispatch(logout());
    persistor.purge();
    navigate("/login");
  };

  return (
    <header className="header">
      <div className="header-left">
        <Link to="/dashboard">
          <img src={logo} alt="Logo" className="header-logo" />
        </Link>
        <span className="header-title">{getPageName()}</span>
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
