const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['material', 'summary', 'explanation', 'quiz_question'],
    required: true,
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  }
}, {
  timestamps: true,
});

bookmarkSchema.index({ title: 'text', content: 'text' });

module.exports = mongoose.model('Bookmark', bookmarkSchema);
