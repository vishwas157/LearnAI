import React, { createContext, useContext, useState } from 'react';
import { useToast } from './ToastContext';
import i18n from '../locales/i18n';

const AuthContext = createContext(null);

const USER_KEY = 'learnai_user';
const TOKEN_KEY = 'learnai_token';
const PASSWORD_KEY = 'learnai_password';

const buildLocalToken = (userObj) => {
  try {
    const payload = {
      id: userObj.id || userObj._id || 'local-demo-student',
      _id: userObj.id || userObj._id || 'local-demo-student',
      name: userObj.name || 'Demo Student',
      email: userObj.email || 'student@learnai.com',
      role: userObj.role || 'student',
      preferredLanguage: userObj.preferredLanguage || 'en',
      avatar: userObj.avatar || 'avatar-1',
      emailVerified: userObj.emailVerified !== false,
      studyStreak: userObj.studyStreak || 1,
    };
    return `local_${encodeURIComponent(JSON.stringify(payload))}`;
  } catch {
    return 'local_%7B%22id%22%3A%22local-demo-student%22%2C%22email%22%3A%22student%40learnai.com%22%7D';
  }
};


const getStoredUser = () => {
  try {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser);
  const [loading, setLoading] = useState(false);

  const toast = useToast();

  /*
  |--------------------------------------------------------------------------
  | LOGIN
  |--------------------------------------------------------------------------
  */

  const login = async ({ email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      const message = 'Please enter email and password';
      toast.error(message);

      return {
        success: false,
        message,
      };
    }

    // Demo accounts
    const demoAccounts = {
      'student@learnai.com': {
        password: 'password123',
        name: 'Demo Student',
        role: 'student',
      },

      'admin@learnai.com': {
        password: 'adminpassword123',
        name: 'LearnAI Admin',
        role: 'admin',
      },
    };

    // Check demo account
    if (demoAccounts[normalizedEmail]) {
      const account = demoAccounts[normalizedEmail];

      if (password !== account.password) {
        const message = 'Invalid email or password';
        toast.error(message);

        return {
          success: false,
          message,
        };
      }

      const loggedInUser = {
        id:
          normalizedEmail === 'admin@learnai.com'
            ? 'demo-admin-id'
            : 'demo-student-id',
        _id:
          normalizedEmail === 'admin@learnai.com'
            ? 'demo-admin-id'
            : 'demo-student-id',
        name: account.name,
        email: normalizedEmail,
        role: account.role,
        preferredLanguage: 'en',
        avatar: 'avatar-1',
        emailVerified: true,
        studyStreak: 1,
        createdAt: new Date().toISOString(),
      };

      const token = buildLocalToken(loggedInUser);

      localStorage.setItem(
        USER_KEY,
        JSON.stringify(loggedInUser)
      );

      localStorage.setItem(
        TOKEN_KEY,
        token
      );

      localStorage.setItem(
        PASSWORD_KEY,
        password
      );

      setUser(loggedInUser);

      i18n.changeLanguage('en');

      toast.success(`Welcome back, ${loggedInUser.name}!`);

      return {
        success: true,
        data: {
          user: loggedInUser,
          token,
        },
      };
    }

    // Check registered local account
    const storedUser = getStoredUser();
    const storedPassword =
      localStorage.getItem(PASSWORD_KEY);

    if (
      storedUser &&
      storedUser.email === normalizedEmail &&
      storedPassword === password
    ) {
      const token = buildLocalToken(storedUser);
      localStorage.setItem(TOKEN_KEY, token);

      setUser(storedUser);

      if (storedUser.preferredLanguage) {
        i18n.changeLanguage(
          storedUser.preferredLanguage
        );
      }

      toast.success(`Welcome back, ${storedUser.name}!`);

      return {
        success: true,
        data: {
          user: storedUser,
          token,
        },
      };
    }

    const message = 'Invalid email or password';
    toast.error(message);

    return {
      success: false,
      message,
    };
  };

  /*
  |--------------------------------------------------------------------------
  | REGISTER
  |--------------------------------------------------------------------------
  */

  const register = async (userData) => {
    const {
      name,
      email,
      password,
      confirmPassword,
      preferredLanguage,
      role,
    } = userData;

    if (!name || !email || !password) {
      return {
        success: false,
        message:
          'Please provide name, email and password',
      };
    }

    if (password !== confirmPassword) {
      return {
        success: false,
        message: 'Passwords do not match',
      };
    }

    if (password.length < 6) {
      return {
        success: false,
        message:
          'Password must be at least 6 characters long',
      };
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const existingUser = getStoredUser();

    if (
      existingUser &&
      existingUser.email === normalizedEmail
    ) {
      return {
        success: false,
        message:
          'An account with this email already exists',
      };
    }

    const newUser = {
      id: `user-${Date.now()}`,
      _id: `user-${Date.now()}`,
      name: name.trim(),
      email: normalizedEmail,
      role: role === 'admin' ? 'admin' : 'student',
      preferredLanguage:
        ['en', 'hi', 'gu'].includes(
          preferredLanguage
        )
          ? preferredLanguage
          : 'en',
      avatar: 'avatar-1',
      emailVerified: true,
      studyStreak: 1,
      createdAt: new Date().toISOString(),
    };

    const token = buildLocalToken(newUser);

    localStorage.setItem(
      USER_KEY,
      JSON.stringify(newUser)
    );

    localStorage.setItem(
      TOKEN_KEY,
      token
    );

    localStorage.setItem(
      PASSWORD_KEY,
      password
    );

    setUser(newUser);

    i18n.changeLanguage(
      newUser.preferredLanguage
    );

    toast.success(
      'Account created successfully!'
    );

    return {
      success: true,
      data: {
        user: newUser,
        token,
      },
    };
  };

  /*
  |--------------------------------------------------------------------------
  | LOGOUT
  |--------------------------------------------------------------------------
  */

  const logout = () => {
    setUser(null);

    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(PASSWORD_KEY);

    toast.success('Logged out successfully');
  };

  /*
  |--------------------------------------------------------------------------
  | UPDATE PROFILE
  |--------------------------------------------------------------------------
  */

  const updateProfile = async (profileData) => {
    if (!user) {
      return {
        success: false,
        message: 'Please login first',
      };
    }

    const updatedUser = {
      ...user,
      name:
        profileData.name?.trim() || user.name,
      preferredLanguage:
        profileData.preferredLanguage ||
        user.preferredLanguage,
    };

    // Update password if requested
    if (profileData.newPassword) {
      const currentPassword =
        localStorage.getItem(PASSWORD_KEY);

      if (
        profileData.currentPassword !==
        currentPassword
      ) {
        const message =
          'Current password is incorrect';

        toast.error(message);

        return {
          success: false,
          message,
        };
      }

      if (
        profileData.newPassword.length < 6
      ) {
        const message =
          'New password must be at least 6 characters long';

        toast.error(message);

        return {
          success: false,
          message,
        };
      }

      localStorage.setItem(
        PASSWORD_KEY,
        profileData.newPassword
      );
    }

    const token = buildLocalToken(updatedUser);

    localStorage.setItem(
      USER_KEY,
      JSON.stringify(updatedUser)
    );

    localStorage.setItem(
      TOKEN_KEY,
      token
    );

    setUser(updatedUser);

    if (updatedUser.preferredLanguage) {
      i18n.changeLanguage(
        updatedUser.preferredLanguage
      );
    }

    toast.success(
      'Profile updated successfully!'
    );

    return {
      success: true,
      user: updatedUser,
      data: {
        user: updatedUser,
        token,
      },
    };
  };

  /*
  |--------------------------------------------------------------------------
  | EMAIL VERIFICATION
  |--------------------------------------------------------------------------
  */

  const verifyEmail = async () => {
    return {
      success: true,
      message:
        'Email verification is not required.',
    };
  };

  /*
  |--------------------------------------------------------------------------
  | RESEND VERIFICATION
  |--------------------------------------------------------------------------
  */

  const resendVerification = async () => {
    return {
      success: true,
      message:
        'Email verification is not required.',
    };
  };

  const currentToken = user ? (localStorage.getItem(TOKEN_KEY) || buildLocalToken(user)) : null;

  return (
    <AuthContext.Provider
      value={{
        user,
        token: currentToken,
        loading,

        isAuthenticated: !!user,

        isAdmin: user?.role === 'admin',

        login,
        register,
        logout,
        updateProfile,

        verifyEmail,
        resendVerification,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used within an AuthProvider'
    );
  }

  return context;
};