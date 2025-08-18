import React, { useState } from "react";
import {
  FicheCardGeneral, 
  FicheCardCharacter, 
  FicheCardStory, 
  FicheCardPower, 
  FicheCardGallery,
  FicheEditModal
} from "@components";
import "./CreateFiche.css";

const CreateFiche = () => {
  const imgUrl = "https://i.pinimg.com/736x/e0/21/49/e021490dbdba45a9787df70673e1c4f3.jpg";

  const [characterData, setCharacterData] = useState({
    name: "Henel Aemue",
    age: "23",
    about: "Cette fiche est un test, et on sait tous, que Henel, n'est pas un ange...",
    image: imgUrl
  });

  const [activeTab, setActiveTab] = useState("general");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const componentMap = {
    general: FicheCardGeneral,
    character: FicheCardCharacter,
    story: FicheCardStory,
    power: FicheCardPower,
    gallery: FicheCardGallery,
  };

  const ActiveComponent = componentMap[activeTab];

  // Callback pour ouvrir la modale depuis le module
  const handleOpenModal = () => setIsModalOpen(true);

  const handleSave = (updated) => {
    setCharacterData(updated);
    setIsModalOpen(false);
  };

  return (
    <div className="cf-container">
      <div className="cf-right" aria-hidden="true" />
      <div className="cf-left" aria-hidden="true">
        <img src={imgUrl} alt="Portrait décoratif" className="cf-img" />
      </div>

      <div className="cf-card">
        {/* Passer la data + callback pour la modale */}
        <ActiveComponent
          data={characterData}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onEdit={activeTab === "general" ? handleOpenModal : undefined}
        />

        <aside className="cf-portrait-float">
          <img src={characterData.image} alt="Portrait du personnage" />
        </aside>
      </div>

      {/* Modal centralisée, visible uniquement pour "general" */}
      {activeTab === "general" && isModalOpen && (
        <FicheEditModal
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          initialData={characterData}
        />
      )}

      <div className="cf-global-badges">
        <span className="cf-badge">DISCORD</span>
        <span className="cf-badge">SERVEUR ZHENEOS</span>
      </div>
    </div>
  );
};

export default CreateFiche;
