import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import "./TaskEditorModal.css";

const TaskEditorModal = ({ modalData, closeModal, handleCreateOrUpdateCard, handleDeleteCard }) => {
  const isEdit = !!modalData.cardId;
  const themeMode = useSelector((state) => state.theme.mode); // "dark" or "light"

  const [formData, setFormData] = useState({
    boardId: null,
    cardId: null,
    name: "",
    description: "",
    color: "#ffffff",
    state: 0,
    endAt: "",
    createdAt: new Date().toISOString().split("T")[0],
    image: ""
  });

  useEffect(() => {
    if (isEdit && modalData.card) {
      setFormData({
        boardId: modalData.boardId || null,
        cardId: modalData.cardId || null,
        name: modalData.card.name || "",
        description: modalData.card.description || "",
        color: modalData.card.color || "#ffffff",
        state: modalData.card.state ?? 0,
        endAt: modalData.card.endAt || "",
        createdAt: modalData.card.createdAt || new Date().toISOString().split("T")[0],
        image: modalData.card.image || ""
      });
    } else {
      setFormData({
        boardId: modalData.boardId || null,
        cardId: null,
        name: "",
        description: "",
        color: "#ffffff",
        state: 0,
        endAt: "",
        createdAt: new Date().toISOString().split("T")[0],
        image: ""
      });
    }
  }, [modalData, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    const { name, description, endAt, createdAt } = formData;

    if (typeof name !== "string" || !name.trim()) return alert("Le nom est requis.");
    if (typeof description !== "string" || !description.trim()) return alert("La description est requise.");

    const sanitizedData = {
      ...formData,
      name: name.trim(),
      description: description.trim(),
      endAt: endAt || null,
      createdAt: createdAt || new Date().toISOString().split("T")[0]
    };

    handleCreateOrUpdateCard(formData.boardId, formData.cardId, sanitizedData);
    closeModal();
  };

  const handleDelete = () => {
    if (formData.cardId) {
      handleDeleteCard(formData.boardId, formData.cardId);
      closeModal();
    }
  };

  return (
    <div className="tm-modal-overlay" onClick={closeModal}>
      <div
        className={`tm-modal-popup ${themeMode}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="tm-close-btn" onClick={closeModal}>×</button>
        <h3>{isEdit ? "Modifier une tâche" : "Créer une tâche"}</h3>

        <label className="tm-label">Nom :
          <div className="tm-label-field">
            <input type="text" name="name" value={formData.name} onChange={handleChange} />
          </div>
        </label>

        <label className="tm-label">Description :
          <div className="tm-label-field">
            <textarea name="description" value={formData.description} onChange={handleChange} />
          </div>
        </label>

        <div className="tm-color-state-fields">
          <label className="tm-label tm-color-picker">Couleur :
            <div className="tm-label-field">
              <input type="color" name="color" value={formData.color} onChange={handleChange} />
            </div>
          </label>

          <label className="tm-label tm-state-select">État :
            <div className="tm-label-field">
              <select name="state" value={formData.state} onChange={handleChange}>
                <option value={0}>À faire</option>
                <option value={1}>En cours</option>
                <option value={2}>Fait</option>
                <option value={3}>En attente</option>
              </select>
            </div>
          </label>
        </div>

        <div className="tm-date-fields">
          <label className="tm-label">Échéance :
            <div className="tm-label-field">
              <input type="date" name="endAt" value={formData.endAt} onChange={handleChange} />
            </div>
          </label>

          <label className="tm-label">Date de création :
            <div className="tm-label-field">
              <input type="date" name="createdAt" value={formData.createdAt} onChange={handleChange} />
            </div>
          </label>
        </div>

        <label className="tm-label">Image (URL) :
          <div className="tm-label-field">
            <input type="text" name="image" value={formData.image} onChange={handleChange} />
          </div>
        </label>

        <div className="tm-modal-buttons">
          <button onClick={handleSubmit}>{isEdit ? "Modifier" : "Créer"}</button>
          {isEdit && (
            <button className="tm-delete-btn" onClick={handleDelete}>
              Supprimer
            </button>
          )}
          <button className="tm-cancel-btn" onClick={closeModal}>Annuler</button>
        </div>
      </div>
    </div>
  );
};

export default TaskEditorModal;
