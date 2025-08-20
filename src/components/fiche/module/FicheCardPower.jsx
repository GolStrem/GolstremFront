import React from "react";
import { FicheNav } from "@components"; 
import "../../../pages/fiche/CreateFiche.css";


const FicheCardPower= ({ activeTab, indexModule, setActiveTab, data, onEdit }) => {
  const extraData = (data.module === undefined) ? {} : data.module[indexModule]?.extra

  return (
      <div className="cf-content">
        <FicheNav activeTab={activeTab} setActiveTab={setActiveTab} data={data} />
        
          coucou
    
          <button className="cf-edit-btn" onClick={onEdit}>✏️ Modifier</button>
        </div>
  );
};

export default FicheCardPower;