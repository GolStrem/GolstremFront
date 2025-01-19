import React, { useState, useEffect } from "react";
import "./Modal.css"; // Assure-toi que le fichier CSS est importé

const Modal = ({ modalData, closeModal, handleCreateOrUpdateCard, handleDeleteCard }) => {
  const [formData, setFormData] = useState({
    boardId: modalData.boardId || null,
    cardId: modalData.cardId || null,
    text: modalData.text || "",
    color: modalData.color || "#ffffff",
  });

  useEffect(() => {
    setFormData({
      boardId: modalData.boardId || null,
      cardId: modalData.cardId || null,
      text: modalData.text || "",
      color: modalData.color || "#ffffff",
    });
  }, [modalData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    const { boardId, cardId, text, color } = formData;

    if (!text.trim()) {
      alert("Le texte ne peut pas être vide.");
      return;
    }

    handleCreateOrUpdateCard(boardId, cardId, text, color);
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
        className="tm-modal-popup"
        onClick={(e) => e.stopPropagation()} // Empêche la fermeture si on clique sur la popup
      >
        <h3>{formData.cardId ? "Modifier une carte" : "Créer une carte"}</h3>

        <label>
          Texte :
          <input
            type="text"
            name="text"
            value={formData.text}
            onChange={handleInputChange}
          />
        </label>

        <label>
          Couleur :
          <input
            type="color"
            name="color"
            value={formData.color}
            onChange={handleInputChange}
          />
        </label>

        <div className="tm-modal-buttons">
          <button onClick={handleSubmit}>
            {formData.cardId ? "Modifier" : "Créer"}
          </button>
          {formData.cardId && (
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

export default Modal;
