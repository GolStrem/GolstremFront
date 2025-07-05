import { USE_MOCK, api, setToken, getToken, logout } from './ApiParent';
import MockApiService from './mock/MockApiService';


// ========== REAL API ==========
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

const ApiService = USE_MOCK ? MockApiService : realApi;
export default ApiService;