import React, { useState, useEffect } from "react";


const Modal = ({ modalData, closeModal, handleCreateOrUpdateCard }) => {
  // État local pour gérer les données du formulaire de la modal
  const [formData, setFormData] = useState({
    boardId: modalData.boardId || null, 
    cardId: modalData.cardId || null,  
    text: modalData.text || "",        
    color: modalData.color || "#ffffff", 
  });

  // Synchronise l'état local avec modalData chaque fois que modalData change
  useEffect(() => {
    setFormData({
      boardId: modalData.boardId || null,
      cardId: modalData.cardId || null,
      text: modalData.text || "",
      color: modalData.color || "#ffffff",
    });
  }, [modalData]);

  // Fonction appelée lorsqu'une modification est faite dans les champs du formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target; 
    setFormData((prev) => ({ ...prev, [name]: value })); 
  };

  // Fonction appelée lorsque l'utilisateur clique sur le bouton "Create" ou "Update"
  const handleSubmit = () => {
    const { boardId, cardId, text, color } = formData;

    if (!text.trim()) {
      alert("Le texte ne peut pas être vide.");
      return;
    }

    handleCreateOrUpdateCard(boardId, cardId, text, color);
    closeModal();
  };

  return (
    <div className="modal">
      <div className="modal-content">
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

        <div className="modal-buttons">
          <button onClick={handleSubmit}>
            {formData.cardId ? "Modifier" : "Créer"}
          </button>
          <button onClick={closeModal}>Annuler</button>
        </div>
        
      </div>
    </div>
  );
};

export default Modal;
