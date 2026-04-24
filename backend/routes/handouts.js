const express = require('express');
const router = express.Router();
const {
  getCourseHandouts,
  addHandout,
  updateHandout,
  deleteHandout,
  getStudentHandouts
} = require('../controllers/handoutController');
const { auth, admin } = require('../middleware/auth');
const { uploadHandout } = require('../middleware/upload');

router.get('/courses/:courseId/handouts', auth, getCourseHandouts);
router.post('/courses/:courseId/handouts', auth, admin, uploadHandout.single('file'), addHandout);
router.put('/handouts/:handoutId', auth, admin, uploadHandout.single('file'), updateHandout);
router.delete('/handouts/:handoutId', auth, admin, deleteHandout);
router.get('/courses/:courseId/student-handouts', auth, getStudentHandouts);

module.exports = router;
