const { pool } = require('../config/database');

const getMyTodos = async (req, res) => {
  try {
    const [todos] = await pool.query(`
      SELECT * FROM student_todos
      WHERE user_id = ?
      ORDER BY created_at DESC
    `, [req.user.id]);

    res.json(todos);
  } catch (error) {
    console.error('Get todos error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createTodo = async (req, res) => {
  try {
    const { text, priority, due_date } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'Text is required' });
    }

    const [result] = await pool.query(
      'INSERT INTO student_todos (user_id, text, priority, due_date) VALUES (?, ?, ?, ?)',
      [req.user.id, text, priority || 'medium', due_date || null]
    );

    res.status(201).json({
      id: result.insertId,
      user_id: req.user.id,
      text,
      priority: priority || 'medium',
      due_date,
      completed: false,
      created_at: new Date()
    });
  } catch (error) {
    console.error('Create todo error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const { text, priority, due_date, completed } = req.body;

    const [todo] = await pool.query(
      'SELECT * FROM student_todos WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (todo.length === 0) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    await pool.query(
      'UPDATE student_todos SET text = ?, priority = ?, due_date = ?, completed = ? WHERE id = ?',
      [text || todo[0].text, priority || todo[0].priority, due_date || todo[0].due_date, completed ?? todo[0].completed, id]
    );

    res.json({ message: 'Todo updated successfully' });
  } catch (error) {
    console.error('Update todo error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteTodo = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      'DELETE FROM student_todos WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    console.error('Delete todo error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const toggleTodo = async (req, res) => {
  try {
    const { id } = req.params;

    const [todo] = await pool.query(
      'SELECT * FROM student_todos WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (todo.length === 0) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    await pool.query(
      'UPDATE student_todos SET completed = ? WHERE id = ?',
      [!todo[0].completed, id]
    );

    res.json({ message: 'Todo toggled successfully', completed: !todo[0].completed });
  } catch (error) {
    console.error('Toggle todo error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getMyTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  toggleTodo
};
