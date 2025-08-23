import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useIcon } from "../../utils/iconImports";
import "./BackLocation.css";

const BackLocation = ({ className = "", title = "Retour" }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Utilisation optimisée des icônes
  const { Icon: ArrowLeftIcon } = useIcon('ArrowLeft');

  // Sauvegarder la page d'origine si elle est fournie
  if (location.state?.from !== undefined) {
    localStorage.setItem('lastPage', location.state?.from);
  }

  const handleGoBack = () => {
    navigate(localStorage.getItem('lastPage') ?? '/fiches');
  };

  return (
    <button 
      className={`back-location-button ${className}`}
      onClick={handleGoBack}
      title={title}
    >
      {ArrowLeftIcon && <ArrowLeftIcon />}
    </button>
  );
};

export default BackLocation;
