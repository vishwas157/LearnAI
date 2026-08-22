const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [60, 'Name cannot be more than 60 characters'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/,
      'Please provide a valid email address',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false,
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student',
  },
  preferredLanguage: {
    type: String,
    enum: ['en', 'hi', 'gu'],
    default: 'en',
  },
  avatar: {
    type: String,
    default: 'avatar-1',
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  verificationTokenHash: {
    type: String,
    default: null,
    select: false,
  },
  verificationTokenExpires: {
    type: Date,
    default: null,
    select: false,
  },
  passwordResetTokenHash: {
    type: String,
    default: null,
    select: false,
  },
  passwordResetTokenExpires: {
    type: Date,
    default: null,
    select: false,
  },
  studyStreak: {
    type: Number,
    default: 1,
  },
  lastActiveDate: {
    type: Date,
    default: Date.now,
  },
  totalStudyTimeMinutes: {
    type: Number,
    default: 0,
  }
}, {
  timestamps: true,
});

// Encrypt password using bcrypt before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
