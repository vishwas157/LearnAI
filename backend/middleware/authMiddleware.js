const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { errorResponse } = require('../utils/responseHelper');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return errorResponse(res, 'Not authorized to access this route, token missing', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'learnai_jwt_secret');
    const user = await User.findById(decoded.id);

    if (!user) {
      console.warn(`[AUTH] Token signature valid, but user ID "${decoded.id}" not found in current database session.`);
      return errorResponse(res, 'User session expired or belongs to a previous database instance. Please log in again.', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    console.warn(`[AUTH] JWT verification failed: ${error.message}`);
    return errorResponse(res, 'Invalid or expired authentication token', 401);
  }
};

module.exports = { protect };
