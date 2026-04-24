const express = require('express');
const router = express.Router();
const { register, login, refreshToken, logout, getMe, updateProfile, changePassword, updateAvatar, updateNotifications, getLearningStats } = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const { registerValidation, loginValidation, updateProfileValidation, changePasswordValidation } = require('../middleware/validation');
const { uploadAvatar } = require('../middleware/upload');

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);
router.get('/me', auth, getMe);
router.put('/profile', auth, updateProfileValidation, updateProfile);
router.put('/password', auth, changePasswordValidation, changePassword);
router.post('/avatar', auth, uploadAvatar.single('avatar'), updateAvatar);
router.put('/notifications', auth, updateNotifications);
router.get('/learning-stats', auth, getLearningStats);

module.exports = router;
