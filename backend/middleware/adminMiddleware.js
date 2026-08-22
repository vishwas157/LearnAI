const { errorResponse } = require('../utils/responseHelper');

const authorizeAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return errorResponse(res, 'Access denied: Admin authorization required', 403);
  }
  next();
};

module.exports = { authorizeAdmin };
