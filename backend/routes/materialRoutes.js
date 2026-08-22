const express = require('express');
const router = express.Router();
const {
  getMaterials,
  getMaterialById,
  createMaterial,
  updateMaterial,
  updateProgress,
  deleteMaterial,
} = require('../controllers/materialController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect);

router.route('/')
  .get(getMaterials)
  .post(upload.single('file'), createMaterial);

router.route('/:id')
  .get(getMaterialById)
  .put(updateMaterial)
  .delete(deleteMaterial);

router.post('/:id/progress', updateProgress);

module.exports = router;
