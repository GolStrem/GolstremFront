import React from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import "./BackLocation.css";

const BackLocation = ({ className = "", title = "Retour" }) => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    const pilePage = JSON.parse(localStorage.getItem('pilePage') ?? '[]')
    const newPage = pilePage.pop()
    localStorage.setItem('pilePage', JSON.stringify(pilePage))
    navigate(newPage ?? '/dashboard');
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
