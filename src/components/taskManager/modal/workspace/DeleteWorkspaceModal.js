import React from "react";
import { useSelector } from "react-redux";
import { BaseModal } from "@components";


const DeleteWorkspaceModal = ({ name, onConfirm, onCancel }) => {
  const mode = useSelector((state) => state.theme.mode);

  return (
    <BaseModal onClose={onCancel} className={`tmedit ${mode}`}>
        <button className="tm-modal-close" onClick={onCancel}>
          ✖
        </button>

        <h3>Supprimer le workspace</h3>
        <p>
          Êtes-vous sûr de vouloir supprimer <strong>« {name} »</strong> ?
        </p>

        <p className="tm-warning-text">
          ⚠️ En supprimant ce workspace, vous perdrez tous les tableaux et cartes associés.
        </p>

        <div className="tm-modal-buttons">
          <button className="tm-danger" onClick={onConfirm}>
            Supprimer
          </button>
          <button onClick={onCancel}>Annuler</button>
        </div>
    </BaseModal>
  );
};

export default DeleteWorkspaceModal;