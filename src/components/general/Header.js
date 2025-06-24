import React from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaSun, FaMoon, FaSignOutAlt } from 'react-icons/fa';

import { persistor, toggleTheme, logout } from '@store';   
import { logo } from '@assets';

import './Header.css';

const Header = () => {
  const dispatch  = useDispatch();
  const location  = useLocation();
  const navigate  = useNavigate();
  const { id }    = useParams();
  const mode      = useSelector((state) => state.theme.mode);

  /* Helpers -------------------------------------------------------------- */
  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  const getPageName = () => {
    const path = location.pathname;

    if (path.startsWith('/workspace') && id) {
      return capitalize(decodeURIComponent(id));
    }

    switch (path) {
      case '/portfolio':            return 'Portfolio';
      case '/expense-tracker':      return 'Suivi des Dépenses';
      case '/social-network':       return 'Réseau Social';
      case '/appointment-scheduler':return 'Gestion des Rendez-vous';
      case '/dashboard':            return 'Dashboard';
      default:                      return 'Application';
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    persistor.purge();
    navigate('/login');
  };

  /* Render --------------------------------------------------------------- */
  return (
    <header className="header">
      <div className="header-left">
        <Link to="/dashboard">
          <img src={logo} alt="Logo" className="header-logo" />
        </Link>
        <span className="header-title">{getPageName()}</span>
      </div>

      <div className="header-right">
        <div onClick={() => dispatch(toggleTheme())} className="icon">
          {mode === 'dark' ? <FaMoon size={24} /> : <FaSun size={24} />}
        </div>

        <div onClick={handleLogout} className="icon">
          <FaSignOutAlt size={24} title="Se déconnecter" />
        </div>
      </div>
    </header>
  );
};

export default Header;
