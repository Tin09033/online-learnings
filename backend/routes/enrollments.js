const express = require('express');
const router = express.Router();
const {
  enroll,
  getMyEnrollments,
  updateProgress,
  getAllEnrollments
} = require('../controllers/enrollmentController');
const { auth, admin } = require('../middleware/auth');

router.post('/', auth, enroll);
router.get('/my', auth, getMyEnrollments);
router.put('/:id/progress', auth, updateProgress);
router.get('/all', auth, admin, getAllEnrollments);

module.exports = router;
