import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';
import { useToast } from './ToastContext';
import i18n from '../locales/i18n';

const AuthContext = createContext(null);

const USERS_KEY = 'learnai_users';
const CURRENT_USER_KEY = 'learnai_user';
const TOKEN_KEY = 'learnai_token';

// Generate a simple local session token
const createLocalToken = (email) => {
  return `learnai_${btoa(email)}_${Date.now()}`;
};

// Get saved users
const getUsers = () => {
  try {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : [];
  } catch {
    return [];
  }
};

// Save users
const saveUsers = (users) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(CURRENT_USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() =>
    localStorage.getItem(TOKEN_KEY)
  );

  const [loading, setLoading] = useState(false);

  const toast = useToast();

  // =========================================
  // GLOBAL LOGOUT EVENT
  // =========================================

  useEffect(() => {
    const handleAuthLogout = () => {
      setUser(null);
      setToken(null);

      localStorage.removeItem(CURRENT_USER_KEY);
      localStorage.removeItem(TOKEN_KEY);
    };

    window.addEventListener(
      'learnai_auth_logout',
      handleAuthLogout
    );

    return () => {
      window.removeEventListener(
        'learnai_auth_logout',
        handleAuthLogout
      );
    };
  }, []);

  // =========================================
  // APPLY USER LANGUAGE
  // =========================================

  useEffect(() => {
    if (user?.preferredLanguage) {
      i18n.changeLanguage(user.preferredLanguage);
    }
  }, [user]);

  // =========================================
  // REGISTER
  // =========================================

  const register = async (userData) => {
    try {
      const {
        name,
        email,
        password,
        confirmPassword,
        preferredLanguage = 'en',
        role = 'student',
      } = userData;

      // Validation
      if (!name || !email || !password) {
        const message =
          'Please fill in all required fields.';

        toast.error(message);

        return {
          success: false,
          message,
        };
      }

      if (password !== confirmPassword) {
        const message = 'Passwords do not match';

        toast.error(message);

        return {
          success: false,
          message,
        };
      }

      if (password.length < 6) {
        const message =
          'Password must be at least 6 characters long';

        toast.error(message);

        return {
          success: false,
          message,
        };
      }

      const normalizedEmail = email
        .trim()
        .toLowerCase();

      // Email validation
      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(normalizedEmail)) {
        const message =
          'Please enter a valid email address';

        toast.error(message);

        return {
          success: false,
          message,
        };
      }

      // Get existing users
      const users = getUsers();

      // Check duplicate email
      const existingUser = users.find(
        (u) => u.email === normalizedEmail
      );

      if (existingUser) {
        const message =
          'An account with this email already exists';

        toast.error(message);

        return {
          success: false,
          message,
        };
      }

      // Create user
      const newUser = {
        id: `user_${Date.now()}`,
        name: name.trim(),
        email: normalizedEmail,
        password,
        role:
          role === 'admin'
            ? 'admin'
            : 'student',
        preferredLanguage: [
          'en',
          'hi',
          'gu',
        ].includes(preferredLanguage)
          ? preferredLanguage
          : 'en',
        avatar: 'avatar-1',
        emailVerified: true,
        studyStreak: 1,
        lastActiveDate:
          new Date().toISOString(),
        createdAt:
          new Date().toISOString(),
      };

      // Save user
      users.push(newUser);
      saveUsers(users);

      toast.success(
        'Account created successfully!'
      );

      return {
        success: true,
        data: {
          user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            preferredLanguage:
              newUser.preferredLanguage,
            avatar: newUser.avatar,
            emailVerified: true,
            studyStreak:
              newUser.studyStreak,
            createdAt:
              newUser.createdAt,
          },
        },
      };
    } catch (error) {
      console.error(
        'Registration error:',
        error
      );

      const message =
        'Registration failed. Please try again.';

      toast.error(message);

      return {
        success: false,
        message,
      };
    }
  };

  // =========================================
  // LOGIN
  // =========================================

  const login = async ({ email, password }) => {
    try {
      if (!email || !password) {
        const message =
          'Please provide both email and password';

        toast.error(message);

        return {
          success: false,
          message,
        };
      }

      const normalizedEmail = email
        .trim()
        .toLowerCase();

      const users = getUsers();

      const existingUser = users.find(
        (u) => u.email === normalizedEmail
      );

      if (!existingUser) {
        const message =
          'No account found with this email';

        toast.error(message);

        return {
          success: false,
          message,
        };
      }

      // Check password
      if (existingUser.password !== password) {
        const message =
          'Invalid email or password';

        toast.error(message);

        return {
          success: false,
          message,
        };
      }

      // Update study streak
      const today = new Date();
      const lastActive = existingUser.lastActiveDate
        ? new Date(existingUser.lastActiveDate)
        : today;

      const todayDate =
        today.toDateString();

      const lastDate =
        lastActive.toDateString();

      if (todayDate !== lastDate) {
        const diffTime =
          today.getTime() -
          lastActive.getTime();

        const diffDays = Math.floor(
          diffTime /
          (1000 * 60 * 60 * 24)
        );

        if (diffDays === 1) {
          existingUser.studyStreak =
            (existingUser.studyStreak || 1) + 1;
        } else {
          existingUser.studyStreak = 1;
        }

        existingUser.lastActiveDate =
          today.toISOString();
      }

      // Update stored user
      const updatedUsers = users.map(
        (u) =>
          u.email === normalizedEmail
            ? existingUser
            : u
      );

      saveUsers(updatedUsers);

      // Remove password from session user
      const loggedInUser = {
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role,
        preferredLanguage:
          existingUser.preferredLanguage,
        avatar: existingUser.avatar,
        emailVerified: true,
        studyStreak:
          existingUser.studyStreak,
        createdAt:
          existingUser.createdAt,
      };

      const authToken =
        createLocalToken(normalizedEmail);

      setUser(loggedInUser);
      setToken(authToken);

      localStorage.setItem(
        CURRENT_USER_KEY,
        JSON.stringify(loggedInUser)
      );

      localStorage.setItem(
        TOKEN_KEY,
        authToken
      );

      if (loggedInUser.preferredLanguage) {
        i18n.changeLanguage(
          loggedInUser.preferredLanguage
        );
      }

      toast.success(
        `Welcome back, ${loggedInUser.name}!`
      );

      return {
        success: true,
        data: {
          user: loggedInUser,
          token: authToken,
        },
      };
    } catch (error) {
      console.error(
        'Login error:',
        error
      );

      const message =
        'Login failed. Please try again.';

      toast.error(message);

      return {
        success: false,
        message,
      };
    }
  };

  // =========================================
  // LOGOUT
  // =========================================

  const logout = () => {
    setUser(null);
    setToken(null);

    localStorage.removeItem(
      CURRENT_USER_KEY
    );

    localStorage.removeItem(
      TOKEN_KEY
    );

    toast.success(
      'Logged out successfully'
    );
  };

  // =========================================
  // VERIFY EMAIL
  // Kept for compatibility
  // =========================================

  const verifyEmail = async () => {
    return {
      success: true,
      data: {
        emailVerified: true,
      },
      message:
        'Email verification is not required.',
    };
  };

  // =========================================
  // RESEND VERIFICATION
  // Kept for compatibility
  // =========================================

  const resendVerification = async () => {
    return {
      success: true,
      message:
        'Email verification is not required.',
    };
  };

  // =========================================
  // UPDATE PROFILE
  // =========================================

  const updateProfile = async (
    profileData
  ) => {
    try {
      if (!user) {
        return {
          success: false,
          message: 'Please sign in first.',
        };
      }

      const users = getUsers();

      const userIndex = users.findIndex(
        (u) => u.id === user.id
      );

      if (userIndex === -1) {
        return {
          success: false,
          message: 'User account not found.',
        };
      }

      const currentUser =
        users[userIndex];

      // Update name
      if (profileData.name) {
        currentUser.name =
          profileData.name.trim();
      }

      // Update language
      if (
        profileData.preferredLanguage
      ) {
        currentUser.preferredLanguage =
          profileData.preferredLanguage;
      }

      // Update avatar
      if (profileData.avatar) {
        currentUser.avatar =
          profileData.avatar;
      }

      // Update password
      if (profileData.newPassword) {
        if (
          currentUser.password !==
          profileData.currentPassword
        ) {
          const message =
            'Current password is incorrect';

          toast.error(message);

          return {
            success: false,
            message,
          };
        }

        currentUser.password =
          profileData.newPassword;
      }

      users[userIndex] =
        currentUser;

      saveUsers(users);

      const updatedUser = {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        role: currentUser.role,
        preferredLanguage:
          currentUser.preferredLanguage,
        avatar: currentUser.avatar,
        emailVerified: true,
        studyStreak:
          currentUser.studyStreak,
        createdAt:
          currentUser.createdAt,
      };

      setUser(updatedUser);

      localStorage.setItem(
        CURRENT_USER_KEY,
        JSON.stringify(updatedUser)
      );

      if (
        updatedUser.preferredLanguage
      ) {
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
      };
    } catch (error) {
      console.error(
        'Profile update error:',
        error
      );

      const message =
        'Failed to update profile';

      toast.error(message);

      return {
        success: false,
        message,
      };
    }
  };

  // =========================================
  // AUTH CONTEXT
  // =========================================

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,

        isAuthenticated:
          !!token && !!user,

        isAdmin:
          user?.role === 'admin',

        login,
        register,
        logout,

        verifyEmail,
        resendVerification,

        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// =========================================
// useAuth Hook
// =========================================

export const useAuth = () => {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used within an AuthProvider'
    );
  }

  return context;
};