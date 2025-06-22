// fieldsConfig.js
export const fields = [
  { name: 'username', label: 'Pseudo', type: 'text', component: 'input' },
  { name: 'password', label: 'Mot de passe', type: 'password', component: 'password' },
  { name: 'confirm', label: 'Confirmez le mot de passe', type: 'password', component: 'password', onlyInSignup: true },
  { name: 'email', label: 'Adresse e-mail', type: 'email', component: 'input', onlyInSignup: true },
];
