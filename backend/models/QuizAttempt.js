const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true,
  },
  answers: [{
    questionIndex: Number,
    selectedAnswer: Number, // index selected by user
    isCorrect: Boolean,
    questionText: String,
    explanation: String,
  }],
  score: {
    type: Number,
    required: true,
    default: 0,
  },
  totalQuestions: {
    type: Number,
    required: true,
  },
  percentage: {
    type: Number,
    required: true,
    default: 0,
  },
  accuracy: {
    type: Number,
    required: true,
    default: 0,
  },
  timeTakenSeconds: {
    type: Number,
    default: 0,
  },
  attemptedAt: {
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
