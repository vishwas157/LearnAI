import api from './api';

export const analyticsService = {
  getAnalytics: async () => {
    const res = await api.get('/analytics');
    return res.data;
  },
};
