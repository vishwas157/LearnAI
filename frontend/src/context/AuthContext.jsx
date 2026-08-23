import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { useToast } from './ToastContext';
import i18n from '../locales/i18n';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('learnai_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('learnai_token'));
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  // Listen for global 401 unauth events from api interceptor
  useEffect(() => {
    const handleAuthLogout = () => {
      setUser(null);
      setToken(null);
    };
    window.addEventListener('learnai_auth_logout', handleAuthLogout);
    return () => window.removeEventListener('learnai_auth_logout', handleAuthLogout);
  }, []);

  // Verify auth on mount / token change
  useEffect(() => {
    const verifyAuth = async () => {
      if (token) {
        try {
          const res = await authService.getMe();
          if (res.success && res.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('learnai_user', JSON.stringify(res.data.user));
            if (res.data.user.preferredLanguage) {
              i18n.changeLanguage(res.data.user.preferredLanguage);
            }
          } else {
            logout();
          }
        } catch (err) {
          console.warn('Session expired or invalid:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    verifyAuth();
  }, [token]);

  const login = async ({ email, password }) => {
    try {
      const res = await authService.login({ email, password });
      if (res.success && res.data) {
        const { user: loggedInUser, token: authToken } = res.data;
        setUser(loggedInUser);
        setToken(authToken);
        localStorage.setItem('learnai_token', authToken);
        localStorage.setItem('learnai_user', JSON.stringify(loggedInUser));
        if (loggedInUser.preferredLanguage) {
          i18n.changeLanguage(loggedInUser.preferredLanguage);
        }
        toast.success(`Welcome back, ${loggedInUser.name}!`);
        return { success: true, data: res.data };
      }
      return { success: false, message: res.message || 'Login failed' };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Invalid email or password';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const register = async (userData) => {
    try {
      const res = await authService.register(userData);
      if (res.success && res.data) {
        const { user: loggedInUser, token: authToken } = res.data;
        if (loggedInUser && authToken) {
          setUser(loggedInUser);
          setToken(authToken);
          localStorage.setItem('learnai_token', authToken);
          localStorage.setItem('learnai_user', JSON.stringify(loggedInUser));
          if (loggedInUser.preferredLanguage) {
            i18n.changeLanguage(loggedInUser.preferredLanguage);
          }
        }
        toast.success('Account created successfully!');
        return { success: true, data: res.data };
      }
      return { success: false, message: res.message || 'Registration failed' };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const verifyEmail = async (tokenString) => {
    try {
      const res = await authService.verifyEmail(tokenString);
      return res;
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Invalid or expired verification link.',
      };
    }
  };

  const resendVerification = async (email) => {
    try {
      const res = await authService.resendVerification(email);
      if (res.success) {
        toast.success(res.message || `Verification link resent to ${email}`);
      }
      return res;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to resend verification email';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('learnai_token');
    localStorage.removeItem('learnai_user');
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await authService.updateProfile(profileData);
      if (res.success && res.data.user) {
        setUser(res.data.user);
        localStorage.setItem('learnai_user', JSON.stringify(res.data.user));
        if (res.data.user.preferredLanguage) {
          i18n.changeLanguage(res.data.user.preferredLanguage);
        }
        toast.success('Profile updated successfully!');
        return { success: true, user: res.data.user };
      }
      return { success: false, message: res.message };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        verifyEmail,
        resendVerification,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
