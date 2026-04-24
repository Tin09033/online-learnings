const express = require('express');
const router = express.Router();
const { getPaymentSettings, updatePaymentSettings } = require('../controllers/paymentSettingsController');
const { auth, admin } = require('../middleware/auth');
const { uploadCourseImage: upload } = require('../middleware/upload');

router.get('/settings', getPaymentSettings);
router.put('/settings', auth, admin, upload.single('qr_code'), updatePaymentSettings);

module.exports = router;
