const { generateSummary, chatWithTutor, generateQuizWithAI } = require('../services/geminiService');
const Material = require('../models/Material');
const ChatSession = require('../models/ChatSession');
const Quiz = require('../models/Quiz');
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
 * @desc    Generate AI Summary (5 modes: quick, medium, detailed, bullet_points, exam_revision)
 * @route   POST /api/ai/summarize
 * @access  Private
 */
const summarizeContent = async (req, res) => {
  let { text, materialId, mode = 'medium', language = 'en' } = req.body;

  if (materialId) {
    if (isDemoUser(req)) {
      const mat = demoStore.getMaterialById(materialId);
      if (mat) text = mat.content;
    } else {
      const material = await Material.findById(materialId);
      if (material) text = material.content;
    }
  }

  if (!text || text.trim().length === 0) {
    return errorResponse(res, 'Please provide text content or select a valid study material to summarize', 400);
  }

  try {
    const summary = await generateSummary({
      text,
      mode,
      language: language || req.user.preferredLanguage || 'en',
    });

    if (!isDemoUser(req)) {
      try {
        await LearningActivity.create({
          user: req.user._id,
          activityType: 'summarize',
          material: materialId || null,
          durationSeconds: 45,
          metadata: { mode, language },
        });
      } catch (err) {}
    }

    return successResponse(res, {
      summary,
      mode,
      language,
      materialId: materialId || null,
    }, 'Summary generated successfully');
  } catch (error) {
    return errorResponse(res, error.message || 'Unable to generate summary right now.', 500);
  }
};

/**
 * @desc    Chat with AI Tutor
 * @route   POST /api/ai/chat
 * @access  Private
 */
const chatTutor = async (req, res) => {
  const { message, sessionId, materialId, subject = 'General', mode = 'detailed', language = 'en' } = req.body;

  if (!message || message.trim() === '') {
    return errorResponse(res, 'Message text cannot be empty', 400);
  }

  let materialContext = '';
  if (materialId) {
    if (isDemoUser(req)) {
      const mat = demoStore.getMaterialById(materialId);
      if (mat) materialContext = mat.content;
    } else {
      const mat = await Material.findById(materialId);
      if (mat) materialContext = mat.content;
    }
  }

  if (isDemoUser(req)) {
    let session = sessionId ? demoStore.getChatSessionById(sessionId, req.user?._id) : null;
    const historyMessages = session ? session.messages : [];
    
    // Add current user message to conversation list for Gemini
    const allMessages = [...historyMessages, { role: 'user', content: message }];

    const assistantReply = await chatWithTutor({
      messages: allMessages,
      materialContext,
      subject,
      mode,
      language: language || req.user?.preferredLanguage || 'en',
    });

    const updatedSession = demoStore.saveChatMessage(
      session?._id || sessionId,
      message,
      assistantReply,
      req.user,
      { subject, materialId }
    );

    return successResponse(res, {
      sessionId: updatedSession._id,
      reply: assistantReply,
      messages: updatedSession.messages,
      mode,
    }, 'AI Tutor response received');
  }

  let session;
  if (sessionId) {
    session = await ChatSession.findOne({ _id: sessionId, user: req.user._id });
  }

  if (!session) {
    session = await ChatSession.create({
      user: req.user._id,
      title: message.slice(0, 40) + '...',
      materialReference: materialId || null,
      subject: subject || 'General',
      messages: [],
    });
  }

  if (!materialContext && session.materialReference) {
    const mat = await Material.findById(session.materialReference);
    if (mat) materialContext = mat.content;
  }

  // Push user message to session
  session.messages.push({
    role: 'user',
    content: message,
    timestamp: new Date(),
    language: language || 'en',
  });

  try {
    const assistantReply = await chatWithTutor({
      messages: session.messages,
      materialContext,
      subject: session.subject || subject,
      mode,
      language: language || req.user.preferredLanguage || 'en',
    });

    session.messages.push({
      role: 'assistant',
      content: assistantReply,
      timestamp: new Date(),
      language: language || 'en',
    });

    await session.save();

    try {
      await LearningActivity.create({
        user: req.user._id,
        activityType: 'ai_chat',
        material: session.materialReference || null,
        durationSeconds: 40,
        metadata: { sessionId: session._id, subject: session.subject, mode },
      });
    } catch (err) {}

    return successResponse(res, {
      sessionId: session._id,
      reply: assistantReply,
      messages: session.messages,
      mode,
    }, 'AI Tutor response received');
  } catch (error) {
    return errorResponse(res, error.message || 'Unable to connect to the AI service.', 500);
  }
};

/**
 * @desc    Explain a topic or concept with academic analogies
 * @route   POST /api/ai/explain
 * @access  Private
 */
const explainTopic = async (req, res) => {
  const { concept, level = 'standard', mode = 'detailed', materialId, language = 'en' } = req.body;

  if (!concept || concept.trim() === '') {
    return errorResponse(res, 'Please provide a concept or topic to explain', 400);
  }

  let materialContext = '';
  if (materialId) {
    if (isDemoUser(req)) {
      const mat = demoStore.getMaterialById(materialId);
      if (mat) materialContext = mat.content;
    } else {
      const mat = await Material.findById(materialId);
      if (mat) materialContext = mat.content;
    }
  }

  const prompt = [
    {
      role: 'user',
      content: `Explain the concept: "${concept}" for a student at level: "${level}".`,
    }
  ];

  try {
    const explanation = await chatWithTutor({
      messages: prompt,
      materialContext,
      subject: 'Academic Concept',
      mode,
      language: language || req.user.preferredLanguage || 'en',
    });

    return successResponse(res, {
      concept,
      explanation,
      level,
      mode,
      language,
    });
  } catch (error) {
    return errorResponse(res, error.message || 'Unable to generate concept explanation.', 500);
  }
};

/**
 * @desc    Generate a structured quiz via AI and save to database
 * @route   POST /api/ai/generate-quiz
 * @access  Private
 */
const generateQuizAI = async (req, res) => {
  const { topic, subject = 'General', numQuestions = 5, difficulty = 'medium', questionType = 'mcq', materialId, language = 'en' } = req.body;

  if (!topic && !materialId) {
    return errorResponse(res, 'Please specify a quiz topic or select a study material', 400);
  }

  let materialContent = '';
  let resolvedTopic = topic;
  let resolvedSubject = subject;

  if (materialId) {
    if (isDemoUser(req)) {
      const mat = demoStore.getMaterialById(materialId);
      if (mat) {
        materialContent = mat.content;
        if (!resolvedTopic) resolvedTopic = mat.title;
        if (!resolvedSubject || resolvedSubject === 'General') resolvedSubject = mat.subject;
      }
    } else {
      const mat = await Material.findById(materialId);
      if (mat) {
        materialContent = mat.content;
        if (!resolvedTopic) resolvedTopic = mat.title;
        if (!resolvedSubject || resolvedSubject === 'General') resolvedSubject = mat.subject;
      }
    }
  }

  try {
    const quizData = await generateQuizWithAI({
      topic: resolvedTopic || 'Study Topic',
      subject: resolvedSubject || 'General',
      numQuestions: Number(numQuestions) || 5,
      difficulty: difficulty || 'medium',
      questionType: questionType || 'mcq',
      materialContent,
      language: language || req.user.preferredLanguage || 'en',
    });

    if (isDemoUser(req)) {
      const createdQuiz = demoStore.createQuiz({
        title: quizData.title || `${resolvedTopic} Quiz`,
        description: `AI-generated quiz focusing on ${resolvedTopic} (${resolvedSubject}) with ${difficulty} difficulty.`,
        subject: quizData.subject || resolvedSubject || 'General',
        difficulty: quizData.difficulty || difficulty || 'medium',
        questions: quizData.questions,
        generatedByAI: true,
        materialReference: materialId || null,
        timeLimitMinutes: Math.max(5, (quizData.questions?.length || 5) * 2),
      }, req.user);

      return successResponse(res, {
        quiz: createdQuiz,
      }, 'Quiz generated and saved successfully', 201);
    }

    // Save the generated quiz to MongoDB
    const createdQuiz = await Quiz.create({
      title: quizData.title || `${resolvedTopic} Quiz`,
      description: `AI-generated quiz focusing on ${resolvedTopic} (${resolvedSubject}) with ${difficulty} difficulty.`,
      subject: quizData.subject || resolvedSubject || 'General',
      difficulty: quizData.difficulty || difficulty || 'medium',
      questions: quizData.questions,
      createdBy: req.user._id,
      generatedByAI: true,
      materialReference: materialId || null,
      timeLimitMinutes: Math.max(5, (quizData.questions?.length || 5) * 2),
    });

    return successResponse(res, {
      quiz: createdQuiz,
    }, 'Quiz generated and saved successfully', 201);
  } catch (error) {
    return errorResponse(res, error.message || 'Unable to generate quiz with AI.', 500);
  }
};

/**
 * @desc    Get user's AI chat sessions
 * @route   GET /api/ai/sessions
 * @access  Private
 */
const getChatSessions = async (req, res) => {
  if (isDemoUser(req)) {
    const sessions = demoStore.getChatSessions(req.user?._id);
    return successResponse(res, { sessions });
  }

  const sessions = await ChatSession.find({ user: req.user._id })
    .sort('-updatedAt')
    .populate('materialReference', 'title subject');

  return successResponse(res, { sessions });
};

/**
 * @desc    Get a single AI chat session with message history
 * @route   GET /api/ai/sessions/:id
 * @access  Private
 */
const getChatSessionById = async (req, res) => {
  if (isDemoUser(req) || req.params.id.startsWith('session-')) {
    const session = demoStore.getChatSessionById(req.params.id, req.user?._id);
    if (!session) {
      return errorResponse(res, 'Chat session not found', 404);
    }
    return successResponse(res, { session });
  }

  const session = await ChatSession.findOne({ _id: req.params.id, user: req.user._id })
    .populate('materialReference', 'title subject content');

  if (!session) {
    return errorResponse(res, 'Chat session not found', 404);
  }

  return successResponse(res, { session });
};

/**
 * @desc    Clear / Delete chat session
 * @route   DELETE /api/ai/sessions/:id
 * @access  Private
 */
const deleteChatSession = async (req, res) => {
  if (isDemoUser(req) || req.params.id.startsWith('session-')) {
    return successResponse(res, {}, 'Chat session deleted successfully');
  }

  const session = await ChatSession.findOneAndDelete({ _id: req.params.id, user: req.user._id });

  if (!session) {
    return errorResponse(res, 'Chat session not found', 404);
  }

  return successResponse(res, {}, 'Chat session deleted successfully');
};

module.exports = {
  summarizeContent,
  chatTutor,
  explainTopic,
  generateQuizAI,
  getChatSessions,
  getChatSessionById,
  deleteChatSession,
};


