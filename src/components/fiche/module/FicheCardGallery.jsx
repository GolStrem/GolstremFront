import React from "react";
import { FicheNav } from "@components"; 
import "../../../pages/fiche/CreateFiche.css";

const FicheCardGallery = ({ activeTab, indexModule, setActiveTab, data, onEdit }) => {
  const extraData = (data.module === undefined) ? {} : data.module[indexModule]?.extra
  return (
    <div className="cf-content">
      {/* Nav synchronisée */}
      <FicheNav activeTab={activeTab} setActiveTab={setActiveTab} data={data} />
      
      <p>Contenu de la galerie</p>

      <button className="cf-edit-btn" onClick={onEdit}>✏️ Modifier</button>
    </div>
  );
};

export default FicheCardGallery;
