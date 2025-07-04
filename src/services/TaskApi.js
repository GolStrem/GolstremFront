import axios from 'axios';

// ==================== CONFIG ====================
const USE_MOCK = process.env.REACT_APP_USE_MOCK === 'true';
const API_BASE_URL = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:3000/';

// ==================== MOCK MODE ====================
const mockWait = (ms = 500) => new Promise((res) => setTimeout(res, ms));

const mockWorkspaces = [
  { id: '1', name: 'Mock Workspace 1' },
  { id: '2', name: 'Mock Workspace 2' },
];

const mockBoards = [
  { id: '1', workspaceId: '1', name: 'Mock Board 1' },
  { id: '2', workspaceId: '1', name: 'Mock Board 2' },
];

const mockCards = [
  { id: '1', boardId: '1', title: 'Mock Card 1', description: '' },
  { id: '2', boardId: '1', title: 'Mock Card 2', description: '' },
];

const mockApi = {
  async getWorkspaces() {
    await mockWait();
    return { data: mockWorkspaces };
  },

  async getWorkspaceDetail(workspaceId) {
    await mockWait();
    const workspace = mockWorkspaces.find((w) => w.id === workspaceId);
    return { data: workspace };
  },

  async createWorkspace(data) {
    await mockWait();
    const newWs = { id: Date.now().toString(), ...data };
    mockWorkspaces.push(newWs);
    return { data: newWs };
  },

  async updateWorkspace(workspaceId, data) {
    await mockWait();
    const ws = mockWorkspaces.find((w) => w.id === workspaceId);
    Object.assign(ws, data);
    return { data: ws };
  },

  async deleteWorkspace(workspaceId) {
    await mockWait();
    const index = mockWorkspaces.findIndex((w) => w.id === workspaceId);
    if (index >= 0) mockWorkspaces.splice(index, 1);
    return { data: { id: workspaceId } };
  },

  async createTableau(data) {
    await mockWait();
    const newBoard = { id: Date.now().toString(), ...data };
    mockBoards.push(newBoard);
    return { data: newBoard };
  },

  async editTableau(tableauId, data) {
    await mockWait();
    const board = mockBoards.find((b) => b.id === tableauId);
    Object.assign(board, data);
    return { data: board };
  },

  async deleteTableau(tableauId) {
    await mockWait();
    const index = mockBoards.findIndex((b) => b.id === tableauId);
    if (index >= 0) mockBoards.splice(index, 1);
    return { data: { id: tableauId } };
  },

  async createCard(data) {
    await mockWait();
    const newCard = { id: Date.now().toString(), ...data };
    mockCards.push(newCard);
    return { data: newCard };
  },

  async editCard(cardId, data) {
    await mockWait();
    const card = mockCards.find((c) => c.id === cardId);
    Object.assign(card, data);
    return { data: card };
  },

  async deleteCard(cardId) {
    await mockWait();
    const index = mockCards.findIndex((c) => c.id === cardId);
    if (index >= 0) mockCards.splice(index, 1);
    return { data: { id: cardId } };
  },

  async readCard(cardId) {
    await mockWait();
    const card = mockCards.find((c) => c.id === cardId);
    return { data: card };
  },

  async moveCard(data) {
    await mockWait();
    return { data };
  },

  async moveTableau(data) {
    await mockWait();
    return { data };
  },
};

// ==================== REAL API ====================
const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = token; // ou `Bearer ${token}` selon ton API
  }
  return config;
});

const realApi = {
  getWorkspaces: () => api.get('/workSpace'),
  getWorkspaceDetail: (workspaceId) => api.get(`/workSpace/${workspaceId}`),
  createWorkspace: (data) => api.post('/workSpace', data),
  updateWorkspace: (workspaceId, data) => api.put(`/workSpace/${workspaceId}`, data),
  deleteWorkspace: (workspaceId) => api.delete(`/workSpace/${workspaceId}`),

  createTableau: (workspaceId, data) => api.post(`/workSpace/${workspaceId}/tableau`, data),
  editTableau: (workspaceId, tableauId, data) => api.put(`/workSpace/${workspaceId}/tableau/${tableauId}`, data),
  deleteTableau: (workspaceId, tableauId) => api.delete(`/workSpace/${workspaceId}/tableau/${tableauId}`),

  createCard: (workspaceId, tableauId, data) => api.post(`/workSpace/${workspaceId}/tableau/${tableauId}/card`, data),
  editCard: (workspaceId, tableauId, cardId, data) => api.put(`/workSpace/${workspaceId}/tableau/${tableauId}/card/${cardId}`, data),
  deleteCard: (workspaceId, tableauId, cardId) => api.delete(`/workSpace/${workspaceId}/tableau/${tableauId}/card/${cardId}`),
  readCard: (workspaceId, tableauId, cardId) => api.get(`/workSpace/${workspaceId}/tableau/${tableauId}/card/${cardId}`),

  moveCard: (workspaceId, data) => api.patch(`/workSpace/${workspaceId}/move/card`, data),
  moveTableau: (workspaceId, data) => api.patch(`/workSpace/${workspaceId}/move/tableau`, data), // à vérifier si endpoint correct
};

// ==================== EXPORT ====================
export default USE_MOCK ? mockApi : realApi;