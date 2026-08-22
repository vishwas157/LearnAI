const { calculateUserAnalytics } = require('../services/analyticsEngine');
const { successResponse, errorResponse } = require('../utils/responseHelper');

/**
 * @desc    Get comprehensive user learning analytics
 * @route   GET /api/analytics
 * @access  Private
 */
const getUserAnalytics = async (req, res) => {
  const analytics = await calculateUserAnalytics(req.user._id);
  return successResponse(res, { analytics });
};

module.exports = { getUserAnalytics };
