const { errorResponse } = require('../utils/responseHelper');

const notFound = (req, res, next) => {
  return errorResponse(res, `Route not found: ${req.originalUrl}`, 404);
};

const errorHandler = (err, req, res, next) => {
  console.error('Server Error:', err);

  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';

  // Handle Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    message = 'Resource not found or invalid identifier format';
    statusCode = 404;
  }

  // Handle Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `Duplicate value entered for ${field}. Please use another value.`;
    statusCode = 400;
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    message = Object.values(err.errors).map(val => val.message).join(', ');
    statusCode = 400;
  }

  // Handle Multer Size Limit Error
  if (err.code === 'LIMIT_FILE_SIZE') {
    message = 'File size exceeds maximum permitted limit (15MB)';
    statusCode = 400;
  }

  return errorResponse(res, message, statusCode);
};

module.exports = { notFound, errorHandler };
