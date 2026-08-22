const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const LearningActivity = require('../models/LearningActivity');
const { successResponse, errorResponse } = require('../utils/responseHelper');

/**
 * @desc    Get all available quizzes (created by user or sample/public)
 * @route   GET /api/quiz
 * @access  Private
 */
const getQuizzes = async (req, res) => {
  const { subject, difficulty, search, sort = '-createdAt' } = req.query;
  const query = {};

  if (subject && subject !== 'All') {
    query.subject = subject;
  }

  if (difficulty && difficulty !== 'All') {
    query.difficulty = difficulty;
  }

  if (search && search.trim() !== '') {
    query.$text = { $search: search.trim() };
  }

  const quizzes = await Quiz.find(query)
    .sort(sort)
    .populate('createdBy', 'name email')
    .select('-questions.correctAnswer -questions.explanation');

  return successResponse(res, { quizzes, count: quizzes.length });
};

/**
 * @desc    Get a single quiz for attempt (options included, answers hidden for test mode)
 * @route   GET /api/quiz/:id
 * @access  Private
 */
const getQuizById = async (req, res) => {
  const { mode = 'attempt' } = req.query; // 'attempt' or 'review'
  const quiz = await Quiz.findById(req.params.id).populate('createdBy', 'name');

  if (!quiz) {
    return errorResponse(res, 'Quiz not found', 404);
  }

  if (mode === 'attempt') {
    // Hide answers during attempt to prevent cheating/inspection
    const sanitizedQuestions = quiz.questions.map((q, idx) => ({
      _id: q._id,
      questionIndex: idx,
      question: q.question,
      options: q.options,
      questionType: q.questionType,
    }));

    return successResponse(res, {
      quiz: {
        _id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        subject: quiz.subject,
        difficulty: quiz.difficulty,
        timeLimitMinutes: quiz.timeLimitMinutes,
        questionsCount: quiz.questions.length,
        questions: sanitizedQuestions,
        generatedByAI: quiz.generatedByAI,
        createdBy: quiz.createdBy,
        createdAt: quiz.createdAt,
      }
    });
  }

  // If review mode, return full quiz with explanations
  return successResponse(res, { quiz });
};

/**
 * @desc    Create a manual Quiz
 * @route   POST /api/quiz
 * @access  Private
 */
const createQuiz = async (req, res) => {
  const { title, description, subject, difficulty, timeLimitMinutes, questions, materialReference } = req.body;

  if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
    return errorResponse(res, 'Quiz title and at least one valid question are required', 400);
  }

  // Validate questions
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    if (!q.question || !q.options || !Array.isArray(q.options) || q.options.length < 2) {
      return errorResponse(res, `Question #${i + 1} must have valid question text and at least 2 options`, 400);
    }
    if (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer >= q.options.length) {
      return errorResponse(res, `Question #${i + 1} must have a valid correct answer index`, 400);
    }
  }

  const quiz = await Quiz.create({
    title,
    description: description || '',
    subject: subject || 'General',
    difficulty: difficulty || 'medium',
    timeLimitMinutes: timeLimitMinutes || 10,
    questions,
    createdBy: req.user._id,
    generatedByAI: false,
    materialReference: materialReference || null,
  });

  return successResponse(res, { quiz }, 'Quiz created successfully', 201);
};

/**
 * @desc    Submit a quiz attempt, evaluate answers, calculate score, and return review
 * @route   POST /api/quiz/:id/attempt
 * @access  Private
 */
const submitQuizAttempt = async (req, res) => {
  const { answers = [], timeTakenSeconds = 0 } = req.body;
  const quiz = await Quiz.findById(req.params.id);

  if (!quiz) {
    return errorResponse(res, 'Quiz not found', 404);
  }

  let score = 0;
  const totalQuestions = quiz.questions.length;
  const detailedAnswers = [];

  quiz.questions.forEach((q, idx) => {
    const userAnswerObj = answers.find(a => a.questionIndex === idx || a.questionId === q._id.toString());
    const selectedAnswer = userAnswerObj ? userAnswerObj.selectedAnswer : -1;
    const isCorrect = selectedAnswer === q.correctAnswer;

    if (isCorrect) {
      score += 1;
    }

    detailedAnswers.push({
      questionIndex: idx,
      questionText: q.question,
      options: q.options,
      selectedAnswer,
      correctAnswer: q.correctAnswer,
      isCorrect,
      explanation: q.explanation || 'No explanation provided.',
    });
  });

  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  const accuracy = percentage;

  // Save attempt to database
  const attempt = await QuizAttempt.create({
    user: req.user._id,
    quiz: quiz._id,
    answers: detailedAnswers.map(a => ({
      questionIndex: a.questionIndex,
      selectedAnswer: a.selectedAnswer,
      isCorrect: a.isCorrect,
      questionText: a.questionText,
      explanation: a.explanation,
    })),
    score,
    totalQuestions,
    percentage,
    accuracy,
    timeTakenSeconds: Number(timeTakenSeconds) || 0,
    attemptedAt: new Date(),
  });

  // Log learning activity
  await LearningActivity.create({
    user: req.user._id,
    activityType: 'quiz_attempt',
    material: quiz.materialReference || null,
    durationSeconds: Number(timeTakenSeconds) || 60,
    metadata: {
      quizId: quiz._id,
      quizTitle: quiz.title,
      score,
      totalQuestions,
      percentage,
    },
  });

  return successResponse(res, {
    attemptId: attempt._id,
    quizTitle: quiz.title,
    subject: quiz.subject,
    difficulty: quiz.difficulty,
    score,
    totalQuestions,
    percentage,
    accuracy,
    timeTakenSeconds,
    detailedReview: detailedAnswers,
    attemptedAt: attempt.attemptedAt,
  }, 'Quiz submitted and evaluated successfully', 201);
};

/**
 * @desc    Get user's previous quiz attempts & results
 * @route   GET /api/quiz/attempts
 * @access  Private
 */
const getQuizAttempts = async (req, res) => {
  const attempts = await QuizAttempt.find({ user: req.user._id })
    .populate('quiz', 'title subject difficulty generatedByAI')
    .sort('-createdAt');

  return successResponse(res, { attempts, count: attempts.length });
};

/**
 * @desc    Get a single quiz attempt result by attempt ID
 * @route   GET /api/quiz/attempts/:attemptId
 * @access  Private
 */
const getAttemptResultById = async (req, res) => {
  const attempt = await QuizAttempt.findOne({ _id: req.params.attemptId, user: req.user._id })
    .populate('quiz', 'title subject difficulty questions');

  if (!attempt) {
    return errorResponse(res, 'Attempt result not found', 404);
  }

  // Format detailed review with questions
  let detailedReview = [];
  if (attempt.quiz && attempt.quiz.questions) {
    detailedReview = attempt.quiz.questions.map((q, idx) => {
      const userAns = attempt.answers.find(a => a.questionIndex === idx);
      return {
        questionIndex: idx,
        questionText: q.question,
        options: q.options,
        selectedAnswer: userAns ? userAns.selectedAnswer : -1,
        correctAnswer: q.correctAnswer,
        isCorrect: userAns ? userAns.isCorrect : false,
        explanation: q.explanation,
      };
    });
  }

  return successResponse(res, {
    attempt: {
      _id: attempt._id,
      quiz: attempt.quiz,
      score: attempt.score,
      totalQuestions: attempt.totalQuestions,
      percentage: attempt.percentage,
      accuracy: attempt.accuracy,
      timeTakenSeconds: attempt.timeTakenSeconds,
      attemptedAt: attempt.attemptedAt,
      detailedReview: detailedReview.length > 0 ? detailedReview : attempt.answers,
    }
  });
};

/**
 * @desc    Delete custom quiz
 * @route   DELETE /api/quiz/:id
 * @access  Private
 */
const deleteQuiz = async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);

  if (!quiz) {
    return errorResponse(res, 'Quiz not found', 404);
  }

  if (quiz.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return errorResponse(res, 'Not authorized to delete this quiz', 403);
  }

  await quiz.deleteOne();

  return successResponse(res, {}, 'Quiz deleted successfully');
};

module.exports = {
  getQuizzes,
  getQuizById,
  createQuiz,
  submitQuizAttempt,
  getQuizAttempts,
  getAttemptResultById,
  deleteQuiz,
};
