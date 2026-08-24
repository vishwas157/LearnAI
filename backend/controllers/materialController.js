const Material = require('../models/Material');
const LearningActivity = require('../models/LearningActivity');
const demoStore = require('../services/demoStore');
const { isDBConnected } = require('../config/db');
const { extractTextFromPDF } = require('../services/pdfService');
const { successResponse, errorResponse } = require('../utils/responseHelper');
const fs = require('fs');
const path = require('path');

const isDemoUser = (req) => {
  if (!isDBConnected()) return true;
  if (req.user?.isDemo) return true;
  const idStr = (req.user?._id || req.user?.id || '').toString();
  return idStr.startsWith('local-') || idStr.startsWith('demo-') || idStr.startsWith('user-');
};

/**
 * @desc    Get all study materials for logged in user (and platform library materials)
 * @route   GET /api/materials
 * @access  Private
 */
const getMaterials = async (req, res) => {
  const { subject, search, sort = '-createdAt' } = req.query;

  if (isDemoUser(req)) {
    const materials = demoStore.getMaterials({ subject, search });
    return successResponse(res, { materials, count: materials.length });
  }

  const query = {};

  if (subject && subject !== 'All' && subject !== 'all') {
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
  if (isDemoUser(req) || req.params.id.startsWith('mat-')) {
    const material = demoStore.getMaterialById(req.params.id);
    if (!material) {
      return errorResponse(res, 'Study material not found', 404);
    }
    return successResponse(res, { material });
  }


  const material = await Material.findById(req.params.id).populate('uploadedBy', 'name email');

  if (!material) {
    return errorResponse(res, 'Study material not found', 404);
  }

  // Log learning activity for reading material
  try {
    await LearningActivity.create({
      user: req.user._id,
      activityType: 'read_material',
      material: material._id,
      durationSeconds: 60,
      metadata: { title: material.title, subject: material.subject },
    });
  } catch (err) {
    // Non-blocking activity logging
  }

  return successResponse(res, { material });
};

/**
 * @desc    Create / Upload new study material (PDF, TXT, or Manual text)
 * @route   POST /api/materials
 * @access  Private
 */
const createMaterial = async (req, res) => {
  let { title, description, subject, content, textContent, tags } = req.body;
  let fileName = null;
  let fileType = 'manual';
  let fileSize = 0;
  let fileUrl = null;

  if (textContent && !content) {
    content = textContent;
  }

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

  if (isDemoUser(req)) {
    const material = demoStore.createMaterial({
      title,
      description: description || '',
      subject: subject || 'General',
      content,
      fileName,
      fileType,
      fileSize,
      fileUrl,
      tags: parsedTags,
    }, req.user);

    return successResponse(res, { material }, 'Study material uploaded successfully', 201);
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
  try {
    await LearningActivity.create({
      user: req.user._id,
      activityType: 'read_material',
      material: material._id,
      durationSeconds: 30,
      metadata: { title: material.title, action: 'created' },
    });
  } catch (err) {}

  return successResponse(res, { material }, 'Study material uploaded successfully', 201);
};

/**
 * @desc    Update study material
 * @route   PUT /api/materials/:id
 * @access  Private
 */
const updateMaterial = async (req, res) => {
  const { title, description, subject, content, tags, readingProgress, isCompleted } = req.body;

  if (isDemoUser(req) || req.params.id.startsWith('mat-')) {
    const updateData = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (subject) updateData.subject = subject;
    if (content) updateData.content = content;
    if (tags) updateData.tags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());
    if (readingProgress !== undefined) {
      updateData.readingProgress = Math.min(100, Math.max(0, Number(readingProgress)));
      if (updateData.readingProgress >= 100) updateData.isCompleted = true;
    }
    if (isCompleted !== undefined) updateData.isCompleted = isCompleted;

    const material = demoStore.updateMaterial(req.params.id, updateData);
    if (!material) {
      return errorResponse(res, 'Study material not found', 404);
    }
    return successResponse(res, { material }, 'Material updated successfully');
  }

  const material = await Material.findById(req.params.id);

  if (!material) {
    return errorResponse(res, 'Study material not found', 404);
  }

  // Check ownership (or admin)
  if (material.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return errorResponse(res, 'Not authorized to edit this material', 403);
  }

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
  const { progress, durationSeconds = 0 } = req.body;

  if (isDemoUser(req) || req.params.id.startsWith('mat-')) {
    const current = demoStore.getMaterialById(req.params.id);
    if (!current) {
      return errorResponse(res, 'Material not found', 404);
    }

    const newProgress = progress !== undefined ? Math.min(100, Math.max(0, Number(progress))) : current.readingProgress;
    const isCompleted = newProgress >= 100;
    const studyTime = (current.studyTimeSeconds || 0) + Number(durationSeconds || 0);

    const updated = demoStore.updateMaterial(req.params.id, {
      readingProgress: newProgress,
      isCompleted,
      studyTimeSeconds: studyTime,
    });

    demoStore.logActivity({
      user: req.user._id,
      activityType: 'read_material',
      material: req.params.id,
      durationSeconds: Number(durationSeconds || 0),
      metadata: { progress: newProgress },
    });

    return successResponse(res, { material: updated }, 'Progress saved successfully');
  }

  const material = await Material.findById(req.params.id);

  if (!material) {
    return errorResponse(res, 'Material not found', 404);
  }

  const newProgress = progress !== undefined ? Math.min(100, Math.max(0, Number(progress))) : material.readingProgress;
  material.readingProgress = newProgress;

  if (newProgress >= 100) {
    material.isCompleted = true;
  }

  material.studyTimeSeconds = (material.studyTimeSeconds || 0) + Number(durationSeconds || 0);
  material.lastReadAt = new Date();

  await material.save();

  // Log activity
  if (durationSeconds > 0 || newProgress > 0) {
    try {
      await LearningActivity.create({
        user: req.user._id,
        activityType: 'read_material',
        material: material._id,
        durationSeconds: Number(durationSeconds || 0),
        metadata: { progress: newProgress },
      });
    } catch (err) {}
  }

  return successResponse(res, { material }, 'Progress saved successfully');
};

/**
 * @desc    Delete study material
 * @route   DELETE /api/materials/:id
 * @access  Private
 */
const deleteMaterial = async (req, res) => {
  if (isDemoUser(req) || req.params.id.startsWith('mat-')) {
    const deleted = demoStore.deleteMaterial(req.params.id);
    if (!deleted) {
      return errorResponse(res, 'Study material not found', 404);
    }
    return successResponse(res, {}, 'Study material deleted successfully');
  }

  const material = await Material.findById(req.params.id);

  if (!material) {
    return errorResponse(res, 'Study material not found', 404);
  }

  if (material.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return errorResponse(res, 'Not authorized to delete this material', 403);
  }

  // Remove uploaded file if exists
  if (material.fileUrl && material.fileUrl.startsWith('/uploads/')) {
    const filePath = path.join(__dirname, '..', material.fileUrl);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.warn('Failed to delete uploaded file from disk:', err.message);
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
