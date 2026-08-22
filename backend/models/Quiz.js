const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true,
  },
  options: [{
    type: String,
    required: true,
  }],
  correctAnswer: {
    type: Number, // index in options array: 0, 1, 2, 3
    required: true,
  },
  explanation: {
    type: String,
    default: '',
  },
  questionType: {
    type: String,
    enum: ['mcq', 'true_false', 'short_answer'],
    default: 'mcq',
  }
}, { _id: true });

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a quiz title'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  subject: {
    type: String,
    required: true,
    trim: true,
    default: 'General',
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
  },
  timeLimitMinutes: {
    type: Number,
    default: 10,
  },
  questions: [questionSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  generatedByAI: {
    type: Boolean,
    default: false,
  },
  materialReference: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material',
    default: null,
  }
}, {
  timestamps: true,
});

quizSchema.index({ title: 'text', description: 'text', subject: 'text' });

module.exports = mongoose.model('Quiz', quizSchema);
