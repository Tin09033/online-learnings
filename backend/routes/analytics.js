const express = require('express');
const router = express.Router();
const {
  getCourseAnalytics,
  getStudentAnalytics,
  getDashboardAnalytics
} = require('../controllers/analyticsController');
const { auth, admin } = require('../middleware/auth');

router.get('/dashboard', auth, admin, getDashboardAnalytics);
router.get('/courses/:courseId', auth, admin, getCourseAnalytics);
router.get('/students/:studentId', auth, admin, getStudentAnalytics);

module.exports = router;
