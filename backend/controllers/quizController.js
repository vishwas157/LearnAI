const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const LearningActivity = require('../models/LearningActivity');
const demoStore = require('../services/demoStore');
const { isDBConnected } = require('../config/db');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const isDemoUser = (req) => {
  if (!isDBConnected()) return true;
  if (req.user?.isDemo) return true;
  const idStr = (req.user?._id || req.user?.id || '').toString();
  return idStr.startsWith('local-') || idStr.startsWith('demo-') || idStr.startsWith('user-');
};

/**
 * @desc    Get all available quizzes (created by user or sample/public)
 * @route   GET /api/quiz
 * @access  Private
 */
const getQuizzes = async (req, res) => {
  const { subject, difficulty, search, sort = '-createdAt' } = req.query;

  if (isDemoUser(req)) {
    const quizzes = demoStore.getQuizzes({ subject, difficulty, search });
    // Sanitize questions (hide correct answers in list view)
    const sanitized = quizzes.map(q => ({
      _id: q._id,
      title: q.title,
      description: q.description,
      subject: q.subject,
      difficulty: q.difficulty,
      timeLimitMinutes: q.timeLimitMinutes,
      questionsCount: q.questions?.length || 0,
      questions: (q.questions || []).map(qu => ({
        _id: qu._id,
        question: qu.question || qu.questionText,
        options: qu.options,
        questionType: qu.questionType,
      })),
      generatedByAI: q.generatedByAI,
      createdBy: q.createdBy,
      createdAt: q.createdAt,
    }));
    return successResponse(res, { quizzes: sanitized, count: sanitized.length });
  }

  const query = {};

  if (subject && subject !== 'All' && subject !== 'all') {
    query.subject = subject;
  }

  if (difficulty && difficulty !== 'All' && difficulty !== 'all') {
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

  if (isDemoUser(req) || req.params.id.startsWith('quiz-')) {
    const quiz = demoStore.getQuizById(req.params.id);
    if (!quiz) {
      return errorResponse(res, 'Quiz not found', 404);
    }

    const sanitizedQuestions = (quiz.questions || []).map((q, idx) => ({
      _id: q._id || `q-${idx}`,
      questionIndex: idx,
      question: q.question || q.questionText,
      questionText: q.questionText || q.question,
      options: q.options,
      questionType: q.questionType,
      ...(mode === 'review' ? { correctAnswer: q.correctAnswer, explanation: q.explanation } : {})
    }));

    return successResponse(res, {
      quiz: {
        _id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        subject: quiz.subject,
        difficulty: quiz.difficulty,
        timeLimitMinutes: quiz.timeLimitMinutes,
        questionsCount: quiz.questions?.length || 0,
        questions: sanitizedQuestions,
        generatedByAI: quiz.generatedByAI,
        createdBy: quiz.createdBy,
        createdAt: quiz.createdAt,
      }
    });
  }

  const quiz = await Quiz.findById(req.params.id).populate('createdBy', 'name');

  if (!quiz) {
    return errorResponse(res, 'Quiz not found', 404);
  }

  if (mode === 'attempt') {
    // Hide answers during attempt to prevent cheating/inspection
    const sanitizedQuestions = quiz.questions.map((q, idx) => ({
      _id: q._id,
      questionIndex: idx,
      question: q.question || q.questionText,
      questionText: q.questionText || q.question,
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

  // Normalize questions format
  const normalizedQuestions = questions.map((q, i) => ({
    _id: q._id || `q-user-${i}-${Date.now()}`,
    question: q.question || q.questionText,
    questionText: q.questionText || q.question,
    options: q.options,
    correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
    explanation: q.explanation || 'No explanation provided.',
    questionType: q.questionType || 'mcq',
  }));

  // Validate questions
  for (let i = 0; i < normalizedQuestions.length; i++) {
    const q = normalizedQuestions[i];
    if (!q.question || !q.options || !Array.isArray(q.options) || q.options.length < 2) {
      return errorResponse(res, `Question #${i + 1} must have valid question text and at least 2 options`, 400);
    }
    if (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer >= q.options.length) {
      return errorResponse(res, `Question #${i + 1} must have a valid correct answer index`, 400);
    }
  }

  if (isDemoUser(req)) {
    const quiz = demoStore.createQuiz({
      title,
      description: description || '',
      subject: subject || 'General',
      difficulty: difficulty || 'medium',
      timeLimitMinutes: timeLimitMinutes || 10,
      questions: normalizedQuestions,
      materialReference: materialReference || null,
      generatedByAI: false,
    }, req.user);

    return successResponse(res, { quiz }, 'Quiz created successfully', 201);
  }

  const quiz = await Quiz.create({
    title,
    description: description || '',
    subject: subject || 'General',
    difficulty: difficulty || 'medium',
    timeLimitMinutes: timeLimitMinutes || 10,
    questions: normalizedQuestions,
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

  if (isDemoUser(req) || req.params.id.startsWith('quiz-')) {
    const attempt = demoStore.submitQuizAttempt(req.params.id, answers, timeTakenSeconds, req.user);
    if (!attempt) {
      return errorResponse(res, 'Quiz not found', 404);
    }

    return successResponse(res, {
      attempt: {
        _id: attempt._id,
        quiz: attempt.quiz,
        quizTitle: attempt.quiz?.title || 'Practice Quiz',
        subject: attempt.quiz?.subject || 'General',
        difficulty: attempt.quiz?.difficulty || 'medium',
        score: attempt.score,
        totalQuestions: attempt.totalQuestions,
        percentage: attempt.percentage,
        accuracy: attempt.accuracy,
        timeTakenSeconds: attempt.timeTakenSeconds,
        detailedReview: attempt.answers,
        attemptedAt: attempt.attemptedAt,
      }
    }, 'Quiz submitted and evaluated successfully', 201);
  }

  const quiz = await Quiz.findById(req.params.id);

  if (!quiz) {
    return errorResponse(res, 'Quiz not found', 404);
  }

  let score = 0;
  const totalQuestions = quiz.questions.length;
  const detailedAnswers = [];

  quiz.questions.forEach((q, idx) => {
    const userAnswerObj = answers.find(a => a.questionIndex === idx || a.questionId === q._id?.toString());
    const selectedAnswer = userAnswerObj ? userAnswerObj.selectedAnswer : -1;
    const isCorrect = selectedAnswer === q.correctAnswer;

    if (isCorrect) {
      score += 1;
    }

    detailedAnswers.push({
      questionIndex: idx,
      questionText: q.question || q.questionText,
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
  try {
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
  } catch (actErr) {}

  return successResponse(res, {
    attempt: {
      _id: attempt._id,
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
    }
  }, 'Quiz submitted and evaluated successfully', 201);
};

/**
 * @desc    Get user's previous quiz attempts & results
 * @route   GET /api/quiz/attempts
 * @access  Private
 */
const getQuizAttempts = async (req, res) => {
  if (isDemoUser(req)) {
    const attempts = demoStore.getQuizAttempts(req.user?._id);
    return successResponse(res, { attempts, count: attempts.length });
  }

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
  if (isDemoUser(req) || req.params.attemptId.startsWith('att-')) {
    const attempt = demoStore.getAttemptById(req.params.attemptId);
    if (!attempt) {
      return errorResponse(res, 'Attempt result not found', 404);
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
        detailedReview: attempt.answers,
      }
    });
  }

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
        questionText: q.question || q.questionText,
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
  if (isDemoUser(req) || req.params.id.startsWith('quiz-')) {
    const deleted = demoStore.deleteQuiz(req.params.id);
    if (!deleted) {
      return errorResponse(res, 'Quiz not found', 404);
    }
    return successResponse(res, {}, 'Quiz deleted successfully');
  }

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


