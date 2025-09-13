import React, { useState } from "react";
import { BaseModal } from "@components";
import { ApiFiche } from "@service";
import { useTranslation } from "react-i18next";

/**
 * Props:
 * - ficheId: number|string
 * - onClose: () => void
 * - onDelete: (deletedId) => void // parent appliquera handleDeleteFiche(prev, deletedId)
 */
const FicheDeleteCharacterModal = ({ ficheId, ficheUnivers, onClose, onDelete }) => {
  const { t } = useTranslation("modal");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!ficheId && ficheId !== 0) {
      setError(t("modal.missingFicheId"));
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Vérifier si la fiche est connectée à un univers
      if (ficheUnivers !== null) {
        setError(t("modal.cannotDeleteFicheConnectedToUnivers"));
        setLoading(false);
        return;
      }

      await ApiFiche.deleteFiche(ficheId);
      onDelete?.(ficheId); // Le parent fera handleDeleteFiche(prev, ficheId)
      onClose?.();
    } catch (err) {
      console.error("Erreur suppression fiche :", err);
      setError(t("modal.cannotDeleteFiche"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal onClose={onClose} className="tmedit">
      <h2>{t("modal.deleteFiche")}</h2>
      <p>{t("modal.confirmDeleteFiche")}</p>

      {error && <p style={{ color: "red", margin: "0", marginTop: "-10px" }}>{error}</p>}

      <div className="tm-modal-buttons">
        <button
          className="tm-primary"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? t("modal.deleting") : t("delete")}
        </button>
        <button onClick={onClose} disabled={loading}>
          {t("cancel")}
        </button>
      </div>
    </BaseModal>
  );
};

export default FicheDeleteCharacterModal;
