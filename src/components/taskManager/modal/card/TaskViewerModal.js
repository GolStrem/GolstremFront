// TaskViewerModal.jsx
import React from "react";
import { useSelector } from "react-redux";
import "./../../TaskCard.css"
import { BoardCardAccess, BaseModal } from "@components"


const getStateLabel = (state) => {
  switch (state) {
    case 0: return "À faire";
    case 1: return "En cours";
    case 2: return "Fait";
    case 3: return "En attente";
    default: return "Inconnu";
  }
};

const TaskViewerModal = ({ card, boardId, closeModal, openEdit }) => {
  const themeMode = useSelector((state) => state.theme.mode);

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <BaseModal onClose={closeModal} className={`tmedit ${themeMode}`}>
        <button className="tm-close-btn" onClick={closeModal}></button>
        <div className="tm-viewer-grid">
          <div className="tm-viewer-left">
            <h2 className="tm-viewer-name">{card.name}</h2>
            <div className="tm-viewer-meta">
              <span className="tm-viewer-state">{getStateLabel(card.state)}</span>
              <span className="tm-viewer-dates">
                {formatDate(card.createdAt)} &nbsp; {formatDate(card.endAt)}
              </span>
            </div>
            <div className="tm-viewer-description">
              <p>{card.description}</p>
            </div>
          </div>

            <div className="tm-image-preview">
            {card.image && <img src={card.image} alt="Pièce jointe" />}
            {BoardCardAccess.hasWriteAccess(card.droit) && (
            <div className="tm-edit-btn-container">
                <button
                    className="tm-edit-btn"
                    onClick={() => {
                        closeModal(); // ferme le viewer
                        setTimeout(() => openEdit(boardId, card), 0); // ouvre l’éditeur juste après
                    }}
                    >
                    ✏️
                    </button>
              
            </div>
          )}


          </div>
        </div>
      </BaseModal>
  );
};

export default TaskViewerModal;