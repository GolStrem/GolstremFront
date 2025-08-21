// FicheSelectModule.jsx
import React, { useState } from "react";
import "./FicheSelectModule.css";
import { BaseModal } from "@components";


const modulesList = ["General", "Caractere", "Histoire", "Pouvoir", "Galerie"];

const FicheSelectModule = ({ isOpen, onClose, onSave }) => {
  const [selectedModules, setSelectedModules] = useState([]);

  const handleToggle = (module) => {
    setSelectedModules((prev) =>
      prev.includes(module)
        ? prev.filter((m) => m !== module)
        : [...prev, module]
    );
  };

  const handleSave = () => {
    onSave(selectedModules);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <BaseModal onClose={onClose} className="tmedit cf-modal-large">
      
        <h2>Choisissez vos modules à afficher</h2>
        <div className="fsm-checkboxes">
        {modulesList.map((module) => (
            <label key={module} className="fsm-checkbox-label">
            <input
                type="checkbox"
                checked={selectedModules.includes(module)}
                onChange={() => handleToggle(module)}
            />
            
            <span className="fsm-checkbox-text">{module}</span>
            </label>
        ))}
        </div>

        <div className="tm-modal-buttons">
            <button className="tm-primary" onClick={handleSave}>
                Enregistrer
            </button>
            <button  onClick={onClose}>
                Annuler
            </button>
        </div>
      
    </BaseModal>
  );
};

export default FicheSelectModule;
