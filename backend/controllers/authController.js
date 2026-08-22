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
 * @desc    Register a new user (Requires real email verification)
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

  // Block disposable temporary email domains
  if (isDisposableEmail(normalizedEmail)) {
    return errorResponse(res, 'Disposable / temporary email addresses are not permitted. Please use your academic or personal email.', 400);
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    if (!existingUser.emailVerified) {
      return errorResponse(res, 'An unverified account with this email already exists. Please check your inbox or request a new verification link.', 400);
    }
    return errorResponse(res, 'An account with this email already exists', 400);
  }

  // Generate cryptographically secure random verification token
  const rawVerificationToken = crypto.randomBytes(32).toString('hex');
  const verificationTokenHash = crypto
    .createHash('sha256')
    .update(rawVerificationToken)
    .digest('hex');
  const verificationTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // Create new user in unverified state
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password,
    preferredLanguage: ['en', 'hi', 'gu'].includes(preferredLanguage) ? preferredLanguage : 'en',
    role: role === 'admin' ? 'admin' : 'student',
    avatar: 'avatar-1',
    emailVerified: false,
    verificationTokenHash,
    verificationTokenExpires,
    studyStreak: 1,
    lastActiveDate: new Date(),
  });

  // Construct dynamic frontend verification URL
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const verificationUrl = `${clientUrl}/verify-email?token=${rawVerificationToken}`;

  // Send branded verification email
  try {
    await sendVerificationEmail({
      to: user.email,
      name: user.name,
      verificationUrl,
    });
  } catch (emailErr) {
    console.error('[LearnAI Auth] Failed to dispatch verification email:', emailErr.message || emailErr);
  }

  return successResponse(res, {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      preferredLanguage: user.preferredLanguage,
      emailVerified: false,
      createdAt: user.createdAt,
    },
    emailVerified: false,
    verificationSentTo: user.email,
    ...(process.env.NODE_ENV !== 'production' ? { debugToken: rawVerificationToken } : {}),
  }, 'Registration successful! Verification email sent. Please check your inbox to activate your account.', 201);
};

/**
 * @desc    Verify email address using token
 * @route   GET /api/auth/verify-email
 * @access  Public
 */
const verifyEmail = async (req, res) => {
  const { token } = req.query;

  if (!token || typeof token !== 'string') {
    return errorResponse(res, 'Verification token is required', 400);
  }

  // Hash the raw token to compare with database
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    verificationTokenHash: tokenHash,
  }).select('+verificationTokenHash +verificationTokenExpires');

  if (!user) {
    return errorResponse(res, 'Invalid or already used verification token.', 400);
  }

  // Check token expiration
  if (!user.verificationTokenExpires || user.verificationTokenExpires < new Date()) {
    return errorResponse(res, 'Verification token has expired. Please request a new verification link.', 400);
  }

  // Activate account
  user.emailVerified = true;
  user.verificationTokenHash = null;
  user.verificationTokenExpires = null;
  await user.save();

  console.log(`[LearnAI Auth] Email verified successfully for: ${user.email}`);

  return successResponse(res, {
    email: user.email,
    emailVerified: true,
  }, 'Your email has been verified successfully! You can now sign in.');
};

/**
 * @desc    Resend email verification link
 * @route   POST /api/auth/resend-verification
 * @access  Public
 */
const resendVerification = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return errorResponse(res, 'Please provide your email address', 400);
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    return errorResponse(res, 'No account found with this email address.', 404);
  }

  if (user.emailVerified) {
    return errorResponse(res, 'This email address is already verified. You can log in directly.', 400);
  }

  // Generate new token & invalidate previous
  const rawVerificationToken = crypto.randomBytes(32).toString('hex');
  const verificationTokenHash = crypto
    .createHash('sha256')
    .update(rawVerificationToken)
    .digest('hex');
  const verificationTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  user.verificationTokenHash = verificationTokenHash;
  user.verificationTokenExpires = verificationTokenExpires;
  await user.save();

  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const verificationUrl = `${clientUrl}/verify-email?token=${rawVerificationToken}`;

  await sendVerificationEmail({
    to: user.email,
    name: user.name,
    verificationUrl,
  });

  return successResponse(res, {
    email: user.email,
    ...(process.env.NODE_ENV !== 'production' ? { debugToken: rawVerificationToken } : {}),
  }, `A new verification email has been sent to ${user.email}`);
};

/**
 * @desc    Authenticate user & get token (Enforces emailVerified)
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return errorResponse(res, 'Please provide both email and password', 400);
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Check for user (include password and emailVerified fields)
  const user = await User.findOne({ email: normalizedEmail }).select('+password');
  if (!user) {
    return errorResponse(res, 'Invalid email or password', 401);
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return errorResponse(res, 'Invalid email or password', 401);
  }

  // Enforce Real Email Verification
  if (!user.emailVerified) {
    return res.status(403).json({
      success: false,
      code: 'EMAIL_NOT_VERIFIED',
      message: 'Please verify your email address before logging in.',
      data: {
        email: user.email,
        emailVerified: false,
      },
    });
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
      emailVerified: user.emailVerified,
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
