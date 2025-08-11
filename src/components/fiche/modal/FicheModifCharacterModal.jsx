import React, { useEffect, useState } from "react";
import { BaseModal } from "@components";
import { ApiFiche, isValidImageUrl } from "@service";
import "./FicheCreateCharacterModal.css";

/**
 * Props:
 * - fiche: { id, name, image, color, visibility, ... }
 * - onClose: () => void
 * - onUpdate: (updated) => void  // parent appliquera handleEditFiche(prev, updated)
 */
const FicheModifCharacterModal = ({ fiche, onClose, onUpdate }) => {
  const [prenom, setPrenom] = useState("");
  const [image, setImage] = useState("");
  const [visibility, setVisibility] = useState("2");
  const [couleur, setCouleur] = useState("#FF8C00");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageError, setImageError] = useState("");
  const [prenomError, setPrenomError] = useState("");

  useEffect(() => {
    if (fiche) {
      setPrenom(fiche.name || "");
      setImage(fiche.image || "");
      setCouleur(fiche.color || "#FF8C00");
      setVisibility(fiche.visibility != null ? String(fiche.visibility) : "2");
    }
  }, [fiche]);

  const handleSubmit = async () => {
    setError("");
    setImageError("");
    setPrenomError("");

    // 🔎 Validations UI minimales
    let hasError = false;
    if (!prenom.trim()) {
      setPrenomError("Le prénom (nom) est obligatoire.");
      hasError = true;
    }
    if (image && !isValidImageUrl(image)) {
      setImageError("URL d'image invalide (jpg, jpeg, png, gif, webp, bmp, svg).");
      hasError = true;
    }
    if (hasError) return;

    const diff = buildDiff();
    if (Object.keys(diff).length === 0) {
      onClose?.();
      return;
    }

    setLoading(true);
    try {
      const res = await ApiFiche.editFiche(fiche.id, diff);
      const updated = res?.data ?? diff; // Passe l'objet au parent (qui appliquera handleEditFiche)
      onUpdate?.(updated);
      onClose?.();
    } catch (e) {
      console.error("Erreur lors de la modification de la fiche :", e);
      setError("La modification a échoué. Vérifie les champs et réessaie.");
    } finally {
      setLoading(false);
    }
  };

  // Construire uniquement les champs modifiés + id (id obligatoire pour les handlers du parent)
  const buildDiff = () => {
    const base = {
      name: prenom.trim(),
      image: image?.trim() || "",
      color: (couleur || "").trim(),
      visibility: visibility === "" || visibility === null || visibility === undefined ? undefined : Number(visibility),
    };

    const diff = {};
    if (base.name !== (fiche.name || "")) diff.name = base.name;
    if (base.image !== (fiche.image || "")) diff.image = base.image;
    if (base.color !== (fiche.color || "")) diff.color = base.color;

    const visOld = fiche.visibility === "" || fiche.visibility === null || fiche.visibility === undefined ? undefined : Number(fiche.visibility);
    if (base.visibility !== undefined && base.visibility !== visOld) {
      diff.visibility = base.visibility;
    }

    return diff;
  };

  return (
    <BaseModal onClose={onClose} className="tmedit">
      <h2>Modifier la fiche</h2>

      <form className="tm-modal-form" onSubmit={(e) => e.preventDefault()}>
        <label className="tm-label label-fiche">
          Prénom Nom 
          <input
            type="text"
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
          />
          {prenomError && <span className="tm-error">{prenomError}</span>}
        </label>

        <label className="tm-label label-fiche">
          Image (URL) :
          <input
            type="url"
            value={image}
            onChange={(e) => setImage(e.target.value)}
          />
          {imageError && <span className="tm-error">{imageError}</span>}
        </label>

        <div className="labelSect">
          <label className="tm-label label-ficheSect">
            <div className="label-visi">Visibilité :</div>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              className="fiche-select"
            >
              <option value="0">Privé</option>
              <option value="1">Ami/Serveur</option>
              <option value="2">Public</option>
            </select>
          </label>

          <label className="label-ficheSect">
            Couleur :
            <input
              type="color"
              value={couleur}
              onChange={(e) => setCouleur(e.target.value)}
            />
          </label>
        </div>
      </form>

      {error && <span className="tm-error">{error}</span>}

      <div className="tm-modal-buttons">
        <button className="tm-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? "Enregistrement..." : "Enregistrer"}
        </button>
        <button onClick={onClose} disabled={loading}>
          Annuler
        </button>
      </div>
    </BaseModal>
  );
};

export default FicheModifCharacterModal;
