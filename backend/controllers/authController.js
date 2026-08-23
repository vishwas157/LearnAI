const crypto = require('crypto');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');
const { isDisposableEmail } = require('../utils/disposableEmailBlocklist');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// Helper to generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'learnai_jwt_secret', {
    expiresIn: '30d',
  });
};

/**
 * @desc    Register a new user (Direct registration - No email verification required)
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res) => {
  const { name, email, password, confirmPassword, preferredLanguage, role } = req.body;

  if (!name || !email || !password) {
    return errorResponse(res, 'Please provide all required fields: name, email, and password', 400);
  }

  if (confirmPassword && password !== confirmPassword) {
    return errorResponse(res, 'Passwords do not match', 400);
  }

  if (password.length < 6) {
    return errorResponse(res, 'Password must be at least 6 characters long', 400);
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Validate syntax
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/;
  if (!emailRegex.test(normalizedEmail)) {
    return errorResponse(res, 'Please provide a valid academic or personal email address', 400);
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    return errorResponse(res, 'An account with this email already exists', 400);
  }

  // Create new user directly in verified state
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password,
    preferredLanguage: ['en', 'hi', 'gu'].includes(preferredLanguage) ? preferredLanguage : 'en',
    role: ['student', 'teacher', 'admin'].includes(role) ? role : 'student',
    avatar: 'avatar-1',
    emailVerified: true,
    studyStreak: 1,
    lastActiveDate: new Date(),
  });

  const token = generateToken(user._id);

  return successResponse(res, {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      preferredLanguage: user.preferredLanguage,
      avatar: user.avatar,
      emailVerified: true,
      studyStreak: user.studyStreak,
      createdAt: user.createdAt,
    },
    token,
  }, 'Registration successful! Account created.', 201);
};

/**
 * @desc    Verify email address (Stub for backward compatibility)
 * @route   GET /api/auth/verify-email
 * @access  Public
 */
const verifyEmail = async (req, res) => {
  return successResponse(res, {
    emailVerified: true,
  }, 'Your account is active. You can sign in directly.');
};

/**
 * @desc    Resend email verification link (Stub for backward compatibility)
 * @route   POST /api/auth/resend-verification
 * @access  Public
 */
const resendVerification = async (req, res) => {
  return successResponse(res, {}, 'Email verification is not required. You can sign in directly.');
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return errorResponse(res, 'Please provide both email and password', 400);
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Check for user
  const user = await User.findOne({ email: normalizedEmail }).select('+password');
  if (!user) {
    return errorResponse(res, 'Invalid email or password', 401);
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return errorResponse(res, 'Invalid email or password', 401);
  }

  // Ensure emailVerified is true
  if (!user.emailVerified) {
    user.emailVerified = true;
  }

  // Update streak if active on a new calendar day
  const today = new Date();
  const lastActive = new Date(user.lastActiveDate || today);
  const diffTime = Math.abs(today - lastActive);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    user.studyStreak += 1;
  } else if (diffDays > 1) {
    user.studyStreak = 1;
  }
  user.lastActiveDate = today;
  await user.save({ validateBeforeSave: false });

  const token = generateToken(user._id);

  return successResponse(res, {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      preferredLanguage: user.preferredLanguage,
      avatar: user.avatar,
      emailVerified: true,
      studyStreak: user.studyStreak,
      createdAt: user.createdAt,
    },
    token,
  }, 'Login successful');
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return errorResponse(res, 'User not found', 404);
  }

  return successResponse(res, {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      preferredLanguage: user.preferredLanguage,
      avatar: user.avatar,
      emailVerified: user.emailVerified,
      studyStreak: user.studyStreak,
      createdAt: user.createdAt,
    }
  });
};

/**
 * @desc    Update user profile & settings
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = async (req, res) => {
  const user = await User.findById(req.user._id).select('+password');
  if (!user) {
    return errorResponse(res, 'User not found', 404);
  }

  const { name, preferredLanguage, avatar, currentPassword, newPassword } = req.body;

  if (name) user.name = name;
  if (preferredLanguage) user.preferredLanguage = preferredLanguage;
  if (avatar) user.avatar = avatar;

  if (newPassword) {
    if (!currentPassword) {
      return errorResponse(res, 'Please provide your current password to update password', 400);
    }
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return errorResponse(res, 'Current password is incorrect', 400);
    }
    user.password = newPassword;
  }

  await user.save();

  return successResponse(res, {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      preferredLanguage: user.preferredLanguage,
      avatar: user.avatar,
      emailVerified: user.emailVerified,
      studyStreak: user.studyStreak,
      createdAt: user.createdAt,
    }
  }, 'Profile updated successfully');
};

module.exports = {
  register,
  verifyEmail,
  resendVerification,
  login,
  getMe,
  updateProfile,
};
