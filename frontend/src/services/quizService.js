import api from './api';

export const quizService = {
  getQuizzes: async (params = {}) => {
    const res = await api.get('/quiz', { params });
    return res.data;
  },

  getQuizById: async (id, mode = 'attempt') => {
    const res = await api.get(`/quiz/${id}`, { params: { mode } });
    return res.data;
  },

  createQuiz: async (quizData) => {
    const res = await api.post('/quiz', quizData);
    return res.data;
  },

  submitAttempt: async (id, attemptData) => {
    const res = await api.post(`/quiz/${id}/attempt`, attemptData);
    return res.data;
  },

  getAttempts: async () => {
    const res = await api.get('/quiz/attempts');
    return res.data;
  },

  getAttemptResultById: async (attemptId) => {
    const res = await api.get(`/quiz/attempts/${attemptId}`);
    return res.data;
  },

  deleteQuiz: async (id) => {
    const res = await api.delete(`/quiz/${id}`);
    return res.data;
  },
};
