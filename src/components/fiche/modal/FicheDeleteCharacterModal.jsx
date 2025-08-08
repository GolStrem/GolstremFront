import React, { useState } from "react";
import { BaseModal } from "@components";
import { ApiFiche } from "@service";

/**
 * Props:
 * - ficheId: number|string
 * - onClose: () => void
 * - onDelete: (deletedId) => void // parent appliquera handleDeleteFiche(prev, deletedId)
 */
const FicheDeleteCharacterModal = ({ ficheId, onClose, onDelete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!ficheId && ficheId !== 0) {
      setError("ID de fiche manquant");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await ApiFiche.deleteFiche(ficheId);
      onDelete?.(ficheId); // Le parent fera handleDeleteFiche(prev, ficheId)
      onClose?.();
    } catch (err) {
      console.error("Erreur suppression fiche :", err);
      setError("Impossible de supprimer cette fiche");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal onClose={onClose} className="tmedit">
      <h2>Supprimer la fiche</h2>
      <p>Êtes-vous sûr de vouloir supprimer cette fiche ?</p>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div className="tm-modal-buttons">
        <button
          className="tm-primary"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Suppression..." : "Supprimer"}
        </button>
        <button onClick={onClose} disabled={loading}>
          Annuler
        </button>
      </div>
    </BaseModal>
  );
};

export default FicheDeleteCharacterModal;
