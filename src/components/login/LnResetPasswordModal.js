import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

import LnPasswordField from './LnPasswordField';
import LnSuccessModal from './LnSuccessModal';

import styleModal from '../../assets/styleModal.svg';
import warningModal from '../../assets/warningModal.svg';

import {
  evaluatePasswordStrength,
  getStrengthColor,
  passwordRules,
} from './lnFormUtils';

const LnResetPasswordModal = ({ onClose, onSubmit }) => {
  const mode = useSelector((state) => state.theme.mode); // light | dark
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState('');
  const [passwordScore, setPasswordScore] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const firstInputRef = useRef(null);

  /* -- Focus et ESC -- */
  useEffect(() => {
    firstInputRef.current?.focus();
    const handleEsc = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  /* -- Handlers -- */
  const handleChange = ({ target: { name, value } }) => {
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === 'password') {
      const { score, label } = evaluatePasswordStrength(value);
      setPasswordScore(score);
      setPasswordStrength(label);
    }
  };

  const validate = () => {
    const errs = {};

    /* Mot de passe */
    if (form.password.length < passwordRules.minLength)
      errs.password = 'Au moins 8 caractères';
    else if (form.password.length > passwordRules.maxLength)
      errs.password = 'Mot de passe trop long';
    else if (!passwordRules.upper.test(form.password))
      errs.password = 'Inclure une majuscule';
    else if (!passwordRules.lower.test(form.password))
      errs.password = 'Inclure une minuscule';
    else if (!passwordRules.number.test(form.password))
      errs.password = 'Inclure un chiffre';

    /* Confirmation */
    if (form.password !== form.confirm)
      errs.confirm = 'Les mots de passe ne correspondent pas';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit?.(form.password); // appelle ton handler parent
    setSubmitted(true);
  };

  /* -- Rendu -- */
  return (
    <>
      <div className="ln-modal ln-modal-fade-in" onClick={onClose}>
        <div
          className={`ln-modal-box ln-modal-slide-in ${mode}`}
          onClick={(e) => e.stopPropagation()}
        >
          <img src={styleModal} alt="Décoration" className="ln-ModalStyle" />
          <img src={warningModal} alt="Avertissement" className="ln-ModalWarning" />

          <button className="ln-modal-close" onClick={onClose} aria-label="Fermer">
            ×
          </button>

          <h2>Nouveau mot de passe</h2>

          <form onSubmit={handleSubmit} noValidate>
            {/* Nouveau mot de passe */}
            <LnPasswordField
              ref={firstInputRef}
              name="password"
              label="Mot de passe"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              strength={passwordStrength}
              score={passwordScore}
              showStrength
              getStrengthColor={getStrengthColor}
            />

            {/* Confirmation */}
            <LnPasswordField
              name="confirm"
              label="Confirmez le mot de passe"
              value={form.confirm}
              onChange={handleChange}
              error={errors.confirm}
              getStrengthColor={getStrengthColor}
            />

            <button
              type="submit"
              className={`ln-submit ${mode}`}
              disabled={submitted}
            >
              Valider
            </button>

            {submitted && (
              <p className="ln-success-message">
                Mot de passe modifié avec succès !
              </p>
            )}

            <img src={styleModal} alt="Décoration" className="ln-ModalStyle b" />
          </form>
        </div>
      </div>

      {/* Petite modale de succès réutilisable (facultatif) */}
      {submitted && (
        <LnSuccessModal
          message="Mot de passe modifié avec succès !"
          onClose={() => {
            setSubmitted(false);
            onClose();
          }}
        />
      )}
    </>
  );
};

export default LnResetPasswordModal;
