import React from "react";
import { FicheNav } from "@components"; 
import "../../../pages/fiche/CreateFiche.css";

const FicheCardGallery = ({ activeTab, setActiveTab }) => {
  return (
    <div className="cf-content">
      {/* Nav synchronisée */}
      <FicheNav activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <p>Contenu de la galerie</p>
    </div>
  );
};

export default FicheCardGallery;
