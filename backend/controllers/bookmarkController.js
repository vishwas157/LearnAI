const Bookmark = require('../models/Bookmark');
const { successResponse, errorResponse } = require('../utils/responseHelper');

/**
 * @desc    Get user's bookmarks
 * @route   GET /api/bookmarks
 * @access  Private
 */
const getBookmarks = async (req, res) => {
  const { type, search } = req.query;
  const query = { user: req.user._id };

  if (type && type !== 'all') {
    query.type = type;
  }

  if (search && search.trim() !== '') {
    query.$text = { $search: search.trim() };
  }

  const bookmarks = await Bookmark.find(query).sort('-createdAt');

  return successResponse(res, { bookmarks, count: bookmarks.length });
};

/**
 * @desc    Create a new bookmark
 * @route   POST /api/bookmarks
 * @access  Private
 */
const createBookmark = async (req, res) => {
  const { type, referenceId, title, content, tags, metadata } = req.body;

  if (!type || !title || !content) {
    return errorResponse(res, 'Bookmark type, title, and content are required', 400);
  }

  // Prevent duplicates if referenceId is provided
  if (referenceId) {
    const existing = await Bookmark.findOne({ user: req.user._id, referenceId, type });
    if (existing) {
      return successResponse(res, { bookmark: existing }, 'Item already bookmarked');
    }
  }

  const bookmark = await Bookmark.create({
    user: req.user._id,
    type,
    referenceId: referenceId || null,
    title,
    content,
    tags: Array.isArray(tags) ? tags : (tags ? [tags] : []),
    metadata: metadata || {},
  });

  return successResponse(res, { bookmark }, 'Bookmark saved successfully', 201);
};

/**
 * @desc    Delete a bookmark
 * @route   DELETE /api/bookmarks/:id
 * @access  Private
 */
const deleteBookmark = async (req, res) => {
  const bookmark = await Bookmark.findOneAndDelete({ _id: req.params.id, user: req.user._id });

  if (!bookmark) {
    return errorResponse(res, 'Bookmark not found', 404);
  }

  return successResponse(res, {}, 'Bookmark removed successfully');
};

module.exports = {
  getBookmarks,
  createBookmark,
  deleteBookmark,
};
