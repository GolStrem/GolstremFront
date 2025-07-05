import React, { useState } from "react";
import { useSelector } from "react-redux";


const CreateWorkspaceModal = ({ onConfirm, onCancel }) => {
  const mode = useSelector((state) => state.theme.mode);

  const [form, setForm] = useState({
    name: "",
    description: "",
    image: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!form.name.trim()) {
      alert("Le nom est obligatoire.");
      return;
    }
    onConfirm(form);
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

        <h3>Créer un nouveau workspace</h3>

        <div className="tm-modal-form">
          <label>
            Nom :
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Nom du workspace"
            />
          </label>

          <label>
            Description :
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Description"
            />
          </label>

          <label>
            Image (URL) :
            <input
              type="text"
              name="image"
              value={form.image}
              onChange={handleChange}
              placeholder="Lien de l'image"
            />
          </label>
        </div>

        <div className="tm-modal-buttons">
          <button className="tm-primary" onClick={handleSubmit}>
            Créer
          </button>
          <button onClick={onCancel}>Annuler</button>
        </div>
      </div>
    </div>
  );
};

export default CreateWorkspaceModal;
