import React, { useState } from "react";
import { useSelector } from "react-redux";
import { BaseModal } from '@components'


const EditBoardTitleModal = ({ currentTitle, onConfirm, onCancel }) => {
  const [title, setTitle] = useState(currentTitle);
  const mode = useSelector((state) => state.theme.mode);

  const handleSubmit = () => {
    if (title.trim()) {
      onConfirm(title.trim());
    }
  };

  return (
    <BaseModal onClose={onCancel} className={`tmedit ${mode}`}>
        <button className="tm-close-button" onClick={onCancel} aria-label="Fermer">
          ✖
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
    </BaseModal>
  );
};

export default EditBoardTitleModal;
