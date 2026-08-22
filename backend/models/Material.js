const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a material title'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  subject: {
    type: String,
    required: [true, 'Please specify a subject'],
    trim: true,
    default: 'General',
  },
  content: {
    type: String,
    required: [true, 'Material content cannot be empty'],
  },
  fileName: {
    type: String,
    default: null,
  },
  fileType: {
    type: String,
    enum: ['pdf', 'txt', 'manual'],
    default: 'manual',
  },
  fileSize: {
    type: Number,
    default: 0,
  },
  fileUrl: {
    type: String,
    default: null,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  readingProgress: {
    type: Number,
    default: 0, // 0 to 100 percentage
    min: 0,
    max: 100,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  studyTimeSeconds: {
    type: Number,
    default: 0,
  }
}, {
  timestamps: true,
});

materialSchema.index({ title: 'text', description: 'text', content: 'text', subject: 'text' });

module.exports = mongoose.model('Material', materialSchema);
