const express = require('express');
const router = express.Router();
const {
  getAllPaths,
  getMyPaths,
  getPathDetails,
  enrollInPath,
  unenrollFromPath
} = require('../controllers/learningPathController');
const { auth } = require('../middleware/auth');

router.get('/all', auth, getAllPaths);
router.get('/my', auth, getMyPaths);
router.get('/:id', auth, getPathDetails);
router.post('/:id/enroll', auth, enrollInPath);
router.delete('/:id/enroll', auth, unenrollFromPath);

module.exports = router;
