const express = require('express');
const router = express.Router();
const {
  getMyTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  toggleTodo
} = require('../controllers/studentTodoController');
const { auth } = require('../middleware/auth');

router.get('/my', auth, getMyTodos);
router.post('/', auth, createTodo);
router.put('/:id', auth, updateTodo);
router.delete('/:id', auth, deleteTodo);
router.put('/:id/toggle', auth, toggleTodo);

module.exports = router;
