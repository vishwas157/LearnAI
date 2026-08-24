const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { errorResponse } = require('../utils/responseHelper');

/*
|--------------------------------------------------------------------------
| Authentication Middleware
|--------------------------------------------------------------------------
| Supports:
| 1. LearnAI local/demo authentication (Bearer local_<encoded>)
| 2. Normal JWT authentication (Bearer <jwt>)
|--------------------------------------------------------------------------
*/

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.headers.authorization) {
    token = req.headers.authorization;
  }

  if (!token) {
    return errorResponse(
      res,
      'Not authorized to access this route, token missing',
      401
    );
  }

  /*
  |--------------------------------------------------------------------------
  | 1. LOCAL DEMO AUTHENTICATION (Bearer local_...)
  |--------------------------------------------------------------------------
  | Detect local_ token BEFORE jwt.verify().
  | Do NOT call MongoDB or User.findById().
  |--------------------------------------------------------------------------
  */
  if (token.startsWith('local_')) {
    try {
      const encoded = token.substring('local_'.length);
      let localUser = null;

      // Primary: decodeURIComponent (URL-encoded JSON)
      try {
        const decoded = decodeURIComponent(encoded);
        localUser = JSON.parse(decoded);
      } catch (uriErr) {
        // Secondary: Base64 decode
        try {
          const fromB64 = Buffer.from(encoded, 'base64').toString('utf8');
          localUser = JSON.parse(fromB64);
        } catch (b64Err) {
          // Tertiary: direct JSON parse
          try {
            localUser = JSON.parse(encoded);
          } catch (jsonErr) {
            localUser = null;
          }
        }
      }

      if (!localUser || typeof localUser !== 'object') {
        return errorResponse(res, 'Invalid local authentication token', 401);
      }

      const userId = localUser.id || localUser._id || 'local-demo-student';
      const userEmail = localUser.email || 'student@learnai.com';

      req.user = {
        _id: userId,
        id: userId,
        name: localUser.name || (userEmail === 'admin@learnai.com' ? 'LearnAI Admin' : 'Demo Student'),
        email: userEmail,
        role: localUser.role || (userEmail === 'admin@learnai.com' ? 'admin' : 'student'),
        preferredLanguage: localUser.preferredLanguage || 'en',
        avatar: localUser.avatar || 'avatar-1',
        emailVerified: localUser.emailVerified !== false,
        studyStreak: localUser.studyStreak || 1,
        isDemo: true,
      };

      return next();
    } catch (error) {
      console.warn('[AUTH] Invalid local authentication token:', error.message);
      return errorResponse(res, 'Invalid local authentication token', 401);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | 2. NORMAL JWT AUTHENTICATION
  |--------------------------------------------------------------------------
  */
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'learnai_jwt_secret'
    );

    try {
      const user = await User.findById(decoded.id);
      if (user) {
        req.user = user;
        return next();
      }
    } catch (dbError) {
      console.warn('[AUTH] MongoDB unavailable, using JWT payload:', dbError.message);
    }

    req.user = {
      _id: decoded.id || 'local-student-jwt',
      id: decoded.id || 'local-student-jwt',
      name: decoded.name || 'LearnAI User',
      email: decoded.email || 'student@learnai.com',
      role: decoded.role || 'student',
      preferredLanguage: decoded.preferredLanguage || 'en',
      avatar: decoded.avatar || 'avatar-1',
      emailVerified: true,
      studyStreak: decoded.studyStreak || 1,
      isDemo: true,
    };

    return next();
  } catch (error) {
    console.warn(`[AUTH] JWT verification failed: ${error.message}`);
    return errorResponse(
      res,
      'Invalid or expired authentication token',
      401
    );
  }
};

module.exports = {
  protect,
};