import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  FaSun,
  FaMoon,
  FaSignOutAlt,
  FaChevronDown,
  FaTools,
  FaHome
} from 'react-icons/fa';

import { persistor, toggleTheme, logout } from '@store';
import avatarImg from '@assets/avatar.png';

import './Header.css';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const mode = useSelector((state) => state.theme.mode);
  const pseudo = useSelector((state) => state.auth.pseudo);
  const avatar = useSelector((state) => state.auth.avatar);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

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
          <img src={avatar || avatarImg} alt="avatar" className="avatar" />
          <span className="username">
            {pseudo ? pseudo.charAt(0).toUpperCase() + pseudo.slice(1) : 'Profil'}
          </span>
          <FaChevronDown />
        </div>

        {menuOpen && (
          <div className="dropdown-menu">
            <button className="dropdown-item" onClick={() => navigate('/dashboard')}>
              <FaHome /> Dashboard
            </button>

            <button className="dropdown-item red" onClick={() => navigate('/config')}>
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
