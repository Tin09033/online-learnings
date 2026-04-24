const logger = require('../utils/logger');
const { pool } = require('../config/database');

const getCourseAnalytics = async (req, res) => {
  try {
    const { courseId } = req.params;

    const [course] = await pool.query(
      `SELECT c.*, u.name as instructor_name,
              (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id) as total_enrollments,
              (SELECT COUNT(*) FROM lessons WHERE course_id = c.id) as total_lessons
       FROM courses c
       LEFT JOIN users u ON c.created_by = u.id
       WHERE c.id = ?`,
      [courseId]
    );

    if (course.length === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const [enrollmentStats] = await pool.query(
      `SELECT 
         COUNT(*) as total_students,
         SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_students,
         SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_students,
         AVG(progress) as average_progress
       FROM enrollments WHERE course_id = ?`,
      [courseId]
    );

    const [lessonStats] = await pool.query(
      `SELECT l.id, l.title, l.order_num,
              (SELECT COUNT(*) FROM lesson_progress lp WHERE lp.lesson_id = l.id AND lp.completed = 1) as completion_count
       FROM lessons l
       WHERE l.course_id = ?
       ORDER BY l.order_num`,
      [courseId]
    );

    const [recentEnrollments] = await pool.query(
      `SELECT e.*, u.name as student_name, u.email as student_email
       FROM enrollments e
       JOIN users u ON e.user_id = u.id
       WHERE e.course_id = ?
       ORDER BY e.enrolled_at DESC
       LIMIT 10`,
      [courseId]
    );

    const [recentActivity] = await pool.query(
      `SELECT lp.*, u.name as student_name, l.title as lesson_title
       FROM lesson_progress lp
       JOIN users u ON lp.user_id = u.id
       JOIN lessons l ON lp.lesson_id = l.id
       WHERE l.course_id = ?
       ORDER BY lp.completed_at DESC
       LIMIT 10`,
      [courseId]
    );

    res.json({
      course: course[0],
      enrollmentStats: enrollmentStats[0],
      lessonStats,
      recentEnrollments,
      recentActivity
    });
  } catch (error) {
    logger.error('Get course analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getStudentAnalytics = async (req, res) => {
  try {
    const { studentId } = req.params;

    const [student] = await pool.query(
      'SELECT id, name, email, created_at FROM users WHERE id = ? AND role = "student"',
      [studentId]
    );

    if (student.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const [enrollments] = await pool.query(
      `SELECT e.*, c.title, c.image,
              (SELECT COUNT(*) FROM lessons WHERE course_id = c.id) as total_lessons
       FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       WHERE e.user_id = ?
       ORDER BY e.enrolled_at DESC`,
      [studentId]
    );

    const [completedLessons] = await pool.query(
      `SELECT lp.*, l.title as lesson_title, l.course_id, c.title as course_title
       FROM lesson_progress lp
       JOIN lessons l ON lp.lesson_id = l.id
       JOIN courses c ON l.course_id = c.id
       WHERE lp.user_id = ?
       ORDER BY lp.completed_at DESC`,
      [studentId]
    );

    const overallStats = {
      totalEnrolled: enrollments.length,
      totalCompleted: enrollments.filter(e => e.status === 'completed').length,
      totalInProgress: enrollments.filter(e => e.status === 'active').length,
      totalLessonsCompleted: completedLessons.length,
      averageProgress: enrollments.length > 0 
        ? Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length)
        : 0
    };

    res.json({
      student: student[0],
      enrollments,
      completedLessons,
      overallStats
    });
  } catch (error) {
    logger.error('Get student analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getDashboardAnalytics = async (req, res) => {
  try {
    const [courseStats] = await pool.query(
      `SELECT 
         COUNT(*) as total_courses,
         SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) as published_courses,
         SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft_courses
       FROM courses`
    );

    const [userStats] = await pool.query(
      `SELECT 
         COUNT(*) as total_users,
         SUM(CASE WHEN role = 'student' THEN 1 ELSE 0 END) as total_students,
         SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as total_admins
       FROM users`
    );

    const [enrollmentStats] = await pool.query(
      `SELECT 
         COUNT(*) as total_enrollments,
         SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_enrollments,
         AVG(progress) as average_progress
       FROM enrollments`
    );

    const [topCourses] = await pool.query(
      `SELECT c.id, c.title, c.image,
              COUNT(e.id) as enrollment_count,
              AVG(e.progress) as average_progress
       FROM courses c
       LEFT JOIN enrollments e ON c.id = e.course_id
       GROUP BY c.id
       ORDER BY enrollment_count DESC
       LIMIT 5`
    );

    const [recentActivity] = await pool.query(
      `SELECT 'enrollment' as type, e.id, e.enrolled_at as timestamp, u.name as user_name, c.title as target_name
       FROM enrollments e
       JOIN users u ON e.user_id = u.id
       JOIN courses c ON e.course_id = c.id
       UNION ALL
       SELECT 'completion' as type, lp.id, lp.completed_at as timestamp, u.name as user_name, l.title as target_name
       FROM lesson_progress lp
       JOIN users u ON lp.user_id = u.id
       JOIN lessons l ON lp.lesson_id = l.id
       WHERE lp.completed = 1
       ORDER BY timestamp DESC
       LIMIT 10`
    );

    res.json({
      courseStats: courseStats[0],
      userStats: userStats[0],
      enrollmentStats: enrollmentStats[0],
      topCourses,
      recentActivity
    });
  } catch (error) {
    logger.error('Get dashboard analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getCourseAnalytics,
  getStudentAnalytics,
  getDashboardAnalytics
};

