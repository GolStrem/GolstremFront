import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { StyleModalIcon, WarningIcon } from "@assets";
import apiService from '@service/api/ApiService';

const LnForgotModal = ({ onClose, onSubmit }) => {
  const { t } = useTranslation('login');
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
      setError(t('login.errorInvalidEmail'));
      return;
    }

    try {
      setError('');
      await apiService.sendResetPasswordEmail(email);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setError(t('login.errorForgotGlobal'));
    }
  };

  return (
    <div className="ln-modal ln-modal-fade-in" onClick={onClose}>
      <div className="ln-modal-box ln-modal-slide-in" onClick={(e) => e.stopPropagation()}>
        <button
          className="ln-modal-close"
          onClick={onClose}
          aria-label={t('close')}
        >
          ×
        </button>

        <StyleModalIcon alt={t('decorationAlt')} className="ln-ModalStyle" />
        <WarningIcon alt={t('warningAlt')} className="ln-ModalWarning" />

        <h2>{t('login.forgotTitle')}</h2>

        <form onSubmit={handleSubmit} noValidate>
          <label>
            <p>{t('login.emailLabel')}</p>
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
            {t('send')}
          </button>

          {submitted && (
            <p className="ln-success-message">
              {t('login.forgotSuccess')}
            </p>
          )}
        </form>

        <StyleModalIcon alt={t('decorationAlt')} className="ln-ModalStyle b" />
      </div>
    </div>
  );
};

export default LnForgotModal;
