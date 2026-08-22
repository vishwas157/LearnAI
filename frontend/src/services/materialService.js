import api from './api';

export const materialService = {
  getMaterials: async (params = {}) => {
    const res = await api.get('/materials', { params });
    return res.data;
  },

  getMaterialById: async (id) => {
    const res = await api.get(`/materials/${id}`);
    return res.data;
  },

  createMaterial: async (formDataOrData) => {
    const isFormData = formDataOrData instanceof FormData;
    const res = await api.post('/materials', formDataOrData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return res.data;
  },

  updateMaterial: async (id, data) => {
    const res = await api.put(`/materials/${id}`, data);
    return res.data;
  },

  updateProgress: async (id, progress, durationSeconds = 0) => {
    const res = await api.post(`/materials/${id}/progress`, { progress, durationSeconds });
    return res.data;
  },

  deleteMaterial: async (id) => {
    const res = await api.delete(`/materials/${id}`);
    return res.data;
  },
};
