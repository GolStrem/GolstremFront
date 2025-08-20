import React from "react";
import "../../pages/fiche/CreateFiche.css";

const FicheNav = ({ activeTab, setActiveTab, data }) => {
  const tabs = [
    { name: "general", label: "Général" },
    { name: "character", label: "Caractère" },
    { name: "story", label: "Histoire" },
    { name: "power", label: "Pouvoir" },
    { name: "gallery", label: "Galerie" },
  ];

  const moduleNames = Array.isArray(data?.module)
    ? data.module.map((m) => m?.name).filter(Boolean)
    : [];

  const displayedNames = moduleNames.filter((name) => tabs.some((t) => t.name === name));

  return (
    <nav className="cf-tabs" aria-label="Sections de la fiche">
      {displayedNames.map((name) => {
        const tab = tabs.find((t) => t.name === name);
        if (!tab) return null;
        return (
          <button
            key={name}
            className={`cf-tab cf-tab--${name} ${activeTab === name ? "cf-tab--active" : ""}`}
            onClick={() => setActiveTab(name)}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
};

export default FicheNav;
