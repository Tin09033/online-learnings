const { pool } = require('../config/database');

const markLessonComplete = async (req, res) => {
  try {
    const { lessonId } = req.params;

    const [lesson] = await pool.query(
      'SELECT * FROM lessons WHERE id = ?',
      [lessonId]
    );

    if (lesson.length === 0) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    const courseId = lesson[0].course_id;

    const [enrollment] = await pool.query(
      'SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?',
      [req.user.id, courseId]
    );

    if (enrollment.length === 0) {
      return res.status(403).json({ message: 'Not enrolled in this course' });
    }

    await pool.query(
      `INSERT INTO lesson_progress (user_id, lesson_id, completed, completed_at)
       VALUES (?, ?, 1, NOW())
       ON DUPLICATE KEY UPDATE completed = 1, completed_at = NOW()`,
      [req.user.id, lessonId]
    );

    const [totalLessons] = await pool.query(
      'SELECT COUNT(*) as total FROM lessons WHERE course_id = ?',
      [courseId]
    );

    const [completedLessons] = await pool.query(
      `SELECT COUNT(*) as completed FROM lesson_progress lp
       JOIN lessons l ON lp.lesson_id = l.id
       WHERE lp.user_id = ? AND l.course_id = ? AND lp.completed = 1`,
      [req.user.id, courseId]
    );

    const progress = Math.round((completedLessons[0].completed / totalLessons[0].total) * 100);
    const status = progress >= 100 ? 'completed' : 'active';

    await pool.query(
      'UPDATE enrollments SET progress = ?, status = ? WHERE user_id = ? AND course_id = ?',
      [progress, status, req.user.id, courseId]
    );

    res.json({
      message: 'Lesson marked as complete',
      progress,
      status,
      completedLessons: completedLessons[0].completed,
      totalLessons: totalLessons[0].total
    });
  } catch (error) {
    console.error('Mark lesson complete error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const markLessonIncomplete = async (req, res) => {
  try {
    const { lessonId } = req.params;

    await pool.query(
      'DELETE FROM lesson_progress WHERE user_id = ? AND lesson_id = ?',
      [req.user.id, lessonId]
    );

    const [lesson] = await pool.query(
      'SELECT course_id FROM lessons WHERE id = ?',
      [lessonId]
    );

    if (lesson.length > 0) {
      const courseId = lesson[0].course_id;

      const [totalLessons] = await pool.query(
        'SELECT COUNT(*) as total FROM lessons WHERE course_id = ?',
        [courseId]
      );

      const [completedLessons] = await pool.query(
        `SELECT COUNT(*) as completed FROM lesson_progress lp
         JOIN lessons l ON lp.lesson_id = l.id
         WHERE lp.user_id = ? AND l.course_id = ? AND lp.completed = 1`,
        [req.user.id, courseId]
      );

      const progress = Math.round((completedLessons[0].completed / totalLessons[0].total) * 100);
      const status = progress >= 100 ? 'completed' : 'active';

      await pool.query(
        'UPDATE enrollments SET progress = ?, status = ? WHERE user_id = ? AND course_id = ?',
        [progress, status, req.user.id, courseId]
      );

      res.json({
        message: 'Lesson marked as incomplete',
        progress,
        status
      });
    } else {
      res.json({ message: 'Lesson marked as incomplete' });
    }
  } catch (error) {
    console.error('Mark lesson incomplete error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getLessonProgress = async (req, res) => {
  try {
    const { lessonId } = req.params;

    const [progress] = await pool.query(
      'SELECT * FROM lesson_progress WHERE user_id = ? AND lesson_id = ?',
      [req.user.id, lessonId]
    );

    res.json({
      completed: progress.length > 0 ? progress[0].completed === 1 : false,
      completedAt: progress.length > 0 ? progress[0].completed_at : null
    });
  } catch (error) {
    console.error('Get lesson progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getCourseLessonProgress = async (req, res) => {
  try {
    const { courseId } = req.params;

    const [progress] = await pool.query(
      `SELECT lp.lesson_id, lp.completed, lp.completed_at
       FROM lesson_progress lp
       JOIN lessons l ON lp.lesson_id = l.id
       WHERE lp.user_id = ? AND l.course_id = ?`,
      [req.user.id, courseId]
    );

    const progressMap = {};
    progress.forEach(p => {
      progressMap[p.lesson_id] = {
        completed: p.completed === 1,
        completedAt: p.completed_at
      };
    });

    res.json(progressMap);
  } catch (error) {
    console.error('Get course lesson progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getLastIncompleteLesson = async (req, res) => {
  try {
    const { courseId } = req.params;

    const [lastLesson] = await pool.query(
      `SELECT l.id, l.title
       FROM lessons l
       LEFT JOIN lesson_progress lp ON l.id = lp.lesson_id AND lp.user_id = ?
       WHERE l.course_id = ? AND (lp.completed = 0 OR lp.completed IS NULL)
       ORDER BY l.order_num ASC
       LIMIT 1`,
      [req.user.id, courseId]
    );

    if (lastLesson.length > 0) {
      res.json({ lessonId: lastLesson[0].id, title: lastLesson[0].title });
    } else {
      const [firstLesson] = await pool.query(
        'SELECT id, title FROM lessons WHERE course_id = ? ORDER BY order_num ASC LIMIT 1',
        [courseId]
      );
      res.json(firstLesson.length > 0 ? { lessonId: firstLesson[0].id, title: firstLesson[0].title } : null);
    }
  } catch (error) {
    console.error('Get last incomplete lesson error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  markLessonComplete,
  markLessonIncomplete,
  getLessonProgress,
  getCourseLessonProgress,
  getLastIncompleteLesson
};
