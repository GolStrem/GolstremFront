import React, { useState } from "react";
import { useSelector } from "react-redux";


const ModifWorkspaceModal = ({ workspace, onConfirm, onCancel }) => {
  const mode = useSelector((state) => state.theme.mode);

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
    onConfirm(trimmed);
  };

  return (
    <div className={`tm-modal-overlay ${mode}`} onClick={onCancel}>
      <div
        className={`tm-modal-popup ${mode}`}
        onClick={(e) => e.stopPropagation()}
      >
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
      </div>
    </div>
  );
};

export default ModifWorkspaceModal;
