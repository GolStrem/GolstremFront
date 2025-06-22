// LnSuccessModal.js
import React from 'react';
import { useSelector } from 'react-redux';
import styleModal from '../../assets/styleModal.svg';
import checkIcon from '../../assets/checkIcon.svg';

const LnSuccessModal = ({ message = "Compte créé avec succès !", onClose }) => {
  const mode = useSelector(state => state.theme.mode); // light | dark

  return (
    <div className="ln-modal ln-modal-fade-in" onClick={onClose}>
      <div
        className={`ln-modal-box ln-modal-slide-in ${mode}`}
        onClick={(e) => e.stopPropagation()}
      >
        <img src={styleModal} alt="Décoration" className="ln-ModalStyle" />
        <img src={checkIcon} alt="Succès" className="ln-ModalSuccessIcon" />

        <button
          className="ln-modal-close"
          onClick={onClose}
          aria-label="Fermer"
        >
          ×
        </button>

        <h2>Succès</h2>
        <p className="ln-success-message">{message}</p>

        <button className={`ln-submit ${mode}`} onClick={onClose}>
          Fermer
        </button>

        <img src={styleModal} alt="Décoration" className="ln-ModalStyle b" />
      </div>
    </div>
  );
};

export default LnSuccessModal;
