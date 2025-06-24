import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams, useNavigate } from 'react-router-dom';
import LnPasswordField from './LnPasswordField';
import LnSuccessModal from './LnSuccessModal';
import apiService from '@service/ApiService';
import { warningModal, styleModal } from '@assets';

import {
  evaluatePasswordStrength,
  getStrengthColor,
  passwordRules,
} from './lnFormUtils';

const LnResetPasswordModal = ({ onClose = () => {}, onSubmit }) => {
  const mode = useSelector((state) => state.theme.mode);
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState('');
  const [passwordScore, setPasswordScore] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const firstInputRef = useRef(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate(); // 🔁 Pour redirection

  useEffect(() => {
    firstInputRef.current?.focus();
    const handleEsc = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

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
    if (form.password !== form.confirm)
      errs.confirm = 'Les mots de passe ne correspondent pas';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const token = searchParams.get('token');
    const userId = searchParams.get('userId');

    try {
      await apiService.changePasswordByToken(userId, token, form.password);
      setSubmitted(true);

      // ⏳ Petite pause avant redirection
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error(err);
      setErrors({ global: 'Une erreur est survenue. Lien invalide ou expiré.' });
    }
  };

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

          <h2 className="resetmdp">Nouveau mot de passe</h2>

          <form onSubmit={handleSubmit} noValidate>
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

            <LnPasswordField
              name="confirm"
              label="Confirmez le mot de passe"
              value={form.confirm}
              onChange={handleChange}
              error={errors.confirm}
              getStrengthColor={getStrengthColor}
            />

            {errors.global && <p className="ln-error-global">{errors.global}</p>}

            <button
              type="submit"
              className={`ln-submit ${mode}`}
              disabled={submitted}
            >
              Valider
            </button>

            {submitted && (
              <p className="ln-success-message">
                Mot de passe modifié avec succès ! Redirection...
              </p>
            )}

            <img src={styleModal} alt="Décoration" className="ln-ModalStyle b" />
          </form>
        </div>
      </div>

      {submitted && (
        <LnSuccessModal
          message="Mot de passe modifié avec succès !"
          onClose={() => navigate('/login')}
        />
      )}
    </>
  );
};

export default LnResetPasswordModal;
