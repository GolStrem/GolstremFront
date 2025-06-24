// LnModal.js
import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import LnForgotModal from './LnForgotModal';
import LnSuccessModal from './LnSuccessModal';
import LnInput from './LnInput';
import LnPasswordField from './LnPasswordField';

import styleModal from '../../assets/styleModal.svg';
import warningModal from '../../assets/warningModal.svg';

import { evaluatePasswordStrength, getStrengthColor } from './lnFormUtils';
import { UseLnFormValidator } from './UseLnFormValidator';
import { fields } from './fieldsConfig';

import apiService from '../../services/ApiService'; // Service API

const LnModal = ({ type = 'login', onClose, onSubmit }) => {
  const isLogin = type === 'login';
  const mode = useSelector(state => state.theme.mode); // light | dark
  const navigate = useNavigate(); // Pour redirection après succès

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
        await apiService.login(form.username, form.password);
        onClose();               // ferme la modale
        navigate('/dashboard'); // redirige après connexion
      } else {
        await apiService.createUser(form.username, form.password, form.email);
        setShowSuccessModal(true); // affiche modale succès
      }

      setForm({ username: '', password: '', confirm: '', email: '' });
      setPasswordStrength('');
      setPasswordScore(0);
    } catch (err) {
      console.error(err);
      setErrors({ global: 'Erreur : identifiants invalides ou compte existant.' });
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
              navigate('/dashboard'); // redirection après inscription réussie
            }}
          />
        )}
      </div>
    </div>
  );
};

export default LnModal;
