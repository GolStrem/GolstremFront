// taskApi.js
import { api } from './ApiParent';

// ========== REAL API ==========
const realApi = {
  createFiche: (payload) => api.post('/fiche', payload),
  editFiche:(ficheId, payload) => api.put(`/fiche/${ficheId}`, payload),
  moveFiche:(ficheId, payload) => api.patch(`/fiche/move/${ficheId}`, payload),
  getFiches: (type, targetId) => api.get(`/fiche/${type}/${targetId}`),
  deleteFiche:(ficheId) => api.delete(`/fiche/${ficheId}`),
  
};

const ApiFiche = realApi;
export default ApiFiche;