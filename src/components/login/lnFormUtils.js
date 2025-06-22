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
export function evaluatePasswordStrength(password) {
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
  else if (score <= 2) label = 'Faible';
  else if (score === 3) label = 'Moyen';
  else if (score === 4 && hasSpecial) label = 'Très fort';
  else label = 'Fort';

  return { score, label };
}

// --- Couleur associée à la force ---
export function getStrengthColor(score) {
  if (score <= 1) return 'red';
  if (score === 2) return 'orange';
  return 'green';
}
