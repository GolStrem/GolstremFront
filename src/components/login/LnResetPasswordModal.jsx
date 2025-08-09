import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LnPasswordField from './LnPasswordField';
import LnSuccessModal from './LnSuccessModal';
import apiService from '@service/api/ApiService';
import { StyleModalIcon, WarningIcon } from "@assets";

import {
  evaluatePasswordStrength,
  getStrengthColor,
  passwordRules,
} from './lnFormUtils';

const LnResetPasswordModal = ({ onClose = () => {}, onSubmit }) => {
  const { t } = useTranslation('login'); 
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState('');
  const [passwordScore, setPasswordScore] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const firstInputRef = useRef(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    firstInputRef.current?.focus();
    const handleEsc = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleChange = ({ target: { name, value } }) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === 'password') {
      const { score, label } = evaluatePasswordStrength(value, t);
      setPasswordScore(score);
      setPasswordStrength(label);
    }
  };

  const validate = () => {
    const errs = {};
    if (form.password.length < passwordRules.minLength)
      errs.password = t('login.errorMinLength'); // Au moins 8 caractères
    else if (form.password.length > passwordRules.maxLength)
      errs.password = t('login.errorTooLong');
    else if (!passwordRules.upper.test(form.password))
      errs.password = t('login.errorUpper');
    else if (!passwordRules.lower.test(form.password))
      errs.password = t('login.errorLower');
    else if (!passwordRules.number.test(form.password))
      errs.password = t('login.errorNumber');

    if (form.password !== form.confirm)
      errs.confirm = t('login.errorMismatch');

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
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error(err);
      setErrors({ global: t('login.errorGlobal') });
    }
  };

  return (
    <>
      <div className="ln-modal ln-modal-fade-in" onClick={onClose}>
        <div
          className="ln-modal-box ln-modal-slide-in"
          onClick={(e) => e.stopPropagation()}
        >
          <StyleModalIcon alt={t('decorationAlt')} className="ln-ModalStyle" />
          <WarningIcon alt={t('warningAlt')} className="ln-ModalWarning" />

          <button
            className="ln-modal-close"
            onClick={onClose}
            aria-label={t('close')}
          >
            ×
          </button>

          <h2 className="resetmdp">{t('login.resetTitle')}</h2>

          <form onSubmit={handleSubmit} noValidate>
            <LnPasswordField
              ref={firstInputRef}
              name="password"
              label={t('login.passwordLabel')}
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
              label={t('login.confirmLabel')}
              value={form.confirm}
              onChange={handleChange}
              error={errors.confirm}
              getStrengthColor={getStrengthColor}
            />

            {errors.global && <p className="ln-error-global">{errors.global}</p>}

            <button type="submit" className="ln-submit" disabled={submitted}>
              {t('validate')}
            </button>

            {submitted && (
              <p className="ln-success-message">
                {t('login.successRedirect')}
              </p>
            )}

            <StyleModalIcon alt={t('decorationAlt')} className="ln-ModalStyle b" />
          </form>
        </div>
      </div>

      {submitted && (
        <LnSuccessModal
          // on garde LnSuccessModal, mais on lui passe la chaîne traduite
          message={t('login.successShort')}
          onClose={() => navigate('/login')}
        />
      )}
    </>
  );
};

export default LnResetPasswordModal;
