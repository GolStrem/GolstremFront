import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { warningModal, styleModal } from '@assets';

import LnForgotModal from './LnForgotModal';
import LnInput from './LnInput';
import LnPasswordField from './LnPasswordField';
import LnSuccessModal from './LnSuccessModal';
import { UseLnFormValidator } from './UseLnFormValidator';
import fields from './fieldsConfigLogin';
import { evaluatePasswordStrength, getStrengthColor } from './lnFormUtils';

import apiService from '@service/api/ApiService';
import { login as loginAction } from '@store/authSlice';






const LnModal = ({ type = 'login', onClose, onSubmit }) => {
  const isLogin = type === 'login';
  const mode = useSelector(state => state.theme.mode);
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

  const { validate } = UseLnFormValidator(form, isLogin);

  useEffect(() => {
    firstInputRef.current?.focus();
    const handleEsc = e => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleChange = ({ target: { name, value } }) => {
    setForm(prev => ({ ...prev, [name]: value }));

    if (name === 'password') {
      const { score, label } = evaluatePasswordStrength(value);
      setPasswordScore(score);
      setPasswordStrength(label);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    try {
      if (isLogin) {
        await apiService.login(form.email, form.password);

        // Redux login
        dispatch(
          loginAction({
            token: apiService.getToken(),
            userCode: form.username,
          })
        );

        onClose();
        navigate('/dashboard');
      } else {
        await apiService.createUser(form.username, form.password, form.email);
        setShowSuccessModal(true);
      }

      setForm({ username: '', password: '', confirm: '', email: '' });
      setPasswordStrength('');
      setPasswordScore(0);
    } catch (err) {
      console.error(err);
      const message =
        err.response?.status === 409
          ? 'Cet utilisateur existe déjà.'
          : 'Erreur : identifiants invalides ou problème serveur.';
      setErrors({ global: message });
    }
  };

  const renderField = field => {
    if (field.onlyInSignup && isLogin) return null;

    if (field.component === 'password') {
      return (
        <LnPasswordField
          key={field.name}
          name={field.name}
          label={field.label}
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
        label={field.label}
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
        className={`ln-modal-box ln-modal-slide-in ${mode}`}
        onClick={e => e.stopPropagation()}
      >
        <img src={styleModal} alt="Décoration" className="ln-ModalStyle" />
        <img src={warningModal} alt="Avertissement" className="ln-ModalWarning" />

        <button className="ln-modal-close" onClick={onClose} aria-label="Fermer">
          ×
        </button>

        <h2>{isLogin ? 'Connexion' : 'Nouveau compte'}</h2>

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
                Mot de passe oublié ?
              </button>
            </div>
          )}

          <button
            type="submit"
            className={`ln-submit ${mode === 'light' ? 'light' : 'dark'}`}
          >
            {isLogin ? 'Se connecter' : 'Valider la création'}
          </button>

          <img src={styleModal} alt="Décoration" className="ln-ModalStyle b" />
        </form>

        {showForgotModal && (
          <LnForgotModal onClose={() => setShowForgotModal(false)} />
        )}

        {showSuccessModal && (
          <LnSuccessModal
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
