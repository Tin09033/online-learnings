const express = require('express');
const router = express.Router();
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

const { uploadPayment: uploadMiddleware } = require('../middleware/upload');

router.post('/', auth, uploadMiddleware.single('proof'), uploadPayment);
router.get('/my', auth, getMyPayments);
router.get('/enrollment/:enrollmentId', auth, getPaymentByEnrollment);
router.put('/:id/verify', auth, admin, verifyPayment);
router.get('/all', auth, admin, getAllPayments);
router.get('/pending', auth, admin, getPendingPayments);

module.exports = router;
