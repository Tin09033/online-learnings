const express = require('express');
const router = express.Router();
const {
  createClassLink,
  getClassLinks,
  getStudentClassLinks,
  getMyClassLink,
  deleteClassLink
} = require('../controllers/classLinkController');
const { auth, admin } = require('../middleware/auth');

router.post('/', auth, createClassLink);
router.get('/course/:courseId', auth, getClassLinks);
router.get('/my', auth, getStudentClassLinks);
router.get('/course/:courseId/my', auth, getMyClassLink);
router.delete('/:id', auth, admin, deleteClassLink);

module.exports = router;
