import { api } from './ApiParent';

// ========== REAL API ==========
const realApi = {

  getUnivers: (params = {}) => api.get("/univers", { params, paramsSerializer: { indexes: null } }),
  createUnivers: (payload) => api.post('/univers', payload),
  editUnivers:(universId, payload) => api.put(`/univers/${universId}`, payload),
  deleteUnivers:(universId) => api.delete(`/univers/${universId}`),
  
};

const ApiUnivers = realApi;
export default ApiUnivers;