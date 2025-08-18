import React from "react";
import { FicheNav } from "@components"; 



const FicheCardCharacter= ({activeTab, setActiveTab}) => {

  return (
      <div className="cf-content">
        <FicheNav activeTab={activeTab} setActiveTab={setActiveTab} />
          coucou
    
        </div>
  );
};

export default FicheCardCharacter;