import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import "./BackLocation.css";

const BackLocation = ({ className = "", title = "Retour" }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Utilisation optimisée des icônes


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
              <FaArrowLeft />
    </button>
  );
};

export default BackLocation;
