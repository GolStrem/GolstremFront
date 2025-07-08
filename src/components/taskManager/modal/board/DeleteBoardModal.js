import React from "react";
import { useSelector } from "react-redux";
import { BaseModal } from "@components"

const DeleteBoardModal = ({ title, onConfirm, onCancel }) => {
  const mode = useSelector((state) => state.theme.mode);

  return (
   <BaseModal onClose={onCancel} className={`tmedit ${mode}`}>
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
      </BaseModal>
  );
};

export default DeleteBoardModal;
