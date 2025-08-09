// fieldsConfig.js
export const fieldsConfigLogin = [
  { name: 'email', label: 'login.emailLabel', type: 'email', component: 'input' },
  { name: 'username', label: 'login.usernameLabel', type: 'text', component: 'input', onlyInSignup: true },
  { name: 'password', label: 'login.passwordLabel', type: 'password', component: 'password' },
  { name: 'confirm', label: 'login.confirmLabel', type: 'password', component: 'password', onlyInSignup: true }
];

export default fieldsConfigLogin;
