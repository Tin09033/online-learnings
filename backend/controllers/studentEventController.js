const logger = require('../utils/logger');
const { pool } = require('../config/database');

const getMyEvents = async (req, res) => {
  try {
    const [events] = await pool.query(`
      SELECT se.*, c.title as course_title
      FROM student_events se
      LEFT JOIN courses c ON se.course_id = c.id
      WHERE se.user_id = ?
      ORDER BY se.event_date ASC
    `, [req.user.id]);

    res.json(events);
  } catch (error) {
    logger.error('Get events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createEvent = async (req, res) => {
  try {
    const { title, description, event_date, course_id, event_type } = req.body;

    if (!title || !event_date) {
      return res.status(400).json({ message: 'Title and date are required' });
    }

    const [result] = await pool.query(
      'INSERT INTO student_events (user_id, title, description, event_date, course_id, event_type) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, title, description || null, event_date, course_id || null, event_type || 'other']
    );

    res.status(201).json({
      id: result.insertId,
      user_id: req.user.id,
      title,
      description,
      event_date,
      course_id,
      event_type,
      created_at: new Date()
    });
  } catch (error) {
    logger.error('Create event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, event_date, course_id, event_type } = req.body;

    const [event] = await pool.query(
      'SELECT * FROM student_events WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (event.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    await pool.query(
      'UPDATE student_events SET title = ?, description = ?, event_date = ?, course_id = ?, event_type = ? WHERE id = ?',
      [
        title || event[0].title,
        description ?? event[0].description,
        event_date || event[0].event_date,
        course_id ?? event[0].course_id,
        event_type || event[0].event_type,
        id
      ]
    );

    res.json({ message: 'Event updated successfully' });
  } catch (error) {
    logger.error('Update event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      'DELETE FROM student_events WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    logger.error('Delete event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getMyEvents,
  createEvent,
  updateEvent,
  deleteEvent
};

