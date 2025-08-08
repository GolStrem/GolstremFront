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

  useEffect(() => {
    if (fiche) {
      setPrenom(fiche.name || "");
      setImage(fiche.image || "");
      setCouleur(fiche.color || "#FF8C00");
      setVisibility(fiche.visibility != null ? String(fiche.visibility) : "2");
    }
  }, [fiche]);

  const validate = () => {
    setError("");
    setImageError("");

    if (!prenom.trim()) {
      setError("Le prénom (nom) est obligatoire.");
      return false;
    }
    if (image && !isValidImageUrl(image)) {
      setImageError("URL d'image invalide (jpg, jpeg, png, gif, webp, bmp, svg).");
      return false;
    }
    return true;
  };

  // Construit uniquement les champs modifiés + id (id obligatoire pour les handlers du parent)
  const buildDiff = () => {
    const base = {
      name: prenom.trim(),
      image: image?.trim() || "",
      color: (couleur || "").trim(),
      visibility:
        visibility === "" || visibility === null || visibility === undefined
          ? undefined
          : Number(visibility),
    };

    const diff = {  };
    if (base.name !== (fiche.name || "")) diff.name = base.name;
    if (base.image !== (fiche.image || "")) diff.image = base.image;
    if (base.color !== (fiche.color || "")) diff.color = base.color;

    const visOld =
      fiche.visibility === "" || fiche.visibility === null || fiche.visibility === undefined
        ? undefined
        : Number(fiche.visibility);
    if (base.visibility !== undefined && base.visibility !== visOld) {
      diff.visibility = base.visibility;
    }

    // si rien de changé, renvoyer id uniquement (le parent ne modifiera rien)
    return diff;
  };

  const handleSubmit = async () => {
    if (!fiche?.id) {
      setError("Impossible de modifier : ID de fiche manquant.");
      return;
    }
    if (!validate()) return;

    const diff = buildDiff();
    // Si aucun champ autre que id → inutile d’appeler l’API
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

  return (
    <BaseModal onClose={onClose} className="tmedit">
      <h2>Modifier la fiche</h2>

      <div className="tm-field">
        <label>Prénom / Nom *</label>
        <input
          type="text"
          value={prenom}
          onChange={(e) => setPrenom(e.target.value)}
          placeholder="Nom du personnage"
        />
      </div>

      <div className="tm-field">
        <label>Image (URL)</label>
        <input
          type="url"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          placeholder="https://exemple.com/image.png"
        />
        {imageError && <div className="tm-error">{imageError}</div>}
      </div>

      <div className="tm-field">
        <label>Couleur</label>
        <input
          type="color"
          value={couleur}
          onChange={(e) => setCouleur(e.target.value)}
        />
      </div>

      <div className="tm-label label-ficheSect">
        <label>Visibilité</label>
        <select
          value={visibility}
          onChange={(e) => setVisibility(e.target.value)}
          className="fiche-select"
        >
          <option value="0">Privé</option>
          <option value="1">Amis</option>
          <option value="2">Public</option>
        </select>
      </div>

      {error && <div className="tm-error" style={{ marginTop: ".5rem" }}>{error}</div>}

      <div className="tm-modal-buttons">
        <button className="tm-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? "Enregistrement..." : "Enregistrer"}
        </button>
        <button onClick={onClose} disabled={loading}>Annuler</button>
      </div>
    </BaseModal>
  );
};

export default FicheModifCharacterModal;
