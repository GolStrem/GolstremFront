import React from "react";
import { useNavigate } from "react-router-dom";
import { ReactComponent as Golden } from "@assets/golden.svg";
import "./Accueil.css";

const Accueil = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/login");
  };

  return (
    <div className="home-page">
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
