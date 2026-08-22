const express = require('express');
const router = express.Router();
const {
  getPlatformStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAllContent,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeAdmin } = require('../middleware/adminMiddleware');

// All admin routes require login + admin role
router.use(protect, authorizeAdmin);

router.get('/stats', getPlatformStats);
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);
router.get('/content', getAllContent);

module.exports = router;
