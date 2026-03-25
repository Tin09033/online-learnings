const express = require('express');
const router = express.Router();
const {
  getLessons,
  createLesson,
  updateLesson,
  deleteLesson
} = require('../controllers/lessonController');
const { auth, admin } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedVideoTypes = /mp4|mpeg4|webm|mov|avi|mkv|wmv/;
  const allowedDocTypes = /pdf|doc|docx|xls|xlsx|txt/;
  const extname = path.extname(file.originalname).toLowerCase().slice(1);
  
  const isVideo = allowedVideoTypes.test(extname);
  const isDoc = allowedDocTypes.test(extname);
  
  if (isVideo || isDoc) {
    return cb(null, true);
  }
  cb(new Error('Only video or document files are allowed!'));
};

const uploadFiles = multer({
  storage,
  fileFilter,
  limits: { fileSize: 500 * 1024 * 1024 }
});

router.get('/courses/:courseId/lessons', auth, getLessons);
router.post('/courses/:courseId/lessons', auth, admin, uploadFiles.any(), createLesson);
router.put('/lessons/:id', auth, admin, uploadFiles.any(), updateLesson);
router.delete('/lessons/:id', auth, admin, deleteLesson);

module.exports = router;
