const express = require('express');
const router = express.Router();
const {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount
} = require('../controllers/notificationController');
const { auth } = require('../middleware/auth');

router.get('/my', auth, getMyNotifications);
router.put('/:id/read', auth, markAsRead);
router.put('/read-all', auth, markAllAsRead);
router.get('/unread-count', auth, getUnreadCount);

module.exports = router;
