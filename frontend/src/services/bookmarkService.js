import api from './api';

export const bookmarkService = {
  getBookmarks: async (params = {}) => {
    const res = await api.get('/bookmarks', { params });
    return res.data;
  },

  createBookmark: async (bookmarkData) => {
    const res = await api.post('/bookmarks', bookmarkData);
    return res.data;
  },

  deleteBookmark: async (id) => {
    const res = await api.delete(`/bookmarks/${id}`);
    return res.data;
  },
};
