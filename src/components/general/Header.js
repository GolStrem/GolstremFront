import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  FaSun,
  FaMoon,
  FaSignOutAlt,
  FaChevronDown,
  FaTools
} from 'react-icons/fa';

import { persistor, toggleTheme, logout } from '@store';
import { logo } from '@assets';
import avatarImg from '@assets/avatar.png'; // Ton image avatar

import './Header.css';

const Header = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  const mode = useSelector((state) => state.theme.mode);
  const userCode = useSelector((state) => state.auth.userCode);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const getPageName = () => {
    const path = location.pathname;
    if (path.startsWith('/workspace') && id) {
      return id.charAt(0).toUpperCase() + id.slice(1);
    }
    switch (path) {
      case '/portfolio': return 'Portfolio';
      case '/expense-tracker': return 'Suivi des Dépenses';
      case '/social-network': return 'Réseau Social';
      case '/appointment-scheduler': return 'Gestion des Rendez-vous';
      case '/dashboard': return 'Dashboard';
      default: return 'Application';
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    persistor.purge();
    navigate('/login');
  };

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  return (
    <header className="header">
      <div className="header-right" ref={menuRef}>
        <div className="user-menu" onClick={toggleMenu}>
          <img src={avatarImg} alt="avatar" className="avatar" />
          <span className="username">
            {userCode ? userCode.charAt(0).toUpperCase() + userCode.slice(1) : 'Profil'}
          </span>
          <FaChevronDown />
        </div>

        {menuOpen && (
          <div className="dropdown-menu">
            <button className="dropdown-item red" onClick={() => navigate('/settings')}>
              <FaTools /> Paramètres
            </button>

            <button className="dropdown-item" onClick={() => dispatch(toggleTheme())}>
              {mode === 'dark' ? <FaSun /> : <FaMoon />} {mode === 'dark' ? 'Mode clair' : 'Mode sombre'}
            </button>

            <button className="dropdown-item" onClick={handleLogout}>
              <FaSignOutAlt /> Déconnexion
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
