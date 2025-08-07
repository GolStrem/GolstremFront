import React, { useState } from "react";
import { BaseModal } from "@components";
import { isValidImageUrl, ApiFiche } from "@service";
import "./FicheCreateCharacterModal.css";

const FicheCreateCharacterModal = ({ onClose, onCreate }) => {
  const [prenom, setPrenom] = useState("");
  const [image, setImage] = useState("");
  const [imageError, setImageError] = useState("");
  const [prenomError, setPrenomError] = useState("");
  const [visibility, setVisibility] = useState("2");
  const [couleur, setCouleur] = useState("#FF8C00");

  const handleSubmit = async () => {
    let hasError = false;

    if (!prenom.trim()) {
      setPrenomError("Le prénom est requis.");
      hasError = true;
    } else {
      setPrenomError("");
    }

    if (image && !isValidImageUrl(image)) {
      setImageError("URL d'image invalide");
      hasError = true;
    } else {
      setImageError("");
    }

    if (hasError) return;

    const newCharacter = {
      name: `${prenom}`,
      image,
      color: couleur,
      idOwner: localStorage.getItem("id"),
      visibility,
    };

    const newFiche = await ApiFiche.createFiche(newCharacter);
    console.log(newFiche)
    if (onCreate) onCreate(newCharacter);
    onClose();
  };

  return (
    <BaseModal onClose={onClose} className="tmedit">
      <button className="tm-modal-close" onClick={onClose}>
        ✖
      </button>

      <h2 className="modal-title">Créer un personnage</h2>

      <form className="tm-modal-form" onSubmit={(e) => e.preventDefault()}>
        <label className="tm-label label-fiche">
          Prénom Nom
          <input
            type="text"
            value={prenom}
            onChange={(e) => {
              setPrenom(e.target.value);
              setPrenomError("");
            }}
          />
          {prenomError && <span className="tm-error">{prenomError}</span>}
        </label>

        <label className="tm-label label-fiche">
          Image (URL) :
          <input
            type="url"
            value={image}
            onChange={(e) => {
              setImage(e.target.value);
              setImageError("");
            }}
          />
          {imageError && <span className="tm-error">{imageError}</span>}
        </label>

        <div className="labelSect">
          <label className="tm-label label-ficheSect">
            Visibilité :
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              className="fiche-select"
            >
              <option value="2">Privé</option>
              <option value="1">Ami/Serveur</option>
              <option value="0">Public</option>
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

      <div className="tm-modal-buttons">
        <button className="tm-primary" onClick={handleSubmit}>
          Créer
        </button>
        <button onClick={onClose}>Annuler</button>
      </div>
    </BaseModal>
  );
};

export default FicheCreateCharacterModal;
