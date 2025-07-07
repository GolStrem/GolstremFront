// fieldsConfig.js
export const fieldsConfigLogin = [
  { name: 'email', label: 'Adresse e-mail', type: 'email', component: 'input' },
  { name: 'username', label: 'Pseudo', type: 'text', component: 'input', onlyInSignup: true },
  { name: 'password', label: 'Mot de passe', type: 'password', component: 'password' },
  { name: 'confirm', label: 'Confirmez le mot de passe', type: 'password', component: 'password', onlyInSignup: true }
];

export default fieldsConfigLogin;