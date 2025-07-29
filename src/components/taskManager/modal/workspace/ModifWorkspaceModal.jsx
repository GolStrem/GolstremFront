import React, { useState } from "react";
import { isValidImageUrl } from "@service";
import { BaseModal } from "@components"


const ModifWorkspaceModal = ({ workspace, onConfirm, onCancel }) => {


  const [form, setForm] = useState({
    name: workspace?.name || "",
    description: workspace?.description || "",
    image: workspace?.image || "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    const trimmed = {
      name: form.name.trim(),
      description: form.description.trim(),
      image: form.image.trim(),
    };

    if (!trimmed.name) {
      alert("Le nom est requis.");
      return;
    }

    if (trimmed.image && !isValidImageUrl(trimmed.image)) {
      alert("L'URL de l'image n'est pas valide ou son format n'est pas autorisé.");
      return;
    }

    onConfirm(trimmed);
  };


  return (
    <BaseModal onClose={onCancel} className={`tmedit `}>
        <button className="tm-modal-close" onClick={onCancel}>
          ✖
        </button>

        <h3>Modifier le workspace</h3>

        <div className="tm-modal-form">
          <label className="tm-modal-form-label">
            Nom :
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
            />
          </label>

          <label className="tm-modal-form-label">
            Description :
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
            />
          </label>

          <label className="tm-modal-form-label">
            Image (URL) :
            <input
              type="text"
              name="image"
              value={form.image}
              onChange={handleChange}
            />
          </label>
        </div>

        <div className="tm-modal-buttons">
          <button className="tm-confirm" onClick={handleSubmit}>
            Enregistrer
          </button>
          <button onClick={onCancel}>Annuler</button>
        </div>
      </BaseModal>
  );
};

export default ModifWorkspaceModal;
