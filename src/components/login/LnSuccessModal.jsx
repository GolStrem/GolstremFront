import React from 'react';
import { StyleModalIcon, CheckIcon } from "@assets";

const LnSuccessModal = ({ message = "Compte créé avec succès ! Un mail vous a été envoyé pour valider votre compte", onClose }) => {


  return (
    <div className="ln-modal ln-modal-fade-in" onClick={onClose}>
      <div
        className={`ln-modal-box ln-modal-slide-in`}
        onClick={(e) => e.stopPropagation()}
      >

        <StyleModalIcon alt="Décoration" className="ln-ModalStyle" />
        <CheckIcon alt="Succès" className="ln-ModalSuccessIcon" />

        <button
          className="ln-modal-close"
          onClick={onClose}
          aria-label="Fermer"
        >
          ×
        </button>

        <h2>Succès</h2>
        <p className="ln-success-message">{message}</p>

        <button className={`ln-submit`} onClick={onClose}>
          Fermer
        </button>

        <StyleModalIcon alt="Décoration" className="ln-ModalStyle b" />
      </div>
    </div>
  );
};

export default LnSuccessModal;
