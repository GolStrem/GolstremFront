import { emailRegex, usernameRegex, passwordRules } from './lnFormUtils';

export const UseLnFormValidator = (form, isLogin, t) => {
  const validate = () => {
    const errors = {};

    // Email
    if (!emailRegex.test(form.email)) {
      errors.email = t('login.errorInvalidEmail');
    }

    // Password
    if (!form.password) {
      errors.password = t('login.requiredPassword');
    } else {
      if (form.password.length < passwordRules.minLength)
        errors.password = t('login.errorMinLength');            // "Au moins 8 caractères"
      else if (form.password.length > passwordRules.maxLength)
        errors.password = t('login.errorTooLong');               // "Mot de passe trop long"
      else if (!passwordRules.upper.test(form.password))
        errors.password = t('login.errorUpper');                 // "Inclure une majuscule"
      else if (!passwordRules.lower.test(form.password))
        errors.password = t('login.errorLower');                 // "Inclure une minuscule"
      else if (!passwordRules.number.test(form.password))
        errors.password = t('login.errorNumber');                // "Inclure un chiffre"
    }

    // Signup-only checks
    if (!isLogin) {
      if (!form.username.trim()) {
        errors.username = t('login.requiredUsername');           // "Pseudo requis"
      } else if (!usernameRegex.test(form.username)) {
        errors.username = t('login.usernameRules');              // "3-20 caractères, lettres/chiffres/underscore uniquement"
      }

      if (form.password !== form.confirm) {
        errors.confirm = t('login.errorMismatch');               // "Les mots de passe ne correspondent pas"
      }
    }

    return errors;
  };

  return { validate };
};

export default UseLnFormValidator;
