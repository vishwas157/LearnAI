const express = require('express');
const router = express.Router();
const {
  getBookmarks,
  createBookmark,
  deleteBookmark,
} = require('../controllers/bookmarkController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getBookmarks)
  .post(createBookmark);

router.route('/:id')
  .delete(deleteBookmark);

module.exports = router;
