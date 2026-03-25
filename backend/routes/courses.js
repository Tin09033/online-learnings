const express = require('express');
const router = express.Router();
const {
  getAllCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  updateCourseStatus
} = require('../controllers/courseController');
const { auth, admin } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.get('/', getAllCourses);
router.get('/:id', auth, getCourse);
router.post('/', auth, admin, upload.single('image'), createCourse);
router.put('/:id', auth, admin, upload.single('image'), updateCourse);
router.put('/:id/status', auth, admin, updateCourseStatus);
router.delete('/:id', auth, admin, deleteCourse);

module.exports = router;
