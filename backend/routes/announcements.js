const express = require('express');
const router = express.Router();
const {
  getAllAnnouncements,
  getCourseAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getStudentAnnouncements
} = require('../controllers/announcementController');
const { auth, admin } = require('../middleware/auth');

router.get('/', auth, admin, getAllAnnouncements);
router.get('/courses/:courseId', getCourseAnnouncements);
router.post('/', auth, admin, createAnnouncement);
router.put('/:id', auth, admin, updateAnnouncement);
router.delete('/:id', auth, admin, deleteAnnouncement);
router.get('/student', auth, getStudentAnnouncements);
router.get('/student/all', auth, getStudentAnnouncements);

module.exports = router;
