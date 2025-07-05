import React, { useState } from "react";
import { useSelector } from "react-redux";


const EditBoardTitleModal = ({ currentTitle, onConfirm, onCancel }) => {
  const [title, setTitle] = useState(currentTitle);
  const mode = useSelector((state) => state.theme.mode);

  const handleSubmit = () => {
    if (title.trim()) {
      onConfirm(title.trim());
    }
  };

  return (
    <div className={`tm-modal-overlay ${mode}`} onClick={onCancel}>
      <div
        className={`tm-modal-popup ${mode}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="tm-close-button" onClick={onCancel} aria-label="Fermer">
          ×
        </button>

        <h3>Renommer le tableau</h3>

        <label>
          Nouveau nom :
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>

        <div className="tm-modal-buttons">
          <button onClick={handleSubmit}>Valider</button>
          <button onClick={onCancel}>Annuler</button>
        </div>
      </div>
    </div>
  );
};

export default EditBoardTitleModal;
