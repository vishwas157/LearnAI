import axios from 'axios';

const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // In development, use relative '/api' proxy to connect to local server on port 5000
  if (import.meta.env.DEV) {
    return '/api';
  }
  // Default to deployed Render backend URL for production
  return 'https://learnai-backend-0vm4.onrender.com/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to attach Authorization JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('learnai_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept responses for global 401 unauth handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (
        !window.location.pathname.startsWith('/login') &&
        !window.location.pathname.startsWith('/register') &&
        window.location.pathname !== '/'
      ) {
        localStorage.removeItem('learnai_token');
        localStorage.removeItem('learnai_user');
        window.dispatchEvent(new Event('learnai_auth_logout'));
      }
    }

    return Promise.reject(error);
  }
);

export default api;