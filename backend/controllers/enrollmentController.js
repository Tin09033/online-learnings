const { pool } = require('../config/database');

const enroll = async (req, res) => {
  try {
    const { course_id } = req.body;

    if (!course_id) {
      return res.status(400).json({ message: 'Course ID is required' });
    }

    const [courseCheck] = await pool.query('SELECT id FROM courses WHERE id = ?', [course_id]);
    if (courseCheck.length === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const [existing] = await pool.query(
      'SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?',
      [req.user.id, course_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    const [result] = await pool.query(
      'INSERT INTO enrollments (user_id, course_id, status) VALUES (?, ?, ?)',
      [req.user.id, course_id, 'pending']
    );

    await pool.query(
      `INSERT INTO notifications (user_id, type, title, message, course_id, enrollment_id) VALUES (?, 'enrollment_pending', 'Enrollment Pending', 'Your enrollment is pending payment confirmation. Please upload your payment proof.', ?, ?)`,
      [req.user.id, course_id, result.insertId]
    );

    res.status(201).json({
      message: 'Enrolled successfully. Please upload payment proof.',
      enrollment: { id: result.insertId, user_id: req.user.id, course_id, status: 'pending' }
    });
  } catch (error) {
    console.error('Enrollment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getMyEnrollments = async (req, res) => {
  try {
    const [enrollments] = await pool.query(`
      SELECT e.id as enrollment_id, e.user_id, e.course_id, e.status, e.progress, e.enrolled_at,
             c.id as course_id, c.title, c.description, c.image, c.image as course_image, c.amount as course_amount,
             u.name as instructor_name,
             (SELECT COUNT(*) FROM lessons WHERE course_id = c.id) as total_lessons,
             (SELECT p.status FROM payments p WHERE p.enrollment_id = e.id ORDER BY p.created_at DESC LIMIT 1) as payment_status,
             (SELECT p.proof_path FROM payments p WHERE p.enrollment_id = e.id ORDER BY p.created_at DESC LIMIT 1) as payment_proof,
             (SELECT ccl.class_link FROM course_class_links ccl WHERE ccl.course_id = c.id ORDER BY ccl.created_at DESC LIMIT 1) as class_link,
             (SELECT ccl.scheduled_at FROM course_class_links ccl WHERE ccl.course_id = c.id ORDER BY ccl.created_at DESC LIMIT 1) as class_scheduled_at
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      LEFT JOIN users u ON c.created_by = u.id
      WHERE e.user_id = ?
      ORDER BY e.enrolled_at DESC
    `, [req.user.id]);

    res.json(enrollments);
  } catch (error) {
    console.error('Get enrollments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { progress } = req.body;

    const [enrollment] = await pool.query(
      'SELECT * FROM enrollments WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (enrollment.length === 0) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    const status = progress >= 100 ? 'completed' : 'active';

    await pool.query(
      'UPDATE enrollments SET progress = ?, status = ? WHERE id = ?',
      [progress, status, id]
    );

    res.json({ message: 'Progress updated successfully' });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAllEnrollments = async (req, res) => {
  try {
    const [enrollments] = await pool.query(`
      SELECT e.*, u.name as user_name, u.email as user_email,
             c.title as course_title,
             (SELECT p.status FROM payments p WHERE p.enrollment_id = e.id ORDER BY p.created_at DESC LIMIT 1) as payment_status,
             (SELECT p.proof_path FROM payments p WHERE p.enrollment_id = e.id ORDER BY p.created_at DESC LIMIT 1) as payment_proof
      FROM enrollments e
      JOIN users u ON e.user_id = u.id
      JOIN courses c ON e.course_id = c.id
      ORDER BY e.enrolled_at DESC
    `);

    res.json(enrollments);
  } catch (error) {
    console.error('Get all enrollments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  enroll,
  getMyEnrollments,
  updateProgress,
  getAllEnrollments
};
