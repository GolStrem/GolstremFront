import React, { useState, useEffect, useRef } from 'react';
import styleModal from '../assets/styleModal.svg';
import warningModal from '../assets/warningModal.svg';
const LnForgotModal = ({ onClose, onSubmit }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setError("Adresse e-mail invalide");
      return;
    }
    setError('');
    onSubmit?.(email);
    alert("Lien de réinitialisation envoyé (fictif)");
    onClose();
  };

  return (
    <div className="ln-modal ln-modal-fade-in" onClick={onClose}>
      <div className="ln-modal-box ln-modal-slide-in" onClick={(e) => e.stopPropagation()}>
        <button className="ln-modal-close" onClick={onClose} aria-label="Fermer">×</button>

        <img src={styleModal}   alt="DecorationModal" className="ln-ModalStyle" />
        <img src={warningModal}   alt="DecorationModal" className="ln-ModalWarning" />

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
              pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
              aria-invalid={!!error}
            />
            {error && <span className="ln-error">{error}</span>}
          </label>
          <button type="submit" className="ln-submit">Envoyer</button>
        </form>
        <img src={styleModal}   alt="DecorationModal" className="ln-ModalStyle b" />
      </div>
    </div>
  );
};

export default LnForgotModal;
