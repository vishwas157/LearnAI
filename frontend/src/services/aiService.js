import api from './api';

export const aiService = {
  summarize: async (data) => {
    const res = await api.post('/ai/summarize', data);
    return res.data;
  },

  chat: async (data) => {
    const res = await api.post('/ai/chat', data);
    return res.data;
  },

  chatWithTutor: async (data) => {
    const res = await api.post('/ai/chat', data);
    return res.data;
  },

  explain: async (data) => {
    const res = await api.post('/ai/explain', data);
    return res.data;
  },

  generateQuiz: async (data) => {
    const res = await api.post('/ai/generate-quiz', data);
    return res.data;
  },

  getSessions: async () => {
    const res = await api.get('/ai/sessions');
    return res.data;
  },

  getChatSessions: async () => {
    const res = await api.get('/ai/sessions');
    return res.data;
  },

  getSessionById: async (id) => {
    const res = await api.get(`/ai/sessions/${id}`);
    return res.data;
  },

  deleteSession: async (id) => {
    const res = await api.delete(`/ai/sessions/${id}`);
    return res.data;
  },
};
