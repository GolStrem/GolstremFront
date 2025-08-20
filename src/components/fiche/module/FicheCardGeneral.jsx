import React from "react";
import { FicheNav } from "@components"; 
import "../../../pages/fiche/CreateFiche.css";

const FicheCardGeneral = ({ activeTab, indexModule, setActiveTab, data, onEdit }) => {
  const extraData = (data.module === undefined) ? {} : data.module[indexModule]?.extra
  return (
    <div className="cf-content">

      {/* Nav synchronisée */}
      <FicheNav activeTab={activeTab} setActiveTab={setActiveTab} data={data} />

      <div className="cf-header">
        <h1 className="cf-h1">{data.name}</h1> 
        <p className="cf-meta"> 
          <span className="cf-rank">{extraData?.age}</span> 
          <span className="cf-dot">•</span> 
          <span className="cf-date">20/03/1999</span> 
        </p>
      </div>

      <section className="cf-text"> 
        <h2 className="cf-h2">À propos</h2> 
        <p className="cf-about-display">{extraData?.about}</p> 
      </section> 
      
      {/* Bouton Modifier → appelle callback du parent */}
      <button className="cf-edit-btn" onClick={onEdit}>✏️ Modifier</button>

    </div>
  );
};

export default FicheCardGeneral;
