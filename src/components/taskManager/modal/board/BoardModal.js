import React, { useState } from "react";
import { useSelector } from "react-redux";
import { BaseModal } from "@components"


const BoardModal = ({ closeModal, handleCreateBoard }) => {
  const [title, setTitle] = useState("");
  const [color, setColor] = useState("#000000");
  const mode = useSelector((state) => state.theme.mode);

  const handleSubmit = () => {
    if (title.trim()) {
      handleCreateBoard({ name: title.trim(), color });
      closeModal();
    }
  };

  return (
   <BaseModal onClose={closeModal} className={`tmedit ${mode}`}>
        {/* Croix de fermeture */}
        <button className="tm-close-button" onClick={closeModal} aria-label="Fermer">
          ×
        </button>

        <h3>Créer un tableau</h3>

        <label>
          Nom du tableau :
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>

        <label>
          Couleur du tableau :
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
        </label>

        <div className="tm-modal-buttons">
          <button onClick={handleSubmit}>Créer</button>
          <button onClick={closeModal}>Annuler</button>
        </div>
      </BaseModal>
  );
};

export default BoardModal;
