import React, { useState, useEffect, useRef } from 'react';
import {warningModal, styleModal } from '@assets';
import apiService from '@service/api/ApiService';

const LnForgotModal = ({ onClose, onSubmit }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    const handleEsc = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setError("Adresse e-mail invalide");
      return;
    }

    try {
      setError('');
      await apiService.sendResetPasswordEmail(email);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setError("Une erreur s'est produite. Vérifiez l'adresse ou réessayez.");
    }
  };

  return (
    <div className="ln-modal ln-modal-fade-in" onClick={onClose}>
      <div className="ln-modal-box ln-modal-slide-in" onClick={(e) => e.stopPropagation()}>
        <button className="ln-modal-close" onClick={onClose} aria-label="Fermer">×</button>

        <img src={styleModal} alt="Décoration" className="ln-ModalStyle" />
        <img src={warningModal} alt="Avertissement" className="ln-ModalWarning" />

        <h2>Mot de passe oublié</h2>

        <form onSubmit={handleSubmit} noValidate>
          <label>
            <p>Adresse e-mail</p>
            <input
              ref={inputRef}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              pattern="^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"
              aria-invalid={!!error}
              disabled={submitted}
            />
            {error && <span className="ln-error">{error}</span>}
          </label>

          <button type="submit" className="ln-submit" disabled={submitted}>
            Envoyer
          </button>

          {submitted && (
            <p className="ln-success-message">
              Si l'adresse correspond à un compte, un e-mail a été envoyé.
            </p>
          )}
        </form>

        <img src={styleModal} alt="Décoration" className="ln-ModalStyle b" />
      </div>
    </div>
  );
};

export default LnForgotModal;
