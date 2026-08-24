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
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization Token to every outgoing request
api.interceptors.request.use(
  (config) => {
    let token = localStorage.getItem('learnai_token');

    // Fallback: If no token but user exists in localStorage, generate local demo token
    if (!token) {
      try {
        const savedUser = localStorage.getItem('learnai_user');
        if (savedUser) {
          const userObj = JSON.parse(savedUser);
          token = `local_${encodeURIComponent(JSON.stringify(userObj))}`;
          localStorage.setItem('learnai_token', token);
        }
      } catch (err) {
        // Ignore fallback serialization error
      }

    }

    if (token) {
      const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      config.headers.Authorization = authHeader;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor for graceful error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('[API 401] Unauthorized access response:', error.config?.url);
    }
    return Promise.reject(error);
  }
);

export default api;