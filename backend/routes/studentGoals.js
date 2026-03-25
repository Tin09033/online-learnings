const express = require('express');
const router = express.Router();
const {
  getMyGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  updateProgress
} = require('../controllers/studentGoalController');
const { auth } = require('../middleware/auth');

router.get('/my', auth, getMyGoals);
router.post('/', auth, createGoal);
router.put('/:id', auth, updateGoal);
router.delete('/:id', auth, deleteGoal);
router.put('/:id/progress', auth, updateProgress);

module.exports = router;
