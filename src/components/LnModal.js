import React, { useState, useEffect, useRef } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import LnForgotModal from './LnForgotModal';
import styleModal from '../assets/styleModal.svg';
import warningModal from '../assets/warningModal.svg';

// --- Regex & règles ---
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
const passwordRules = {
  minLength: 8,
  maxLength: 64,
  upper: /[A-Z]/,
  lower: /[a-z]/,
  number: /[0-9]/,
};

const LnModal = ({ type = 'login', onClose, onSubmit }) => {
  const isLogin = type === 'login';

  const [form, setForm] = useState({
    username: '',
    password: '',
    confirm: '',
    email: '',
  });
  const [errors, setErrors] = useState({});
  const [visiblePassword, setVisiblePassword] = useState(false);
  const [visibleConfirm, setVisibleConfirm] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');
  const [passwordScore, setPasswordScore] = useState(0);
  const [focusedField, setFocusedField] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false); // ✅ Ajout pour modal "oubli mot de passe"

  const firstInputRef = useRef(null);

  useEffect(() => {
    firstInputRef.current?.focus();
    const handleEsc = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleChange = ({ target: { name, value } }) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === 'password') evaluatePasswordStrength(value);
  };

  const evaluatePasswordStrength = (pwd) => {
    let s = 0;
    const hasLength = pwd.length >= passwordRules.minLength;
    const hasUpper = passwordRules.upper.test(pwd);
    const hasLower = passwordRules.lower.test(pwd);
    const hasNumber = passwordRules.number.test(pwd);
    const hasSpecial = /[^a-zA-Z0-9]/.test(pwd);

    if (hasLength) s++;
    if (hasUpper) s++;
    if (hasLower) s++;
    if (hasNumber) s++;

    let strengthLabel = '';
    if (s === 0) strengthLabel = '';
    else if (s <= 2) strengthLabel = 'Faible';
    else if (s === 3) strengthLabel = 'Moyen';
    else if (s === 4 && hasSpecial) strengthLabel = 'Très fort';
    else strengthLabel = 'Fort';

    setPasswordStrength(strengthLabel);
    setPasswordScore(s);
  };

  const getStrengthColor = () => {
    if (passwordScore <= 1) return 'red';
    if (passwordScore === 2) return 'orange';
    return 'green';
  };

  const validate = () => {
    const newErrors = {};
    if (!form.username.trim()) newErrors.username = 'Pseudo requis';
    else if (!usernameRegex.test(form.username))
      newErrors.username = '3-20 caractères, lettres/chiffres/underscore uniquement';

    if (!form.password) newErrors.password = 'Mot de passe requis';
    else {
      if (form.password.length < passwordRules.minLength) newErrors.password = 'Au moins 8 caractères';
      else if (form.password.length > passwordRules.maxLength) newErrors.password = 'Mot de passe trop long';
      else if (!passwordRules.upper.test(form.password)) newErrors.password = 'Inclure une majuscule';
      else if (!passwordRules.lower.test(form.password)) newErrors.password = 'Inclure une minuscule';
      else if (!passwordRules.number.test(form.password)) newErrors.password = 'Inclure un chiffre';
    }

    if (!isLogin) {
      if (!emailRegex.test(form.email)) newErrors.email = 'Adresse e-mail invalide';
      if (form.password !== form.confirm) newErrors.confirm = 'Les mots de passe ne correspondent pas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit?.(form);
    setForm({ username: '', password: '', confirm: '', email: '' });
    setPasswordStrength('');
    setPasswordScore(0);
    setFocusedField('');
    onClose();
  };

  return (
    <div className="ln-modal ln-modal-fade-in" onClick={onClose}>
      <div className="ln-modal-box ln-modal-slide-in" onClick={(e) => e.stopPropagation()}>
        <button className="ln-modal-close" onClick={onClose} aria-label="Fermer">×</button>
        <h2>{isLogin ? 'Connexion' : 'Nouveau compte'}</h2>
        <form onSubmit={handleSubmit} noValidate>
            <img src={styleModal}   alt="DecorationModal" className="ln-ModalStyle" />
            <img src={warningModal}   alt="DecorationModal" className="ln-ModalWarning" />
          <label>
            Pseudo
            <input
              ref={firstInputRef}
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              onFocus={() => setFocusedField('username')}
              onBlur={() => setFocusedField('')}
              required
              maxLength={20}
              pattern="^[a-zA-Z0-9_]{3,20}$"
              aria-invalid={!!errors.username}
              title="3 à 20 caractères, sans espace ni caractères spéciaux"
            />
            {focusedField === 'username' && <small>Entre 3 et 20 caractères, lettres, chiffres ou underscore uniquement.</small>}
            {errors.username && <span className="ln-error">{errors.username}</span>}
          </label>

          <label>
            Mot de passe
            <div className="ln-password-field">
              <input
                type={visiblePassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField('')}
                required
                maxLength={64}
                aria-invalid={!!errors.password}
              />
              <button
                type="button"
                className="ln-eye-toggle"
                onClick={() => setVisiblePassword(!visiblePassword)}
                aria-label="Afficher / masquer le mot de passe"
              >
                {visiblePassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {focusedField === 'password' && <small>Au moins 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre.</small>}
            {!isLogin && passwordStrength && (
              <div className="ln-password-strength" style={{ color: getStrengthColor() }}>
                Force : {passwordStrength}
              </div>
            )}
            {errors.password && <span className="ln-error">{errors.password}</span>}
          </label>
           
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

          {!isLogin && (
            <>
                <img src={styleModal}   alt="DecorationModal" className="ln-ModalStyle" />
                <img src={warningModal}   alt="DecorationModal" className="ln-ModalWarning" />
              <label>
                Confirmez le mot de passe
                <div className="ln-password-field">
                  <input
                    type={visibleConfirm ? 'text' : 'password'}
                    name="confirm"
                    value={form.confirm}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('confirm')}
                    onBlur={() => setFocusedField('')}
                    required
                    maxLength={64}
                    aria-invalid={!!errors.confirm}
                  />
                  <button
                    type="button"
                    className="ln-eye-toggle"
                    onClick={() => setVisibleConfirm(!visibleConfirm)}
                    aria-label="Afficher / masquer le mot de passe"
                  >
                    {visibleConfirm ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.confirm && <span className="ln-error">{errors.confirm}</span>}
              </label>
              <label>
                Adresse e-mail
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField('')}
                  required
                  aria-invalid={!!errors.email}
                  pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
                />
                {errors.email && <span className="ln-error">{errors.email}</span>}
              </label>
            </>
          )}

          <button type="submit" className="ln-submit">
            {isLogin ? 'Se connecter' : 'Valider la création'}
          </button>
          <img src={styleModal}   alt="DecorationModal" className="ln-ModalStyle b" />
        </form>

        {/* ✅ Modal "Mot de passe oublié" */}
        {showForgotModal && (
          <LnForgotModal onClose={() => setShowForgotModal(false)} />
        )}
      </div>
      
    </div>
  );
};

export default LnModal;
