const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  language: {
    type: String,
    default: 'en',
  }
}, { _id: true });

const chatSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    default: 'New AI Tutor Discussion',
    trim: true,
  },
  messages: [chatMessageSchema],
  materialReference: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material',
    default: null,
  },
  subject: {
    type: String,
    default: 'General',
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('ChatSession', chatSessionSchema);
