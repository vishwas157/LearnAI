export const authService = {
  register: async (userData) => {
    return {
      success: true,
      data: {
        user: userData,
      },
    };
  },

  login: async ({ email }) => {
    return {
      success: true,
      data: {
        user: {
          email,
        },
      },
    };
  },

  verifyEmail: async () => {
    return {
      success: true,
      message:
        'Email verification is not required.',
    };
  },

  resendVerification: async () => {
    return {
      success: true,
      message:
        'Email verification is not required.',
    };
  },

  getMe: async () => {
    return {
      success: false,
      message:
        'Local authentication is being used.',
    };
  },

  updateProfile: async (profileData) => {
    return {
      success: true,
      data: {
        user: profileData,
      },
    };
  },
};