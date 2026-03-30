const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { pool } = require('../config/database');
const {
  uploadPayment,
  getMyPayments,
  getPaymentByEnrollment,
  verifyPayment,
  getAllPayments,
  getPendingPayments
} = require('../controllers/paymentController');
const { auth, admin } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/payments'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'payment-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file) {
      return cb(null, false);
    }
    const filetypes = /jpeg|jpg|png|pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image (jpeg, jpg, png) and PDF files are allowed!'));
  }
});

router.post('/', auth, upload.single('proof'), uploadPayment);
router.get('/my', auth, getMyPayments);
router.get('/enrollment/:enrollmentId', auth, getPaymentByEnrollment);
router.put('/:id/verify', auth, admin, verifyPayment);
router.get('/all', auth, admin, getAllPayments);
router.get('/pending', auth, admin, getPendingPayments);

module.exports = router;
