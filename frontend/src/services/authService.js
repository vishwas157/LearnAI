import api from './api';

export const authService = {
  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    return res.data;
  },

  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },

  verifyEmail: async (token) => {
    const res = await api.get(`/auth/verify-email?token=${encodeURIComponent(token)}`);
    return res.data;
  },

  resendVerification: async (email) => {
    const res = await api.post('/auth/resend-verification', { email });
    return res.data;
  },

  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },

  updateProfile: async (profileData) => {
    const res = await api.put('/auth/profile', profileData);
    return res.data;
  },
};
