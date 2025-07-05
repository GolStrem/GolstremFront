// taskApi.js
import { USE_MOCK, api } from './ApiParent';
import MockTaskApi from './mock/MockTaskApi';


// ========== REAL API ==========
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
  moveTableau: (workspaceId, data) => api.patch(`/workSpace/${workspaceId}/move/tableau`, data),
};

const taskApi = USE_MOCK ? MockTaskApi : realApi;
export default taskApi;