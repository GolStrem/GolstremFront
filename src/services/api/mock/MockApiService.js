import { setToken, getToken, logout, mockWait } from '../ApiParent';

const MOCK_USERNAME = 'mockuser';
const MOCK_PASSWORD = 'Demo1234';

const mockUser = {
  id: '1',
  login: MOCK_USERNAME,
  email: 'mock@demo.com',
  theme: 'light',
};

const mockApiService = {
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

export default mockApiService