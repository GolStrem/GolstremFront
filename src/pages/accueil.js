import React from "react";
import { useNavigate } from "react-router-dom";
import {  useSelector, useDispatch } from 'react-redux';
import { ReactComponent as Golden } from "@assets/golden.svg";
import "./Accueil.css";
import { toggleTheme } from '@store/index';
import { FaSun, FaMoon } from 'react-icons/fa';


const Accueil = () => {
  const dispatch = useDispatch();
  const mode = useSelector((state) => state.theme.mode); // Récupère le mode (dark/light)
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/login");
  };

  return (
    <div className="home-page">
        <div className={`mode-toggle ${mode}`} onClick={() => dispatch(toggleTheme())}> {mode === 'dark' ? <FaMoon size={24} /> : <FaSun size={24} />}</div>
      
      <div className="home-content">
        <Golden className="home-logo" />
        <h1 className="home-title">Bienvenue sur notre plateforme</h1>
        <p className="home-subtitle">
          Gérez votre compte et vos préférences facilement.
        </p>
        <button className="home-button" onClick={handleLoginClick}>
          Se connecter
        </button>
      </div>
    </div>
  );
};

export default Accueil;
