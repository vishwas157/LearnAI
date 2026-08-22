import api from './api';

export const searchService = {
  search: async (q, category = 'all') => {
    const res = await api.get('/search', { params: { q, category } });
    return res.data;
  },
};
