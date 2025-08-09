import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  FaSun,
  FaMoon,
  FaSignOutAlt,
  FaChevronDown,
  FaTools,
  FaHome
} from "react-icons/fa";
import { persistor, toggleTheme, logout } from "@store";
import avatarImg from "@assets/avatar.png";
import { useTranslation } from "react-i18next";

import "./Header.css";

const Header = () => {
  const { t } = useTranslation("general");

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
    navigate("/login");
  };

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <header className="header">
      <div className="header-right" ref={menuRef}>
        <div className="user-menu" onClick={toggleMenu}>
          <img src={avatar || avatarImg} alt={t("general.avatarAlt")} className="avatar" />
          <span className="username">
            {pseudo
              ? pseudo.charAt(0).toUpperCase() + pseudo.slice(1)
              : t("general.profile")}
          </span>
          <FaChevronDown />
        </div>

        {menuOpen && (
          <div className="dropdown-menu">
            <button
              className="dropdown-item"
              onClick={() => navigate("/dashboard")}
            >
              <FaHome /> {t("general.dashboard")}
            </button>

            <button
              className="dropdown-item red"
              onClick={() => navigate("/config")}
            >
              <FaTools /> {t("general.settings")}
            </button>

            <button
              className="dropdown-item"
              onClick={() => dispatch(toggleTheme())}
            >
              {mode === "dark" ? <FaSun /> : <FaMoon />}{" "}
              {mode === "dark" ? t("general.lightMode") : t("general.darkMode")}
            </button>

            <button className="dropdown-item" onClick={handleLogout}>
              <FaSignOutAlt /> {t("general.logout")}
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
