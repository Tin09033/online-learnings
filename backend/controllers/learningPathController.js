const logger = require('../utils/logger');
const { pool } = require('../config/database');

const getAllPaths = async (req, res) => {
  try {
    const [paths] = await pool.query(`
      SELECT lp.*, 
        (SELECT COUNT(*) FROM learning_path_courses WHERE learning_path_id = lp.id) as course_count,
        (SELECT COUNT(*) FROM learning_path_enrollments lpe WHERE lpe.learning_path_id = lp.id AND lpe.user_id = ?) as enrolled
      FROM learning_paths lp
      WHERE lp.status = 'published'
      ORDER BY lp.created_at DESC
    `, [req.user.id]);

    res.json(paths);
  } catch (error) {
    logger.error('Get learning paths error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getMyPaths = async (req, res) => {
  try {
    const [paths] = await pool.query(`
      SELECT lp.*, 
        lpe.progress,
        lpe.status as enrollment_status,
        lpe.enrolled_at,
        (SELECT COUNT(*) FROM learning_path_courses WHERE learning_path_id = lp.id) as total_courses,
        (SELECT COUNT(*) FROM learning_path_courses lpc 
         JOIN learning_path_enrollments le ON le.learning_path_id = lpc.learning_path_id
         JOIN enrollments e ON e.course_id = lpc.course_id AND e.user_id = le.user_id
         WHERE lpc.learning_path_id = lp.id AND le.user_id = ?) as completed_courses
      FROM learning_paths lp
      INNER JOIN learning_path_enrollments lpe ON lpe.learning_path_id = lp.id
      WHERE lpe.user_id = ?
      ORDER BY lpe.enrolled_at DESC
    `, [req.user.id, req.user.id]);

    res.json(paths);
  } catch (error) {
    logger.error('Get my learning paths error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getPathDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const [path] = await pool.query(`
      SELECT lp.*, 
        (SELECT COUNT(*) FROM learning_path_courses WHERE learning_path_id = lp.id) as course_count,
        (SELECT COUNT(*) FROM learning_path_enrollments WHERE learning_path_id = lp.id AND user_id = ?) as enrolled
      FROM learning_paths lp
      WHERE lp.id = ?
    `, [req.user.id, id]);

    if (path.length === 0) {
      return res.status(404).json({ message: 'Learning path not found' });
    }

    const [courses] = await pool.query(`
      SELECT c.*, lp_c.order_num,
        e.progress as enrollment_progress,
        e.status as enrollment_status,
        (SELECT COUNT(*) FROM lessons WHERE course_id = c.id) as lesson_count,
        (SELECT COUNT(*) FROM lesson_progress lp2 
         JOIN lessons l ON l.id = lp2.lesson_id 
         WHERE l.course_id = c.id AND lp2.user_id = ? AND lp2.completed = 1) as completed_lessons
      FROM learning_path_courses lp_c
      JOIN courses c ON c.id = lp_c.course_id
      LEFT JOIN enrollments e ON e.course_id = c.id AND e.user_id = ?
      WHERE lp_c.learning_path_id = ?
      ORDER BY lp_c.order_num
    `, [req.user.id, req.user.id, id]);

    res.json({
      ...path[0],
      courses
    });
  } catch (error) {
    logger.error('Get learning path details error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const enrollInPath = async (req, res) => {
  try {
    const { id } = req.params;

    const [path] = await pool.query('SELECT * FROM learning_paths WHERE id = ?', [id]);
    if (path.length === 0) {
      return res.status(404).json({ message: 'Learning path not found' });
    }

    const [existing] = await pool.query(
      'SELECT * FROM learning_path_enrollments WHERE learning_path_id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Already enrolled in this learning path' });
    }

    await pool.query(
      'INSERT INTO learning_path_enrollments (learning_path_id, user_id) VALUES (?, ?)',
      [id, req.user.id]
    );

    res.status(201).json({ message: 'Enrolled in learning path successfully' });
  } catch (error) {
    logger.error('Enroll in learning path error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const unenrollFromPath = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      'DELETE FROM learning_path_enrollments WHERE learning_path_id = ? AND user_id = ?',
      [id, req.user.id]
    );

    res.json({ message: 'Unenrolled from learning path successfully' });
  } catch (error) {
    logger.error('Unenroll from learning path error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllPaths,
  getMyPaths,
  getPathDetails,
  enrollInPath,
  unenrollFromPath
};

