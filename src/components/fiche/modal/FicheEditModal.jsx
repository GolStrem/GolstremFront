import React, { useState } from "react";
import { BaseModal } from "@components";
import "./FicheEditModal.css";

const FicheEditModal = ({ onClose, onSave, initialData }) => {
  const [name, setName] = useState(initialData?.name || "");
  const [age, setAge] = useState(initialData?.age || "");
  const [image, setImage] = useState(initialData?.image || "");
  const [about, setAbout] = useState(initialData?.about || "");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    setError("");

    if (!name.trim()) {
      setError("Le nom est requis.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        age: age.trim(),
        image: image.trim(),
        about: about.trim(),
      };

      onSave?.(payload);
      onClose?.();
    } catch (e) {
      console.error("Erreur de sauvegarde:", e);
      setError("Impossible de sauvegarder.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal onClose={onClose} className="tmedit cf-modal-large">
      <h2 className="modal-title">Modifier la fiche</h2>

      <form className="tm-modal-form" onSubmit={(e) => e.preventDefault()}>
        {/* Nom */}
        <div className="cf-field short">
          <label className="tm-label label-fiche" htmlFor="name">
            Nom :
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Âge */}
        <div className="cf-field short">
          <label className="tm-label label-fiche" htmlFor="age">
            Âge :
          </label>
          <input
            id="age"
            type="text"
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />
        </div>

        {/* Image */}
        <div className="cf-field short">
          <label className="tm-label label-fiche" htmlFor="image">
            Image (URL) :
          </label>
          <input
            id="image"
            type="url"
            value={image}
            onChange={(e) => setImage(e.target.value)}
          />
        </div>

        {/* À propos */}
        <div className="cf-field">
          <label className="tm-label label-about" htmlFor="about">
            À propos :
          </label>
          <textarea
            id="about"
            rows="6"
            value={about}
            onChange={(e) => setAbout(e.target.value)}
          />
        </div>
      </form>

      {error && <span className="tm-error">{error}</span>}

      <div className="tm-modal-buttons">
        <button
          className="tm-primary"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Sauvegarde..." : "Enregistrer"}
        </button>
        <button onClick={onClose} disabled={loading}>
          Annuler
        </button>
      </div>
    </BaseModal>
  );
};

export default FicheEditModal;
