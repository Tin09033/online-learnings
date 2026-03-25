const { pool } = require('../config/database');

const createClassLink = async (req, res) => {
  try {
    const { course_id, class_link, scheduled_at, notes } = req.body;

    if (!course_id || !class_link) {
      return res.status(400).json({ message: 'Course ID and class link are required' });
    }

    const [result] = await pool.query(
      `INSERT INTO course_class_links (course_id, class_link, scheduled_at, notes, created_by) VALUES (?, ?, ?, ?, ?)`,
      [course_id, class_link, scheduled_at || null, notes || '', req.user.id]
    );

    const [enrolledStudents] = await pool.query(
      `SELECT user_id FROM enrollments WHERE course_id = ? AND status = 'active'`,
      [course_id]
    );

    for (const student of enrolledStudents) {
      await pool.query(
        `INSERT INTO notifications (user_id, type, title, message, course_id, enrollment_id, class_link) VALUES (?, 'class_link', 'Class Link Available!', 'The instructor has posted a new class link for your enrolled course.', ?, NULL, ?)`,
        [student.user_id, course_id, class_link]
      );
    }

    res.status(201).json({
      message: 'Class link created and notifications sent',
      classLink: { id: result.insertId, course_id, class_link, scheduled_at }
    });
  } catch (error) {
    console.error('Create class link error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getClassLinks = async (req, res) => {
  try {
    const { courseId } = req.params;

    const [links] = await pool.query(
      `SELECT ccl.*, u.name as created_by_name 
       FROM course_class_links ccl 
       LEFT JOIN users u ON ccl.created_by = u.id 
       WHERE ccl.course_id = ? 
       ORDER BY ccl.created_at DESC`,
      [courseId]
    );

    res.json(links);
  } catch (error) {
    console.error('Get class links error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getStudentClassLinks = async (req, res) => {
  try {
    const [links] = await pool.query(
      `SELECT ccl.*, c.title as course_title
       FROM course_class_links ccl
       JOIN courses c ON ccl.course_id = c.id
       JOIN enrollments e ON e.course_id = c.id AND e.user_id = ? AND e.status = 'active'
       ORDER BY ccl.created_at DESC`
    , [req.user.id]);

    res.json(links);
  } catch (error) {
    console.error('Get student class links error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getMyClassLink = async (req, res) => {
  try {
    const { courseId } = req.params;

    const [link] = await pool.query(
      `SELECT ccl.*, c.title as course_title
       FROM course_class_links ccl
       JOIN courses c ON ccl.course_id = c.id
       JOIN enrollments e ON e.course_id = c.id AND e.user_id = ? AND e.status = 'active'
       WHERE ccl.course_id = ?
       ORDER BY ccl.created_at DESC
       LIMIT 1`,
      [req.user.id, courseId]
    );

    if (link.length === 0) {
      return res.status(404).json({ message: 'No class link available for this course' });
    }

    res.json(link[0]);
  } catch (error) {
    console.error('Get my class link error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteClassLink = async (req, res) => {
  try {
    const { id } = req.params;

    const [link] = await pool.query('SELECT * FROM course_class_links WHERE id = ?', [id]);
    if (link.length === 0) {
      return res.status(404).json({ message: 'Class link not found' });
    }

    await pool.query('DELETE FROM course_class_links WHERE id = ?', [id]);
    res.json({ message: 'Class link deleted successfully' });
  } catch (error) {
    console.error('Delete class link error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createClassLink,
  getClassLinks,
  getStudentClassLinks,
  getMyClassLink,
  deleteClassLink
};
