const express = require('express');
const router = express.Router();
const {
  markLessonComplete,
  markLessonIncomplete,
  getLessonProgress,
  getCourseLessonProgress,
  getLastIncompleteLesson
} = require('../controllers/lessonProgressController');
const { auth } = require('../middleware/auth');

router.post('/lessons/:lessonId/complete', auth, markLessonComplete);
router.delete('/lessons/:lessonId/complete', auth, markLessonIncomplete);
router.get('/lessons/:lessonId/progress', auth, getLessonProgress);
router.get('/courses/:courseId/lesson-progress', auth, getCourseLessonProgress);
router.get('/courses/:courseId/last-lesson', auth, getLastIncompleteLesson);

module.exports = router;
