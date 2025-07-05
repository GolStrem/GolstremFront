import React from "react";
import { useSelector } from "react-redux";


const DeleteBoardModal = ({ title, onConfirm, onCancel }) => {
  const mode = useSelector((state) => state.theme.mode);

  return (
    <div className={`tm-modal-overlay ${mode}`} onClick={onCancel}>
      <div
        className={`tm-modal-popup ${mode}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="tm-modal-close" onClick={onCancel}>
          ✖
        </button>

        <h3>Supprimer le tableau</h3>
        <p>
          Êtes-vous sûr de vouloir supprimer le tableau <strong>« {title} »</strong> ?
        </p>
        <p className="tm-warning-text">
          ⚠️ Les cartes encore présentes sur ce tableau seront aussi supprimées.
        </p>

        <div className="tm-modal-buttons">
          <button className="tm-danger" onClick={onConfirm}>Supprimer</button>
          <button onClick={onCancel}>Annuler</button>
        </div>
      </div>
    </div>
  );
};

export default DeleteBoardModal;
