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
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/handouts'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/gif'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, DOCX, XLS, XLSX, TXT, JPG, PNG, and GIF are allowed.'), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
});

router.get('/courses/:courseId/handouts', auth, getCourseHandouts);
router.post('/courses/:courseId/handouts', auth, admin, upload.single('file'), addHandout);
router.put('/handouts/:handoutId', auth, admin, upload.single('file'), updateHandout);
router.delete('/handouts/:handoutId', auth, admin, deleteHandout);
router.get('/courses/:courseId/student-handouts', auth, getStudentHandouts);

module.exports = router;
