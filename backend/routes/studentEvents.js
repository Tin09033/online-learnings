const express = require('express');
const router = express.Router();
const {
  getMyEvents,
  createEvent,
  updateEvent,
  deleteEvent
} = require('../controllers/studentEventController');
const { auth } = require('../middleware/auth');

router.get('/my', auth, getMyEvents);
router.post('/', auth, createEvent);
router.put('/:id', auth, updateEvent);
router.delete('/:id', auth, deleteEvent);

module.exports = router;
