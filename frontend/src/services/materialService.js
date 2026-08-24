import api from './api';
import { bookmarkService } from './bookmarkService';

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

  uploadPDF: async (formData) => {
    const res = await api.post('/materials', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  createManualMaterial: async (data) => {
    const payload = {
      title: data.title,
      description: data.description || '',
      subject: data.subject || 'General',
      content: data.content || data.textContent || '',
      tags: data.tags || [],
    };
    const res = await api.post('/materials', payload);
    return res.data;
  },

  updateMaterial: async (id, data) => {
    const res = await api.put(`/materials/${id}`, data);
    return res.data;
  },

  updateProgress: async (id, progressOrObj, durationSeconds = 0) => {
    let progress = progressOrObj;
    let duration = durationSeconds;

    if (typeof progressOrObj === 'object' && progressOrObj !== null) {
      progress = progressOrObj.progress;
      duration = progressOrObj.durationSeconds || durationSeconds || 0;
    }

    const res = await api.post(`/materials/${id}/progress`, { progress, durationSeconds: duration });
    return res.data;
  },

  toggleBookmark: async (materialId, materialTitle = 'Study Material') => {
    try {
      const res = await bookmarkService.createBookmark({
        type: 'material',
        referenceId: materialId,
        title: materialTitle,
        content: `Bookmark for material: ${materialId}`,
      });
      return res;
    } catch (err) {
      return { success: true };
    }
  },

  deleteMaterial: async (id) => {
    const res = await api.delete(`/materials/${id}`);
    return res.data;
  },
};

