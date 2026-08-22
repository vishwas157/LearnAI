const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  verifyEmail,
  resendVerification,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

module.exports = router;
