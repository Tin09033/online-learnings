const { pool } = require('../config/database');
const jwt = require('jsonwebtoken');const getAllCourses = async (req, res) => {
  try {
    const { search, page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;

    let isAdmin = false;
    const authHeader = req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded && decoded.role === 'admin') {
          isAdmin = true;
        }
      } catch (error) {
        // Ignore token errors for public route
      }
    }

    let query = `
      SELECT c.*, u.name as instructor_name, 
             (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id) as enrollment_count,
             (SELECT COUNT(*) FROM lessons WHERE course_id = c.id) as lesson_count
      FROM courses c
      LEFT JOIN users u ON c.created_by = u.id
    `;
    const params = [];

    if (!isAdmin) {
      query += ` WHERE c.status = 'published'`;
    }

    if (search) {
      if (!isAdmin) {
        query += ' AND (c.title LIKE ? OR c.description LIKE ?)';
      } else {
        query += ' WHERE (c.title LIKE ? OR c.description LIKE ?)';
      }
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY c.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [courses] = await pool.query(query, params);

    let countQuery = "SELECT COUNT(*) as total FROM courses";
    const countParams = [];

    if (!isAdmin) {
      countQuery += " WHERE status = 'published'";
    }

    if (search) {
      if (!isAdmin) {
        countQuery += " AND (title LIKE ? OR description LIKE ?)";
      } else {
        countQuery += " WHERE (title LIKE ? OR description LIKE ?)";
      }
      countParams.push(`%${search}%`, `%${search}%`);
    }

    const [countResult] = await pool.query(countQuery, countParams);

    res.json({
      courses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const [courses] = await pool.query(`
      SELECT c.*, u.name as instructor_name,
             (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id) as enrollment_count,
             (SELECT COUNT(*) FROM lessons WHERE course_id = c.id) as lesson_count
      FROM courses c
      LEFT JOIN users u ON c.created_by = u.id
      WHERE c.id = ?
    `, [id]);

    if (courses.length === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const [lessons] = await pool.query(
      'SELECT * FROM lessons WHERE course_id = ? ORDER BY order_num ASC',
      [id]
    );

    let enrollment = null;
    let lessonProgress = {};
    let completedLessonsCount = 0;
    let lastIncompleteLesson = null;

    if (req.user) {
      const [enrollments] = await pool.query(
        'SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?',
        [req.user.id, id]
      );
      enrollment = enrollments[0] || null;

      if (enrollment) {
        const [progress] = await pool.query(
          `SELECT lp.lesson_id, lp.completed, lp.completed_at
           FROM lesson_progress lp
           WHERE lp.user_id = ? AND lp.lesson_id IN (SELECT id FROM lessons WHERE course_id = ?)`,
          [req.user.id, id]
        );

        progress.forEach(p => {
          lessonProgress[p.lesson_id] = {
            completed: p.completed === 1,
            completedAt: p.completed_at
          };
        });

        completedLessonsCount = progress.filter(p => p.completed === 1).length;

        const [lastLesson] = await pool.query(
          `SELECT l.id, l.title
           FROM lessons l
           LEFT JOIN lesson_progress lp ON l.id = lp.lesson_id AND lp.user_id = ?
           WHERE l.course_id = ? AND (lp.completed = 0 OR lp.completed IS NULL)
           ORDER BY l.order_num ASC
           LIMIT 1`,
          [req.user.id, id]
        );

        if (lastLesson.length > 0) {
          lastIncompleteLesson = lastLesson[0];
        }
      }
    }

    res.json({
      ...courses[0],
      lessons,
      enrollment,
      lessonProgress,
      completedLessonsCount,
      lastIncompleteLesson
    });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createCourse = async (req, res) => {
  try {
    const { title, description, amount, status } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const courseAmount = amount !== undefined && amount !== '' ? parseFloat(amount) : 0;

    const [result] = await pool.query(
      'INSERT INTO courses (title, description, amount, image, status, created_by) VALUES (?, ?, ?, ?, ?, ?)',
      [title, description, courseAmount, image, status || 'draft', req.user.id]
    );

    res.status(201).json({
      message: 'Course created successfully',
      course: { id: result.insertId, title, description, amount: courseAmount, image, status: status || 'draft' }
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, amount } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : req.body.existingImage;

    const [existing] = await pool.query('SELECT * FROM courses WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const courseAmount = amount !== undefined && amount !== '' ? parseFloat(amount) : 0;

    await pool.query(
      'UPDATE courses SET title = ?, description = ?, amount = ?, image = ? WHERE id = ?',
      [title, description, courseAmount, image, id]
    );

    res.json({ message: 'Course updated successfully' });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT * FROM courses WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }

    await pool.query('DELETE FROM courses WHERE id = ?', [id]);

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateCourseStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['draft', 'published'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be draft or published' });
    }

    const [existing] = await pool.query('SELECT * FROM courses WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }

    await pool.query('UPDATE courses SET status = ? WHERE id = ?', [status, id]);

    res.json({ message: 'Course status updated successfully' });
  } catch (error) {
    console.error('Update course status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  updateCourseStatus
};
