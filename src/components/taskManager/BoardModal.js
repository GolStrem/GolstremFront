// BoardModal.jsx
import React, { useState } from "react";
import "./Modal.css";  // Vous pouvez réutiliser le même style que votre modal de cartes

const BoardModal = ({ closeModal, handleCreateBoard }) => {
  const [title, setTitle] = useState("");

  const handleSubmit = () => {
    handleCreateBoard(title);
    closeModal(); 
  };

  return (
    <div className="tm-modal-overlay" onClick={closeModal}>
      <div
        className="tm-modal-popup"
        onClick={(e) => e.stopPropagation()} // Empêche la fermeture en cliquant dans la popup
      >
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
