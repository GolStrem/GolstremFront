import React, { useState } from "react";
import { BaseModal } from "@components";
import { ApiFiche, isValidImageUrl } from "@service";
import { useTranslation } from "react-i18next";
import "./FicheCreateCharacterModal.css";

const FicheCreateCharacterModal = ({ onClose, onCreate }) => {
  const { t } = useTranslation("modal");
  const { t: tCommon } = useTranslation("common");
  const [prenom, setPrenom] = useState("");
  const [image, setImage] = useState("");
  const [visibility, setVisibility] = useState("2"); // "2" Public (cf. options ci-dessous)
  const [couleur, setCouleur] = useState("#FF8C00");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageError, setImageError] = useState("");
  const [prenomError, setPrenomError] = useState("");

  const handleSubmit = async () => {
    setError("");
    setImageError("");
    setPrenomError("");

    // 🔎 Validations UI minimales (le reste peut vivre côté parent/handlers si besoin)
    let hasError = false;
    if (!prenom.trim()) {
      setPrenomError(t("modal.firstNameRequired"));
      hasError = true;
    }
    if (image && !isValidImageUrl(image)) {
      setImageError(t("modal.invalidImageUrl"));
      hasError = true;
    }
    if (hasError) return;

    const payload = {
      name: prenom.trim(),
      image: image?.trim() || "",
      color: couleur,
      visibility: Number(visibility), // ✅ en number
      idOwner: localStorage.getItem("id") || undefined,
    };

    setLoading(true);
    try {
      const res = await ApiFiche.createFiche(payload);
      const created = res?.data ?? payload; // fallback si l'API ne renvoie pas de corps
      onCreate?.(created);          // ⬅️ MenuFiche fera handleCreateFiche(prev, created)
      onClose?.();
    } catch (e) {
      console.error("Création fiche échouée:", e);
      setError(t("modal.creationFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal onClose={onClose} className="tmedit">
      <h2 className="modal-title">{t("modal.createCharacter")}</h2>

      <form className="tm-modal-form" onSubmit={(e) => e.preventDefault()}>
        <label className="tm-label shortMenu">
          {tCommon("firstName")}
          <input
            type="text"
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
            className="text-input"
          />
          {prenomError && <span className="fiche-error">{prenomError}</span>}
        </label>

        <label className="tm-label shortMenu">
          {tCommon("imageUrl")}
          <input
            type="url"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className="text-inpu "
          />
          {imageError && <span className="fiche-error">{imageError}</span>}
        </label>

          <div className="shoModal">
          <label className="ptit ShortMenu">
            {tCommon("visibility")}
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              className="fiche-select"
            >
              {/* Garde la même convention que tes autres écrans : 0 Privé, 1 Amis, 2 Public */}
              <option value="0">{tCommon("private")}</option>
              <option value="1">{tCommon("friends")}</option>
              <option value="2">{tCommon("public")}</option>
            </select>
          </label>

          <label >
            {tCommon("color")}
            <input
              type="color"
              value={couleur}
              onChange={(e) => setCouleur(e.target.value)}
              className="colorInpu"
            />
          </label>
          </div>
        
      </form>

      {error && <span className="fiche-error">{error}</span>}

      <div className="tm-modal-buttons">
        <button className="tm-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? t("modal.creating") : tCommon("create")}
        </button>
        <button onClick={onClose} disabled={loading}>
          {tCommon("cancel")}
        </button>
      </div>
    </BaseModal>
  );
};

export default FicheCreateCharacterModal;
