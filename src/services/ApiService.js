// src/services/apiService.js
// ------------------------------------------------------------
// Service d'accès à l'API Node.js existante.
// Les routes utilisées correspondent à la collection Postman fournie :
//   • POST   /user/login
//   • GET    /user/validMail/:email/:tokenMail
//   • POST   /user/create
//   • GET    /userInfo
//   • PUT    /userInfo
//   • PUT    /user/changePassword
// ------------------------------------------------------------
// ➜  Prérequis : `npm i axios`  (ou `yarn add axios`)
// ➜  Pensez à définir la variable d'environnement REACT_APP_API_ENDPOINT
//     dans votre fichier .env (ex. http://localhost:3000/)
// ------------------------------------------------------------

import axios from 'axios';

// Base URL configurable via variable d'env, sinon fallback localhost
const API_BASE_URL = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:3000/';

// Instance Axios pré‑configurée
const api = axios.create({
  baseURL: API_BASE_URL,
});

// ------------------------------------------------------------
// Gestion du token
// ------------------------------------------------------------
const TOKEN_KEY = 'token';

/** Récupère le token depuis le localStorage (null si absent) */
const getToken = () => localStorage.getItem(TOKEN_KEY);

/** Enregistre le token dans le localStorage */
const setToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

/** Supprime le token (logout) */
const clearToken = () => localStorage.removeItem(TOKEN_KEY);

// ------------------------------------------------------------
// Intercepteur : ajoute automatiquement le header Authorization
// ------------------------------------------------------------
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    // L'API attend visiblement le token brut (pas 'Bearer ')
    // Adaptez ici si votre backend attend un préfixe particulier
    config.headers.Authorization = token;
  }
  return config;
});

// Intercepteur de réponse (gestion 401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearToken();
      // 👉 Ici vous pouvez rediriger vers /login ou déclencher une action Redux
    }
    return Promise.reject(error);
  }
);

// ------------------------------------------------------------
// Fonctions d'appel aux routes
// ------------------------------------------------------------

/**
 * Authentifie l'utilisateur.
 * @param {string} login
 * @param {string} password
 * @returns {Promise<string>} token brut renvoyé par l'API
 */
export const login = async (login, password) => {
  const { data } = await api.post('/user/login', { login, password });
  // Si le backend renvoie le token dans `data`, on le stocke
  setToken(data);
  return data;
};

/**
 * Valide l'adresse email après clic sur le lien reçu.
 * @param {string} email
 * @param {string} emailToken  token présent dans l'URL du mail
 */
export const validateMail = (email, emailToken) =>
  api.get(`/user/validMail/${encodeURIComponent(email)}/${emailToken}`);

/**
 * Crée un nouvel utilisateur.
 */
export const createUser = (login, password, email) =>
  api.post('/user/create', { login, password, email });

/**
 * Récupère les informations du profil.
 */
export const getUserInfo = () => api.get('/userInfo');

/**
 * Met à jour les informations du profil.
 * @param {object} payload ex. { theme: 'light' }
 */
export const updateUserInfo = (payload) => api.put('/userInfo', payload);

/**
 * Change le mot de passe de l'utilisateur.
 */
export const changePasswordByToken = (userId, token, newPassword) =>
  api.put('/user/changePassword', { userId, token, newPassword });

/**
 * Déconnecte l'utilisateur côté client.
 */
export const logout = () => {
  clearToken();
  // Ici vous pouvez aussi notifier votre store (Redux, Zustand, ...)
};

/**
 * Envoie un e-mail de réinitialisation de mot de passe.
 * @param {string} email
 */
export const sendResetPasswordEmail = (email) =>
  api.get(`/user/sendMailPassword/${encodeURIComponent(email)}`);


// ------------------------------------------------------------
// Export par défaut : toutes les méthodes regroupées
// ------------------------------------------------------------
export default {
  login,
  validateMail,
  createUser,
  getUserInfo,
  updateUserInfo,
  changePasswordByToken,
  logout,
  sendResetPasswordEmail,
  // helpers
  getToken,
  setToken,
};
