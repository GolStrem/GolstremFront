import React from "react";
import "../../pages/fiche/CreateFiche.css";

const FicheNav = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { name: "general", label: "Général" },
    { name: "character", label: "Caractère" },
    { name: "story", label: "Histoire" },
    { name: "power", label: "Pouvoir" },
    { name: "gallery", label: "Galerie" },
  ];

  return (
    <nav className="cf-tabs" aria-label="Sections de la fiche">
      {tabs.map((tab) => (
        <button
          key={tab.name}
          className={`cf-tab ${activeTab === tab.name ? "cf-tab--active" : ""}`}
          onClick={() => setActiveTab(tab.name)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
};

export default FicheNav;
