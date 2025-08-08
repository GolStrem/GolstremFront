import { useTranslation } from 'react-i18next';

// --- Regex & règles ---
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
export const passwordRules = {
  minLength: 8,
  maxLength: 64,
  upper: /[A-Z]/,
  lower: /[a-z]/,
  number: /[0-9]/,
};

// --- Évaluation de la force du mot de passe ---
// Ajout de t pour traduire directement le label
export function evaluatePasswordStrength(password, t) {
  let score = 0;
  const hasLength = password.length >= passwordRules.minLength;
  const hasUpper = passwordRules.upper.test(password);
  const hasLower = passwordRules.lower.test(password);
  const hasNumber = passwordRules.number.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);

  if (hasLength) score++;
  if (hasUpper) score++;
  if (hasLower) score++;
  if (hasNumber) score++;

  let label = '';
  if (score === 0) label = '';
  else if (score <= 2) label = t('login.passwordWeak');      // Faible
  else if (score === 3) label = t('login.passwordMedium');   // Moyen
  else if (score === 4 && hasSpecial) label = t('login.passwordVeryStrong'); // Très fort
  else label = t('login.passwordStrong');                    // Fort

  return { score, label };
}

// --- Couleur associée à la force ---
export function getStrengthColor(score) {
  if (score <= 1) return 'red';
  if (score === 2) return 'orange';
  return 'green';
}

const lnFormUtils = {
  emailRegex,
  usernameRegex,
  passwordRules,
  evaluatePasswordStrength,
  getStrengthColor,
};

export default lnFormUtils;
