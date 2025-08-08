import React from 'react';
import { StyleModalIcon, CheckIcon } from "@assets";
import { useTranslation } from "react-i18next";

const LnSuccessModal = ({ message, onClose }) => {

  const { t } = useTranslation("login");

  return (
    <div className="ln-modal ln-modal-fade-in" onClick={onClose}>
      <div
        className="ln-modal-box ln-modal-slide-in"
        onClick={(e) => e.stopPropagation()}
      >
        <StyleModalIcon alt="Décoration" className="ln-ModalStyle" />
        <CheckIcon alt={t("title")} className="ln-ModalSuccessIcon" />

        <button
          className="ln-modal-close"
          onClick={onClose}
          aria-label={t("close")}
        >
          ×
        </button>

        <h2>{t("title")}</h2>
        <p className="ln-success-message">
          {message || t("login.messageSuccessNouveau")}
        </p>

        <button className="ln-submit" onClick={onClose}>
          {t("close")}
        </button>

        <StyleModalIcon alt="Décoration" className="ln-ModalStyle b" />
      </div>
    </div>
  );
};

export default LnSuccessModal;
