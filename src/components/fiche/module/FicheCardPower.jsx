import React from "react";
import { FicheNav } from "@components"; 
import "../../../pages/fiche/CreateFiche.css";


const FicheCardPower= ({activeTab, setActiveTab}) => {

  return (
      <div className="cf-content">
        <FicheNav activeTab={activeTab} setActiveTab={setActiveTab} />
        
          coucou
    
        </div>
  );
};

export default FicheCardPower;