import React from "react";
import "./../../TaskCard.css";
import { BoardCardAccess, BaseModal } from "@components";
import { useTranslation } from "react-i18next";

const TaskViewerModal = ({ card, boardId, closeModal, openEdit }) => {
  const { t } = useTranslation("workspace");

  const getStateLabel = (state) => {
    switch (state) {
      case 0:
        return t("workspace.stateTodo");
      case 1:
        return t("workspace.stateInProgress");
      case 2:
        return t("workspace.stateDone");
      case 3:
        return t("workspace.statePending");
      default:
        return t("workspace.stateUnknown");
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <BaseModal onClose={closeModal} className="tmedit">
      
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
          {card.image && <img src={card.image} alt={t("workspace.attachmentAlt")} />}
          {BoardCardAccess.hasWriteAccess(card.droit) && (
            <div className="tm-edit-btn-container">
              <button
                className="tm-edit-btn"
                onClick={() => {
                  closeModal();
                  setTimeout(() => openEdit(boardId, card), 0);
                }}
                title={t("workspace.editTask")}
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
