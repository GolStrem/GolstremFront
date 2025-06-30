import React, { useState } from "react";
import { useSelector } from "react-redux";
import "./TaskEditorModal.css";

const BoardModal = ({ closeModal, handleCreateBoard }) => {
  const [title, setTitle] = useState("");
  const mode = useSelector((state) => state.theme.mode);

  const handleSubmit = () => {
    if (title.trim()) {
      handleCreateBoard(title.trim());
      closeModal();
    }
  };

  return (
    <div className={`tm-modal-overlay ${mode}`} onClick={closeModal}>
      <div
        className={`tm-modal-popup ${mode}`}
        onClick={(e) => e.stopPropagation()}
      >
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

        <div className="tm-modal-buttons">
          <button onClick={handleSubmit}>Créer</button>
          <button onClick={closeModal}>Annuler</button>
        </div>
      </div>
    </div>
  );
};

export default BoardModal;
