const express = require('express');
const router = express.Router();
const {
  getQuizzes,
  getQuizById,
  createQuiz,
  submitQuizAttempt,
  getQuizAttempts,
  getAttemptResultById,
  deleteQuiz,
} = require('../controllers/quizController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getQuizzes)
  .post(createQuiz);

router.get('/attempts', getQuizAttempts);
router.get('/attempts/:attemptId', getAttemptResultById);

router.route('/:id')
  .get(getQuizById)
  .delete(deleteQuiz);

router.post('/:id/attempt', submitQuizAttempt);

module.exports = router;
