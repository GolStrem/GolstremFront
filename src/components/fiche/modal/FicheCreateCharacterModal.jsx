import React, { useState } from "react";
import { BaseModal } from "@components";
import { ApiFiche, isValidImageUrl } from "@service";
import "./FicheCreateCharacterModal.css";

const FicheCreateCharacterModal = ({ onClose, onCreate }) => {
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
      setPrenomError("Le prénom est requis.");
      hasError = true;
    }
    if (image && !isValidImageUrl(image)) {
      setImageError("URL d'image invalide (jpg, jpeg, png, gif, webp, bmp, svg).");
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
      setError("Création impossible. Réessaie plus tard.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal onClose={onClose} className="tmedit">
      <h2 className="modal-title">Créer un personnage</h2>

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
              {/* Garde la même convention que tes autres écrans : 0 Privé, 1 Amis, 2 Public */}
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
          {loading ? "Création..." : "Créer"}
        </button>
        <button onClick={onClose} disabled={loading}>
          Annuler
        </button>
      </div>
    </BaseModal>
  );
};

export default FicheCreateCharacterModal;
