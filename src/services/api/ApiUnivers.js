import { api } from './ApiParent';

// ========== REAL API ==========

const realApi = {

  getUnivers: (params = {}) => api.get("/univers", { params }),
  createUnivers: (payload) => api.post('/univers', payload),
  editUnivers:(universId, payload) => api.put(`/univers/${universId}`, payload),
  deleteUnivers:(universId) => api.delete(`/univers/${universId}`),
  getTags: () => api.get('data/tags'),
  addStar: (universId) =>api.post(`/univers/${universId}/star`),
  removeStar: (universId) => api.delete(`/univers/${universId}/star`),
  getDetailUnivers: (universId) => api.get(`/univers/${universId}`),

  getFolderGallerie:(universId) => api.get (`univers/${universId}/gallery`),
  getImageGallerieByFolder: (universId, folder) => api.get (`univers/${universId}/gallery/${folder}`),
  createImageGallerie: (universId, payload) => api.post(`univers/${universId}/gallery`, payload),
  massCreateImageGallerie:(universId, payload) => api.post(`univers/${universId}/gallery/massif`, payload),
  editImageGallerie: (universId, payload) => api.put(`univers/${universId}/gallery/${idImage}`, payload),
  deleteImageGallerie: (universId, idImage) => api.delete(`univers/${universId}/gallery/${idImage}`),
  deleteImageGallerieByFolder: (universId, nameFolder) => api.delete(`univers/${universId}/gallery/folder/${nameFolder}`),
  deleteImageGallerieByFolder: (universId, nameFolder) => api.delete(`univers/${universId}/gallery/folder/${nameFolder}`),
  massDeleteImageGallerie: (universId, payload) => api.post(`univers/${universId}/gallery/delete`, payload),
  
  getInscriptionUnivers: (universId, params) => api.get (`/univers/${universId}/user`,{ params }),
  putInscriptionUnivers: (universId, userId, payload ) => api.put (`/univers/${universId}/user/${userId}`, payload),
  deleteInscriptionUnivers: (universId, userId) => api.delete (`/univers/${universId}/user/${userId}`),
  postInscriptionUnivers: (universId) => api.post (`/univers/${universId}/user`),
};

const ApiUnivers = realApi;
export default ApiUnivers;