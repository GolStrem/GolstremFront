import React from "react";
import { useNavigate } from "react-router-dom";
import "./Univers.css";
import { ffimg } from "@assets";


const CATEGORIES = [
  { key: "fiches",            label: "Fiches",               to: "/univers/fiches" },
  { key: "encyclopedie",      label: "Encyclopédie",         to: "/univers/encyclopedie" },
  { key: "etablissement",     label: "Établissement",        to: "/univers/etablissements" },
  { key: "ouverture",         label: "Ouverture / Inscription",to: "/univers/ouvertures" },
  { key: "tableau-affichage", label: "Tableau d’affichage",  to: "/univers/tableau" },
  { key: "Gallerie", label: "Gallerie",  to: "/univers/gallerie" }
];

const Univers = () => {
  const navigate = useNavigate();

  return (
    <div className="UniId-page">
      {/* Colonne décorative à gauche */}
      <div className="UniId-left-dots" aria-hidden="true">
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={i} className="UniId-dot" />
        ))}
      </div>

      <h1 className="UniId-title">Final Fantasy XIV</h1>
      <h2 className="UniId-title unititle">Francais</h2>
      <p className="UniId-text">ici sera reférencé les établissements et les fiches des personnes/établissement qui auront passer la validation</p>

      <div className="UniId-grid">
        {CATEGORIES.map((item) => (
          <button
            key={item.key}
            className="UniId-card"
            style={{ "--thumb": `url(${ffimg})` }}
            onClick={() => navigate(item.to)}
            type="button"
          >
            <span className="UniId-label">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Univers;
