import React from "react";
import { useTranslation } from "react-i18next";
import "../../pages/fiche/CreateFiche.css";

const FicheNav = ({ activeTab, setActiveTab, data }) => {
  const { t } = useTranslation(); 

  const tabs = [
    { name: "general", label: t("general") },
    { name: "character", label: t("character") },
    { name: "story", label: t("story") },
    { name: "power", label: t("power") },
    { name: "gallery", label: t("gallery") },
  ];

  const moduleNames = Array.isArray(data?.module)
    ? data.module.map((m) => m?.name).filter(Boolean)
    : [];

  const displayedNames = moduleNames.filter((name) =>
    tabs.some((t) => t.name === name)
  );

  return (
    <nav className="cf-tabs" aria-label={t("sectionsFiche", "Sections de la fiche")}>
      {displayedNames.map((name) => {
        const tab = tabs.find((t) => t.name === name);
        if (!tab) return null;
        return (
          <button
            key={name}
            className={`cf-tab cf-tab--${name} ${
              activeTab === name ? "cf-tab--active" : ""
            }`}
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
