import axios from 'axios';

const getBaseURL = () => {
  // Use environment variable if available
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // Local development
  if (import.meta.env.DEV) {
    return '/api';
  }

  // Production Render backend
  return 'https://learnai-backend-0vm4.onrender.com/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 20000,

  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;