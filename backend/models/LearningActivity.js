const mongoose = require('mongoose');

const learningActivitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  activityType: {
    type: String,
    enum: ['read_material', 'quiz_attempt', 'ai_chat', 'summarize', 'tts_listen'],
    required: true,
  },
  material: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material',
    default: null,
  },
  durationSeconds: {
    type: Number,
    default: 0,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('LearningActivity', learningActivitySchema);
