const Material = require('../models/Material');
const LearningActivity = require('../models/LearningActivity');
const { extractTextFromPDF } = require('../services/pdfService');
const { successResponse, errorResponse } = require('../utils/responseHelper');
const fs = require('fs');
const path = require('path');

/**
 * @desc    Get all study materials for logged in user (and platform library materials)
 * @route   GET /api/materials
 * @access  Private
 */
const getMaterials = async (req, res) => {
  const { subject, search, sort = '-createdAt' } = req.query;
  const query = {};

  if (subject && subject !== 'All') {
    query.subject = subject;
  }

  if (search && search.trim() !== '') {
    query.$text = { $search: search.trim() };
  }

  const materials = await Material.find(query)
    .sort(sort)
    .populate('uploadedBy', 'name email');

  return successResponse(res, { materials, count: materials.length });
};

/**
 * @desc    Get a single study material by ID
 * @route   GET /api/materials/:id
 * @access  Private
 */
const getMaterialById = async (req, res) => {
  const material = await Material.findById(req.params.id).populate('uploadedBy', 'name email');

  if (!material) {
    return errorResponse(res, 'Study material not found', 404);
  }

  // Log learning activity for reading material
  await LearningActivity.create({
    user: req.user._id,
    activityType: 'read_material',
    material: material._id,
    durationSeconds: 60,
    metadata: { title: material.title, subject: material.subject },
  });

  return successResponse(res, { material });
};

/**
 * @desc    Create / Upload new study material (PDF, TXT, or Manual text)
 * @route   POST /api/materials
 * @access  Private
 */
const createMaterial = async (req, res) => {
  let { title, description, subject, content, tags } = req.body;
  let fileName = null;
  let fileType = 'manual';
  let fileSize = 0;
  let fileUrl = null;

  if (req.file) {
    fileName = req.file.originalname;
    fileSize = req.file.size;
    fileUrl = `/uploads/${req.file.filename}`;
    const ext = path.extname(req.file.originalname).toLowerCase();

    if (ext === '.pdf') {
      fileType = 'pdf';
      try {
        const extracted = await extractTextFromPDF(req.file.path);
        content = extracted.text;
      } catch (err) {
        return errorResponse(res, `Failed to extract text from PDF: ${err.message}`, 400);
      }
    } else if (ext === '.txt') {
      fileType = 'txt';
      try {
        content = fs.readFileSync(req.file.path, 'utf8');
      } catch (err) {
        return errorResponse(res, `Failed to read TXT file: ${err.message}`, 400);
      }
    }

    if (!title || title.trim() === '') {
      title = req.file.originalname.replace(/\.[^/.]+$/, '');
    }
  }

  if (!title || !content || content.trim() === '') {
    return errorResponse(res, 'Title and content are required to create study material', 400);
  }

  let parsedTags = [];
  if (tags) {
    parsedTags = typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : tags;
  }

  const material = await Material.create({
    title,
    description: description || '',
    subject: subject || 'General',
    content,
    fileName,
    fileType,
    fileSize,
    fileUrl,
    uploadedBy: req.user._id,
    tags: parsedTags,
    readingProgress: 0,
  });

  // Log activity
  await LearningActivity.create({
    user: req.user._id,
    activityType: 'read_material',
    material: material._id,
    durationSeconds: 30,
    metadata: { title: material.title, action: 'created' },
  });

  return successResponse(res, { material }, 'Study material uploaded successfully', 201);
};

/**
 * @desc    Update study material
 * @route   PUT /api/materials/:id
 * @access  Private
 */
const updateMaterial = async (req, res) => {
  const material = await Material.findById(req.params.id);

  if (!material) {
    return errorResponse(res, 'Study material not found', 404);
  }

  // Check ownership (or admin)
  if (material.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return errorResponse(res, 'Not authorized to edit this material', 403);
  }

  const { title, description, subject, content, tags, readingProgress, isCompleted } = req.body;

  if (title) material.title = title;
  if (description !== undefined) material.description = description;
  if (subject) material.subject = subject;
  if (content) material.content = content;
  if (tags) material.tags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());
  if (readingProgress !== undefined) {
    material.readingProgress = Math.min(100, Math.max(0, Number(readingProgress)));
    if (material.readingProgress >= 100) {
      material.isCompleted = true;
    }
  }
  if (isCompleted !== undefined) material.isCompleted = isCompleted;

  await material.save();

  return successResponse(res, { material }, 'Material updated successfully');
};

/**
 * @desc    Update reading progress and study time
 * @route   POST /api/materials/:id/progress
 * @access  Private
 */
const updateProgress = async (req, res) => {
  const material = await Material.findById(req.params.id);
  if (!material) {
    return errorResponse(res, 'Material not found', 404);
  }

  const { progress, durationSeconds = 0 } = req.body;

  if (progress !== undefined) {
    material.readingProgress = Math.min(100, Math.max(0, Number(progress)));
    if (material.readingProgress >= 100) {
      material.isCompleted = true;
    }
  }

  if (durationSeconds > 0) {
    material.studyTimeSeconds = (material.studyTimeSeconds || 0) + Number(durationSeconds);
    
    // Log activity
    await LearningActivity.create({
      user: req.user._id,
      activityType: 'read_material',
      material: material._id,
      durationSeconds: Number(durationSeconds),
      metadata: { progress: material.readingProgress },
    });
  }

  await material.save();

  return successResponse(res, { 
    readingProgress: material.readingProgress,
    isCompleted: material.isCompleted,
    studyTimeSeconds: material.studyTimeSeconds,
  });
};

/**
 * @desc    Delete study material
 * @route   DELETE /api/materials/:id
 * @access  Private
 */
const deleteMaterial = async (req, res) => {
  const material = await Material.findById(req.params.id);

  if (!material) {
    return errorResponse(res, 'Study material not found', 404);
  }

  if (material.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return errorResponse(res, 'Not authorized to delete this material', 403);
  }

  // If local file exists, remove it
  if (material.fileUrl) {
    const filePath = path.join(__dirname, '..', material.fileUrl);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.warn('Failed to delete physical file:', err.message);
      }
    }
  }

  await material.deleteOne();

  return successResponse(res, {}, 'Study material deleted successfully');
};

module.exports = {
  getMaterials,
  getMaterialById,
  createMaterial,
  updateMaterial,
  updateProgress,
  deleteMaterial,
};
