const { pool } = require('../config/database');

const getAllAnnouncements = async (req, res) => {
  try {
    const { courseId } = req.query;

    let query = `
      SELECT a.*, u.name as author_name, c.title as course_title
      FROM announcements a
      LEFT JOIN users u ON a.created_by = u.id
      LEFT JOIN courses c ON a.course_id = c.id
    `;
    const params = [];

    if (courseId) {
      query += ' WHERE a.course_id = ? OR a.course_id IS NULL';
      params.push(courseId);
    }

    query += ' ORDER BY CASE a.priority WHEN "urgent" THEN 1 WHEN "important" THEN 2 WHEN "normal" THEN 3 ELSE 4 END, a.created_at DESC';

    const [announcements] = await pool.query(query, params);

    const [announcementGroups] = await pool.query(`
      SELECT ag.announcement_id, sg.id as group_id, sg.name as group_name
      FROM announcement_groups ag
      JOIN student_groups sg ON ag.group_id = sg.id
    `);

    const groupsMap = {};
    announcementGroups.forEach(ag => {
      if (!groupsMap[ag.announcement_id]) {
        groupsMap[ag.announcement_id] = [];
      }
      groupsMap[ag.announcement_id].push({ id: ag.group_id, name: ag.group_name });
    });

    const announcementsWithGroups = announcements.map(a => ({
      ...a,
      groups: groupsMap[a.id] || []
    }));

    res.json(announcementsWithGroups);
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getCourseAnnouncements = async (req, res) => {
  try {
    const { courseId } = req.params;

    const [announcements] = await pool.query(
      `SELECT a.*, u.name as author_name
       FROM announcements a
       LEFT JOIN users u ON a.created_by = u.id
       WHERE (a.course_id = ? OR a.course_id IS NULL)
       AND (a.scheduled_at IS NULL OR a.scheduled_at <= NOW())
       ORDER BY CASE a.priority WHEN 'urgent' THEN 1 WHEN 'important' THEN 2 WHEN 'normal' THEN 3 ELSE 4 END, a.created_at DESC`,
      [courseId]
    );

    res.json(announcements);
  } catch (error) {
    console.error('Get course announcements error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createAnnouncement = async (req, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id INT PRIMARY KEY AUTO_INCREMENT,
        course_id INT,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        priority ENUM('normal', 'important', 'urgent') DEFAULT 'normal',
        created_by INT,
        scheduled_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS announcement_groups (
        id INT PRIMARY KEY AUTO_INCREMENT,
        announcement_id INT NOT NULL,
        group_id INT NOT NULL,
        FOREIGN KEY (announcement_id) REFERENCES announcements(id) ON DELETE CASCADE,
        FOREIGN KEY (group_id) REFERENCES student_groups(id) ON DELETE CASCADE,
        UNIQUE KEY unique_announcement_group (announcement_id, group_id)
      )
    `);

    const { course_id, title, content, priority, send_to_all, scheduled_at, group_ids } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    if (!send_to_all && !course_id && (!group_ids || group_ids.length === 0)) {
      return res.status(400).json({ message: 'please select course' });
    }

    const userId = req.user?.id || 1;
    let courseId = null;

    if (send_to_all) {
      courseId = null;
    } else if (course_id) {
      const [courses] = await pool.query('SELECT id FROM courses WHERE id = ?', [course_id]);
      if (courses.length === 0) {
        return res.status(400).json({ message: 'please select course' });
      }
      courseId = course_id;
    }

    const priorityValue = ['normal', 'important', 'urgent'].includes(priority) ? priority : 'normal';

    const [result] = await pool.query(
      'INSERT INTO announcements (course_id, title, content, priority, created_by, scheduled_at) VALUES (?, ?, ?, ?, ?, ?)',
      [courseId, title, content, priorityValue, userId, scheduled_at || null]
    );

    const announcementId = result.insertId;

    if (group_ids && group_ids.length > 0) {
      for (const gid of group_ids) {
        await pool.query(
          'INSERT IGNORE INTO announcement_groups (announcement_id, group_id) VALUES (?, ?)',
          [announcementId, gid]
        );
      }
    }

    if (send_to_all) {
      const [allStudents] = await pool.query(
        'SELECT id FROM users WHERE role = ?',
        ['student']
      );
      for (const student of allStudents) {
        await pool.query(
          'INSERT INTO notifications (user_id, type, title, message, course_id, enrollment_id, class_link) VALUES (?, ?, ?, ?, NULL, NULL, NULL)',
          [student.id, 'announcement', title, content]
        );
      }
    }

    if (course_id && !send_to_all && (!group_ids || group_ids.length === 0)) {
      const [courseStudents] = await pool.query(
        'SELECT DISTINCT user_id FROM enrollments WHERE course_id = ?',
        [course_id]
      );
      for (const student of courseStudents) {
        await pool.query(
          'INSERT INTO notifications (user_id, type, title, message, course_id, enrollment_id, class_link) VALUES (?, ?, ?, ?, ?, NULL, NULL)',
          [student.user_id, 'announcement', title, content, course_id]
        );
      }
    }

    res.status(201).json({
      message: scheduled_at ? 'Announcement scheduled successfully' : 'Announcement created successfully',
      announcement: {
        id: announcementId,
        course_id: courseId,
        title,
        content,
        priority: priorityValue,
        scheduled_at,
        group_ids: group_ids || []
      }
    });
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, priority, course_id, send_to_all, scheduled_at } = req.body;

    const [announcement] = await pool.query('SELECT * FROM announcements WHERE id = ?', [id]);
    if (announcement.length === 0) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    const updates = {};
    if (title) updates.title = title;
    if (content) updates.content = content;
    if (priority) updates.priority = priority;
    if (course_id !== undefined) updates.course_id = send_to_all ? null : course_id;
    if (scheduled_at !== undefined) updates.scheduled_at = scheduled_at || null;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No updates provided' });
    }

    const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), id];

    await pool.query(`UPDATE announcements SET ${setClause} WHERE id = ?`, values);

    res.json({ message: 'Announcement updated successfully' });
  } catch (error) {
    console.error('Update announcement error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    const [announcement] = await pool.query('SELECT * FROM announcements WHERE id = ?', [id]);
    if (announcement.length === 0) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    await pool.query('DELETE FROM announcements WHERE id = ?', [id]);

    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getStudentAnnouncements = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.query;

    let query = `
      SELECT DISTINCT a.*, u.name as author_name, c.title as course_title
      FROM announcements a
      LEFT JOIN users u ON a.created_by = u.id
      LEFT JOIN courses c ON a.course_id = c.id
      LEFT JOIN announcement_groups ag ON a.id = ag.announcement_id
      LEFT JOIN student_group_members sgm ON ag.group_id = sgm.group_id AND sgm.user_id = ?
      WHERE (
        a.course_id IS NULL 
        OR a.course_id IN (SELECT course_id FROM enrollments WHERE user_id = ?)
        OR sgm.user_id = ?
      )
      AND (a.scheduled_at IS NULL OR a.scheduled_at <= NOW())
    `;
    const params = [userId, userId, userId];

    if (courseId) {
      query += ' OR a.course_id = ?';
      params.push(courseId);
    }

    query += ' ORDER BY CASE a.priority WHEN "urgent" THEN 1 WHEN "important" THEN 2 WHEN "normal" THEN 3 ELSE 4 END, a.created_at DESC';

    const [announcements] = await pool.query(query, params);
    res.json(announcements);
  } catch (error) {
    console.error('Get student announcements error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllAnnouncements,
  getCourseAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getStudentAnnouncements
};
