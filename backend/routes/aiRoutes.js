const express = require('express');
const router = express.Router();
const {
  summarizeContent,
  chatTutor,
  explainTopic,
  generateQuizAI,
  getChatSessions,
  getChatSessionById,
  deleteChatSession,
} = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');
const { aiLimiter } = require('../middleware/rateLimiter');

router.use(protect);

router.post('/summarize', aiLimiter, summarizeContent);
router.post('/chat', aiLimiter, chatTutor);
router.post('/explain', aiLimiter, explainTopic);
router.post('/generate-quiz', aiLimiter, generateQuizAI);
router.post('/revision', aiLimiter, (req, res, next) => {
  req.body.mode = 'exam_revision';
  summarizeContent(req, res, next);
});

router.get('/sessions', getChatSessions);
router.get('/sessions/:id', getChatSessionById);
router.delete('/sessions/:id', deleteChatSession);

module.exports = router;
