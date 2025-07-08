import { USE_MOCK, api, setToken, getToken, logout } from './ApiParent';
import MockApiService from './mock/MockApiService';


// ========== REAL API ==========
const realApi = {
  async login(email, password) {
    const { data } = await api.post('/user/login', { email, password });
    setToken(data);
    return data;
  },

  validateMail(email, token) {
    return api.get(`/user/validMail/${encodeURIComponent(email)}/${token}`);
  },

  createUser(pseudo, password, email) {
    return api.post('/user/create', { pseudo, password, email });
  },

  getUser() {
    return api.get('/user');
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

  getUserByPseudo(pseudo) {
     return api.get(`/user/${encodeURIComponent(pseudo)}`);
  },

  logout,
  getToken,
  setToken,
};

const ApiService = USE_MOCK ? MockApiService : realApi;
export default ApiService;