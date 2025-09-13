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
  getResumeUnivers: (universId) => api.get(`/univers/${universId}`, {params:{resume:1}}),


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

  createModelFiche: (universId, payload) => api.post (`univers/${universId}/administration/modelFiche`, payload),
  getListModelFiche: (universId, params ) => api.get (`univers/${universId}/administration/modelFiche`, { params }),
  editModelFiche: (universId, idModel, payload ) => api.put (`/univers/${universId}/administration/modelFiche/${idModel}`, payload),
  deleteModelFiche: (universId, idModel) => api.delete (`/univers/${universId}/administration/modelFiche/${idModel}`),

  createRuleFiche: (universId, idModel, payload) => api.post (`univers/${universId}/administration/modelFiche/${idModel}/ruleFiche`, payload),
  getListRuleFiche: (universId, idModel ) => api.get (`univers/${universId}/administration/modelFiche/${idModel}/ruleFiche`),
  editRuleFiche: (universId, idModel, idRule, payload ) => api.put (`/univers/${universId}/administration/modelFiche/${idModel}/ruleFiche/${idRule}`, payload),
  deleteRuleFiche: (universId, idModel, idRule ) => api.delete (`/univers/${universId}/administration/modelFiche/${idModel}/ruleFiche/${idRule}`),

  subscribeFiche: (idFiche, payload) => api.post (`fiche/${idFiche}/univers`, payload),
  getSubscribeFiche: (universId) => api.get (`univers/${universId}/subscribe`),
  verifRuleFiche: (ficheId, params) => api.get (`fiche/${ficheId}/univers/`, { params }),

  AcceptSubscribeFiche: (universId, subscribeId, payload) => api.put (`univers/${universId}/subscribe/${subscribeId}`, payload),
  deleteSubscribeFiche: (universId, subscribeId) => api.delete (`univers/${universId}/subscribe/${subscribeId}`),

  deleteFicheUnivers: (idFiche) => api.delete (`fiche/${idFiche}/univers`),


};

const ApiUnivers = realApi;
export default ApiUnivers;