import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux"; // Utilisation de Redux
import "./Dashboard.css";
import { FaTasks, FaBriefcase, FaMoneyBillWave, FaUsers, FaCalendarAlt } from "react-icons/fa";
import backgroundImage from "../assets/abstrait.webp";

const Dashboard = () => {
  const mode = useSelector((state) => state.theme.mode); // Récupère le mode depuis Redux

  const links = [
    { to: "/task-manager", label: "Gestion des tâches", icon: <FaTasks size={40} /> },
    { to: "/portfolio", label: "Portfolio", icon: <FaBriefcase size={40} /> },
    { to: "/expense-tracker", label: "Suivi des Dépenses", icon: <FaMoneyBillWave size={40} /> },
    { to: "/social-network", label: "Réseau Social", icon: <FaUsers size={40} /> },
    { to: "/appointment-scheduler", label: "Rendez-vous", icon: <FaCalendarAlt size={40} /> },
  ];

  const [mouseX, setMouseX] = useState(0);

  const handleMouseMove = (event) => {
    const { clientX } = event;
    setMouseX(clientX);
  };

  return (
    <div
      className={`dashboard ${mode === "dark" ? "dark" : "light"}`}
      onMouseMove={handleMouseMove}
    >
      <h1>Bienvenue sur votre Dashboard</h1>
      <p className="projects">Liste des projets en cours</p>
      <div className="cards-container">
        {links.map((link, index) => (
          <Link
            to={link.to}
            className={`card item ${index % 2 === 0 ? "primary" : "secondary"}`}
            key={index}
          >
            <div
              className="card-background"
              style={{
                backgroundImage: `url($)`,
              }}
            ></div>
            <div className="card-icon">{link.icon}</div>
            <div className="card-overlay"></div>
            <div className="main-text">
              <p className="pboard">{link.label}</p>
            </div>
            <div className="card-btn">
              <p>Ouvrir</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Effet de vague */}
      <div className="wave-container">
        <svg
          className="waves"
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          viewBox="0 24 150 28"
          preserveAspectRatio="none"
          shapeRendering="auto"
        >
          <defs>
            <path
              id="gentle-wave"
              d="M-160 44c30 0 58-18 88-18s58 18 88 18 58-18 88-18 58 18 88 18v44h-352z"
            />
          </defs>
          <g className="parallax">
            <use
              xlinkHref="#gentle-wave"
              x="48"
              y="0"
              fill="rgba(51, 31, 31, 0.5)"
              style={{ transform: `translateX(${mouseX / 20 - 50}px)` }}
            />
            <use
              xlinkHref="#gentle-wave"
              x="48"
              y="3"
              fill="rgba(51, 31, 31, 0.2)"
              style={{ transform: `translateX(${mouseX / 15 - 75}px)` }}
            />
            <use
              xlinkHref="#gentle-wave"
              x="48"
              y="5"
              fill="rgba(51, 31, 31, 0.32)"
              style={{ transform: `translateX(${mouseX / 10 - 100}px)` }}
            />
            <use
              xlinkHref="#gentle-wave"
              x="20"
              y="7"
              fill="rgba(51, 31, 31, 0)"
              style={{ transform: `translateX(${mouseX / 5 - 125}px)` }}
            />
          </g>
        </svg>
      </div>
    </div>
  );
};

export default Dashboard;
