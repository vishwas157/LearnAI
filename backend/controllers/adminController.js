const User = require('../models/User');
const Material = require('../models/Material');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const LearningActivity = require('../models/LearningActivity');
const demoStore = require('../services/demoStore');
const { isDBConnected } = require('../config/db');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const isDemoUser = (req) => {
  if (!isDBConnected()) return true;
  if (req.user?.isDemo) return true;
  const idStr = (req.user?._id || req.user?.id || '').toString();
  return idStr.startsWith('local-') || idStr.startsWith('demo-') || idStr.startsWith('user-');
};

/**
 * @desc    Get system-wide platform statistics
 * @route   GET /api/admin/stats
 * @access  Private (Admin Only)
 */
const getPlatformStats = async (req, res) => {
  if (isDemoUser(req)) {
    const statsData = demoStore.getPlatformStats();
    return successResponse(res, statsData);
  }

  const totalUsers = await User.countDocuments();
  const totalStudents = await User.countDocuments({ role: 'student' });
  const totalAdmins = await User.countDocuments({ role: 'admin' });
  const totalMaterials = await Material.countDocuments();
  const totalQuizzes = await Quiz.countDocuments();
  const totalAttempts = await QuizAttempt.countDocuments();

  const recentUsers = await User.find().sort('-createdAt').limit(5).select('-password');
  const recentActivities = await LearningActivity.find().sort('-createdAt').limit(10).populate('user', 'name email');

  return successResponse(res, {
    stats: {
      totalUsers,
      totalStudents,
      totalAdmins,
      totalMaterials,
      totalQuizzes,
      totalAttempts,
    },
    recentUsers,
    recentActivities,
  });
};

/**
 * @desc    Get all users with filtering
 * @route   GET /api/admin/users
 * @access  Private (Admin Only)
 */
const getAllUsers = async (req, res) => {
  const { role, search } = req.query;

  if (isDemoUser(req)) {
    const users = demoStore.getUsers({ role, search });
    return successResponse(res, { users, count: users.length });
  }


  const query = {};

  if (role && role !== 'all') {
    query.role = role;
  }

  if (search && search.trim() !== '') {
    const regex = new RegExp(search.trim(), 'i');
    query.$or = [{ name: regex }, { email: regex }];
  }

  const users = await User.find(query).sort('-createdAt').select('-password');

  return successResponse(res, { users, count: users.length });
};

/**
 * @desc    Update user role
 * @route   PUT /api/admin/users/:id/role
 * @access  Private (Admin Only)
 */
const updateUserRole = async (req, res) => {
  const { role } = req.body;

  if (!['student', 'admin'].includes(role)) {
    return errorResponse(res, 'Invalid role specified. Must be student or admin.', 400);
  }

  if (isDemoUser(req) || req.params.id.startsWith('demo-') || req.params.id.startsWith('user-')) {
    const user = demoStore.updateUserRole(req.params.id, role);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }
    return successResponse(res, { user }, `User role updated to ${role}`);
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    return errorResponse(res, 'User not found', 404);
  }

  // Prevent admin from demoting themselves
  if (user._id.toString() === req.user._id.toString() && role !== 'admin') {
    return errorResponse(res, 'You cannot remove your own admin privileges', 400);
  }

  user.role = role;
  await user.save();

  return successResponse(res, { user }, `User role updated to ${role}`);
};

/**
 * @desc    Delete a user
 * @route   DELETE /api/admin/users/:id
 * @access  Private (Admin Only)
 */
const deleteUser = async (req, res) => {
  if (isDemoUser(req) || req.params.id.startsWith('demo-') || req.params.id.startsWith('user-')) {
    const deleted = demoStore.deleteUser(req.params.id);
    if (!deleted) {
      return errorResponse(res, 'User not found', 404);
    }
    return successResponse(res, {}, 'User removed from platform successfully');
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    return errorResponse(res, 'User not found', 404);
  }

  if (user._id.toString() === req.user._id.toString()) {
    return errorResponse(res, 'You cannot delete your own admin account', 400);
  }

  await user.deleteOne();

  return successResponse(res, {}, 'User removed from platform successfully');
};

/**
 * @desc    Get all platform content (materials & quizzes)
 * @route   GET /api/admin/content
 * @access  Private (Admin Only)
 */
const getAllContent = async (req, res) => {
  if (isDemoUser(req)) {
    return successResponse(res, {
      materials: demoStore.getMaterials(),
      quizzes: demoStore.getQuizzes(),
    });
  }

  const materials = await Material.find().sort('-createdAt').populate('uploadedBy', 'name email');
  const quizzes = await Quiz.find().sort('-createdAt').populate('createdBy', 'name email');

  return successResponse(res, {
    materials,
    quizzes,
  });
};


module.exports = {
  getPlatformStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAllContent,
};

