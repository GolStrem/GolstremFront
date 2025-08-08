import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { StyleModalIcon, WarningIcon } from "@assets";

import LnForgotModal from './LnForgotModal';
import LnInput from './LnInput';
import LnPasswordField from './LnPasswordField';
import LnSuccessModal from './LnSuccessModal';
import { UseLnFormValidator } from './UseLnFormValidator';
import fields from './fieldsConfigLogin';
import { evaluatePasswordStrength, getStrengthColor } from './lnFormUtils';

import apiService from '@service/api/ApiService';
import { setTheme } from '@store/themeSlice';
import { login as loginAction } from '@store/authSlice';

const LnModal = ({ type = 'login', onClose, onSubmit }) => {
  const { t } = useTranslation('login'); 
  const isLogin = type === 'login';
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [form, setForm] = useState({
    username: '',
    password: '',
    confirm: '',
    email: '',
  });

  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState('');
  const [passwordScore, setPasswordScore] = useState(0);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const firstInputRef = useRef(null);

  const { validate } = UseLnFormValidator(form, isLogin, t);

  useEffect(() => {
    firstInputRef.current?.focus();
    const handleEsc = e => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleChange = ({ target: { name, value } }) => {
    setForm(prev => ({ ...prev, [name]: value }));
    if (name === 'password') {
      const { score, label } = evaluatePasswordStrength(value, t);
      setPasswordScore(score);
      setPasswordStrength(label);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    if (isLogin) {
      // 1) login
      const tryLogin = await apiService.login(form.email, form.password);
      if (tryLogin === undefined) {
        setErrors({ global: t('login.errorInvalidCredentials') });
        return;
      }

      // 2) infos utilisateur
      const { data } = await apiService.getUserDetail();
      delete data.friends;
      for (const [key, value] of Object.entries(data)) {
        localStorage.setItem(key, value);
      }

      // thème (si utile)
      dispatch(setTheme(localStorage.getItem('theme')));
      document.documentElement.style.setProperty("--jaune", localStorage.getItem('color'));

      // 3) Redux auth
      dispatch(
        loginAction({
          token: apiService.getToken(),
          ...data
        })
      );

      onClose();
      navigate('/dashboard');
    } else {
      // inscription
      const responseApi = await apiService.createUser(form.username, form.password, form.email);
      if (responseApi.status === 409) {
        setErrors({ global: t('login.errorTaken') });
      } else {
        setShowSuccessModal(true);
        setForm({ username: '', password: '', confirm: '', email: '' });
        setPasswordStrength('');
        setPasswordScore(0);
      }
    }
  };

  const renderField = (field) => {
    if (field.onlyInSignup && isLogin) return null;

    const translatedLabel = t(field.label); // ✅ traduction ici

    if (field.component === 'password') {
      return (
        <LnPasswordField
          key={field.name}
          name={field.name}
          label={translatedLabel}
          value={form[field.name]}
          onChange={handleChange}
          error={errors[field.name]}
          strength={field.name === 'password' ? passwordStrength : undefined}
          score={field.name === 'password' ? passwordScore : 0}
          showStrength={field.name === 'password' && !isLogin}
          getStrengthColor={getStrengthColor}
        />
      );
    }

    return (
      <LnInput
        key={field.name}
        ref={field.name === 'username' ? firstInputRef : undefined}
        name={field.name}
        label={translatedLabel}
        type={field.type}
        value={form[field.name]}
        onChange={handleChange}
        error={errors[field.name]}
        maxLength={field.type === 'text' ? 20 : undefined}
        required
      />
    );
  };

  return (
    <div className="ln-modal ln-modal-fade-in" onClick={onClose}>
      <div
        className="ln-modal-box ln-modal-slide-in"
        onClick={e => e.stopPropagation()}
      >
        <StyleModalIcon alt={t('decorationAlt')} className="ln-ModalStyle" />
        <WarningIcon alt={t('warningAlt')}  className="ln-ModalWarning" />

        <button className="ln-modal-close" onClick={onClose} aria-label={t('close')}>
          ×
        </button>

        <h2>{isLogin ? t('login.connexionTitle') : t('login.signupTitle')}</h2>

        <form onSubmit={handleSubmit} noValidate>
          {fields.map(renderField)}

          {errors.global && (
            <div className="ln-error-global">{errors.global}</div>
          )}

          {isLogin && (
            <div className="ln-forgot-password">
              <button
                type="button"
                className="ln-link-button"
                onClick={() => setShowForgotModal(true)}
              >
                {t('login.forgot')}
              </button>
            </div>
          )}

          <button type="submit" className="ln-submit">
            {isLogin ? t('login.loginCta') : t('login.signupCta')}
          </button>

          <StyleModalIcon alt={t('decorationAlt')} className="ln-ModalStyle b" />
        </form>

        {showForgotModal && (
          <LnForgotModal onClose={() => setShowForgotModal(false)} />
        )}

        {showSuccessModal && (
          <LnSuccessModal
            message={t('login.messageSuccessNouveau')}
            onClose={() => {
              setShowSuccessModal(false);
              onClose();
              navigate('/dashboard');
            }}
          />
        )}
      </div>
    </div>
  );
};

export default LnModal;
