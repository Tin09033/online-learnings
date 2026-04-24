const express = require('express');
const router = express.Router();
const {
  getLessons,
  createLesson,
  updateLesson,
  deleteLesson
} = require('../controllers/lessonController');
const { auth, admin } = require('../middleware/auth');
const { uploadFiles } = require('../middleware/upload');

router.get('/courses/:courseId/lessons', auth, getLessons);
router.post('/courses/:courseId/lessons', auth, admin, uploadFiles.any(), createLesson);
router.put('/lessons/:id', auth, admin, uploadFiles.any(), updateLesson);
router.delete('/lessons/:id', auth, admin, deleteLesson);

module.exports = router;
