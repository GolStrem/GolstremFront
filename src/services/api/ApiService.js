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

  // recuperer l'user (image pseudo)
  getUser() {
    return api.get('/user');
  },

  // mettre a jour l'user ( image pseudo )
  updateUser(id,payload){
    return api.put(`/user/${id}`, payload )
  },

  getUserDetail() {
    return api.get('/user/detail')
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

  getModule(type, targetId) {
    return api.get(`/module/${type}/${targetId}`);
  },

  getAliasModule(payload) {
    return api.post(`/module/alias`, payload);
  },

  updateModule(id, payload) {
    return api.put(`/module/${id}`, payload);
  },

  createModule(type, targetId, name, extra = {}) {
    extra= JSON.stringify(extra)
    return api.post('/module', { type, targetId, name, extra });
  },

  deleteModule(id) {
    return api.delete(`/module/${id}`);
  },

  moveModule(idModule, newPos) {
    return api.patch('/module/move', {idModule, newPos})
  },

  getFriends() {
    return api.get('/user/friend');
  },

  logout,
  getToken,
  setToken,
};

const ApiService = USE_MOCK ? MockApiService : realApi;
export default ApiService;