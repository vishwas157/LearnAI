const Material = require('../models/Material');
const Quiz = require('../models/Quiz');
const Bookmark = require('../models/Bookmark');
const { successResponse, errorResponse } = require('../utils/responseHelper');

/**
 * @desc    Global search across materials, quizzes, and bookmarks
 * @route   GET /api/search
 * @access  Private
 */
const globalSearch = async (req, res) => {
  const { q, category = 'all' } = req.query;

  if (!q || q.trim() === '') {
    return successResponse(res, { results: { materials: [], quizzes: [], bookmarks: [] }, totalCount: 0 });
  }

  const searchRegex = new RegExp(q.trim(), 'i');

  const results = {
    materials: [],
    quizzes: [],
    bookmarks: [],
  };

  if (category === 'all' || category === 'materials') {
    results.materials = await Material.find({
      $or: [
        { title: searchRegex },
        { description: searchRegex },
        { subject: searchRegex },
        { tags: { $in: [searchRegex] } },
      ]
    }).limit(10).select('title description subject fileType readingProgress isCompleted createdAt');
  }

  if (category === 'all' || category === 'quizzes') {
    results.quizzes = await Quiz.find({
      $or: [
        { title: searchRegex },
        { description: searchRegex },
        { subject: searchRegex },
      ]
    }).limit(10).select('title description subject difficulty generatedByAI timeLimitMinutes createdAt');
  }

  if (category === 'all' || category === 'bookmarks') {
    results.bookmarks = await Bookmark.find({
      user: req.user._id,
      $or: [
        { title: searchRegex },
        { content: searchRegex },
      ]
    }).limit(10).select('title type content createdAt');
  }

  const totalCount = results.materials.length + results.quizzes.length + results.bookmarks.length;

  return successResponse(res, {
    query: q,
    category,
    results,
    totalCount,
  });
};

module.exports = { globalSearch };
