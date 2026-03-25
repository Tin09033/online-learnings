const { pool } = require('../config/database');

const getCourseHandouts = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    console.log('Fetching handouts for course:', courseId);
    console.log('User:', req.user?.id);

    const [handouts] = await pool.query(
      'SELECT * FROM handouts WHERE course_id = ? ORDER BY created_at DESC',
      [courseId]
    );

    res.json(handouts);
  } catch (error) {
    console.error('Get handouts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const addHandout = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, description } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'File is required' });
    }

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const [course] = await pool.query('SELECT id FROM courses WHERE id = ?', [courseId]);
    if (course.length === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const filePath = `/uploads/handouts/${req.file.filename}`;
    const fileType = req.file.mimetype;
    const fileSize = req.file.size;

    const [result] = await pool.query(
      'INSERT INTO handouts (course_id, title, file_path, file_type, file_size, description) VALUES (?, ?, ?, ?, ?, ?)',
      [courseId, title, filePath, fileType, fileSize, description || '']
    );

    res.status(201).json({
      message: 'Handout added successfully',
      handout: {
        id: result.insertId,
        title,
        file_path: filePath,
        file_type: fileType,
        file_size: fileSize,
        description
      }
    });
  } catch (error) {
    console.error('Add handout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateHandout = async (req, res) => {
  try {
    const { handoutId } = req.params;
    const { title, description } = req.body;

    const [handout] = await pool.query('SELECT * FROM handouts WHERE id = ?', [handoutId]);
    if (handout.length === 0) {
      return res.status(404).json({ message: 'Handout not found' });
    }

    const updates = {};
    if (title) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (req.file) {
      updates.file_path = `/uploads/handouts/${req.file.filename}`;
      updates.file_type = req.file.mimetype;
      updates.file_size = req.file.size;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No updates provided' });
    }

    const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), handoutId];

    await pool.query(`UPDATE handouts SET ${setClause} WHERE id = ?`, values);

    res.json({ message: 'Handout updated successfully' });
  } catch (error) {
    console.error('Update handout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteHandout = async (req, res) => {
  try {
    const { handoutId } = req.params;

    const [handout] = await pool.query('SELECT * FROM handouts WHERE id = ?', [handoutId]);
    if (handout.length === 0) {
      return res.status(404).json({ message: 'Handout not found' });
    }

    await pool.query('DELETE FROM handouts WHERE id = ?', [handoutId]);

    res.json({ message: 'Handout deleted successfully' });
  } catch (error) {
    console.error('Delete handout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getStudentHandouts = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const [enrollment] = await pool.query(
      'SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?',
      [userId, courseId]
    );

    if (enrollment.length === 0) {
      return res.status(403).json({ message: 'Not enrolled in this course' });
    }

    const [handouts] = await pool.query(
      'SELECT * FROM handouts WHERE course_id = ? ORDER BY created_at DESC',
      [courseId]
    );

    res.json(handouts);
  } catch (error) {
    console.error('Get student handouts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getCourseHandouts,
  addHandout,
  updateHandout,
  deleteHandout,
  getStudentHandouts
};
