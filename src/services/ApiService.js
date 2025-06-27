import axios from 'axios';

// ==================== CONFIG ====================
const USE_MOCK = process.env.REACT_APP_USE_MOCK === 'true';
const API_BASE_URL = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:3000/';
const TOKEN_KEY = 'token';

// ==================== TOKEN UTILS ====================
const getToken = () => localStorage.getItem(TOKEN_KEY);
const setToken = (token) => token && localStorage.setItem(TOKEN_KEY, token);
const clearToken = () => localStorage.removeItem(TOKEN_KEY);

// ==================== LOGOUT COMMUN ====================
const logout = () => {
  clearToken();
  // ➜ Optionnel : redirect ou reset store
  // Exemple : window.location.href = '/login';
};

// ==================== MOCK MODE ====================
const mockWait = (ms = 500) => new Promise((res) => setTimeout(res, ms));

const MOCK_USERNAME = 'mockuser';
const MOCK_PASSWORD = 'Demo1234';

const mockUser = {
  id: '1',
  login: MOCK_USERNAME,
  email: 'mock@demo.com',
  theme: 'light',
};

const mockApi = {
  async login(login, password) {
    await mockWait();

    if (login !== MOCK_USERNAME || password !== MOCK_PASSWORD) {
      const error = new Error('Identifiants invalides');
      error.response = { status: 401 };
      throw error;
    }

    const mockToken = 'mock-token-123';
    setToken(mockToken);
    return mockToken;
  },

  async validateMail(email, token) {
    await mockWait();
    return { status: 200, data: 'Email validé (mock)' };
  },

  async createUser(login, password, email) {
    await mockWait();
    return { status: 201, data: { message: 'Utilisateur créé (mock)' } };
  },

  async getUserInfo() {
    await mockWait();
    return { data: mockUser };
  },

  async updateUserInfo(payload) {
    await mockWait();
    Object.assign(mockUser, payload);
    return { data: mockUser };
  },

  async changePasswordByToken(userId, token, newPassword) {
    await mockWait();
    return { status: 200, data: 'Mot de passe changé (mock)' };
  },

  async sendResetPasswordEmail(email) {
    await mockWait();
    return { data: 'Email de réinitialisation envoyé (mock)' };
  },

  logout,
  getToken,
  setToken,
};

// ==================== REAL API MODE ====================
const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = token;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) clearToken();
    return Promise.reject(error);
  }
);

const realApi = {
  async login(login, password) {
    const { data } = await api.post('/user/login', { login, password });
    setToken(data);
    return data;
  },

  validateMail(email, token) {
    return api.get(`/user/validMail/${encodeURIComponent(email)}/${token}`);
  },

  createUser(login, password, email) {
    return api.post('/user/create', { login, password, email });
  },

  getUserInfo() {
    return api.get('/userInfo');
  },

  updateUserInfo(payload) {
    return api.put('/userInfo', payload);
  },

  changePasswordByToken(userId, token, newPassword) {
    return api.put('/user/changePassword', { userId, token, newPassword });
  },

  sendResetPasswordEmail(email) {
    return api.get(`/user/sendMailPassword/${encodeURIComponent(email)}`);
  },

  logout,
  getToken,
  setToken,
};

// ==================== EXPORT FINAL ====================
export default USE_MOCK ? mockApi : realApi;
