const { pool } = require('../config/database');

const getMyGoals = async (req, res) => {
  try {
    const [goals] = await pool.query(`
      SELECT sg.*, c.title as course_title, c.image as course_image
      FROM student_goals sg
      LEFT JOIN courses c ON c.id = sg.linked_course_id
      WHERE sg.user_id = ?
      ORDER BY sg.created_at DESC
    `, [req.user.id]);

    res.json(goals);
  } catch (error) {
    console.error('Get goals error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createGoal = async (req, res) => {
  try {
    const { title, description, target_type, target_value, deadline, linked_course_id } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const [result] = await pool.query(
      `INSERT INTO student_goals (user_id, title, description, target_type, target_value, deadline, linked_course_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, title, description || null, target_type || 'custom', target_value || 100, deadline || null, linked_course_id || null]
    );

    res.status(201).json({
      id: result.insertId,
      user_id: req.user.id,
      title,
      description,
      target_type: target_type || 'custom',
      target_value: target_value || 100,
      current_value: 0,
      deadline,
      status: 'active',
      linked_course_id,
      created_at: new Date()
    });
  } catch (error) {
    console.error('Create goal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, target_type, target_value, current_value, deadline, status, linked_course_id } = req.body;

    const [goal] = await pool.query(
      'SELECT * FROM student_goals WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (goal.length === 0) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    await pool.query(`
      UPDATE student_goals 
      SET title = ?, description = ?, target_type = ?, target_value = ?, 
          current_value = ?, deadline = ?, status = ?, linked_course_id = ?
      WHERE id = ?
    `, [
      title || goal[0].title,
      description ?? goal[0].description,
      target_type || goal[0].target_type,
      target_value || goal[0].target_value,
      current_value ?? goal[0].current_value,
      deadline || goal[0].deadline,
      status || goal[0].status,
      linked_course_id ?? goal[0].linked_course_id,
      id
    ]);

    res.json({ message: 'Goal updated successfully' });
  } catch (error) {
    console.error('Update goal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteGoal = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      'DELETE FROM student_goals WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    console.error('Delete goal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { current_value } = req.body;

    const [goal] = await pool.query(
      'SELECT * FROM student_goals WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (goal.length === 0) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    const newValue = Math.min(current_value, goal[0].target_value);
    const newStatus = newValue >= goal[0].target_value ? 'completed' : 'active';

    await pool.query(
      'UPDATE student_goals SET current_value = ?, status = ? WHERE id = ?',
      [newValue, newStatus, id]
    );

    res.json({ message: 'Progress updated', current_value: newValue, status: newStatus });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getMyGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  updateProgress
};
