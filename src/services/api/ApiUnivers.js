import { api } from './ApiParent';

// ========== REAL API ==========

const realApi = {

  getUnivers: (params = {}) => api.get("/univers", { params }),
  createUnivers: (payload) => api.post('/univers', payload),
  editUnivers:(universId, payload) => api.put(`/univers/${universId}`, payload),
  deleteUnivers:(universId) => api.delete(`/univers/${universId}`),
  getTags: () => api.get('data/tags'),
  
};

const ApiUnivers = realApi;
export default ApiUnivers;