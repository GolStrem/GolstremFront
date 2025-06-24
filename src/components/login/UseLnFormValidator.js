import { emailRegex, usernameRegex, passwordRules } from './lnFormUtils';

export const UseLnFormValidator = (form, isLogin) => {
  const validate = () => {
    const errors = {};

    if (!form.username.trim()) errors.username = 'Pseudo requis';
    else if (!usernameRegex.test(form.username))
      errors.username = '3-20 caractères, lettres/chiffres/underscore uniquement';

    if (!form.password) errors.password = 'Mot de passe requis';
    else {
      if (form.password.length < passwordRules.minLength) errors.password = 'Au moins 8 caractères';
      else if (form.password.length > passwordRules.maxLength) errors.password = 'Mot de passe trop long';
      else if (!passwordRules.upper.test(form.password)) errors.password = 'Inclure une majuscule';
      else if (!passwordRules.lower.test(form.password)) errors.password = 'Inclure une minuscule';
      else if (!passwordRules.number.test(form.password)) errors.password = 'Inclure un chiffre';
    }

    if (!isLogin) {
      if (!emailRegex.test(form.email)) errors.email = 'Adresse e-mail invalide';
      if (form.password !== form.confirm) errors.confirm = 'Les mots de passe ne correspondent pas';
    }

    return errors;
  };

  return { validate };
};

export default UseLnFormValidator;