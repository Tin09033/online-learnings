const logger = require('../utils/logger');
const { pool } = require('../config/database');
const path = require('path');
const fs = require('fs');

const getLessons = async (req, res) => {
  try {
    const { courseId } = req.params;

    const [lessons] = await pool.query(
      'SELECT * FROM lessons WHERE course_id = ? ORDER BY order_num ASC',
      [courseId]
    );

    res.json(lessons);
  } catch (error) {
    logger.error('Get lessons error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createLesson = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, content, video_url, order_num } = req.body;
    const files = req.files || [];
    
    const videoFile = files.find(f => f.fieldname === 'video_file');
    const documentFile = files.find(f => f.fieldname === 'document_file');

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const [courseCheck] = await pool.query('SELECT id FROM courses WHERE id = ?', [courseId]);
    if (courseCheck.length === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const videoFilePath = videoFile ? `/uploads/${videoFile.filename}` : null;
    const documentFilePath = documentFile ? `/uploads/${documentFile.filename}` : null;
    const documentFileType = documentFile ? documentFile.mimetype : null;
    const orderNum = order_num ? parseInt(order_num) : 0;

    const [result] = await pool.query(
      'INSERT INTO lessons (course_id, title, content, video_url, video_file, document_file, document_type, order_num) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [courseId, title, content || '', video_url || '', videoFilePath, documentFilePath, documentFileType, orderNum]
    );

    res.status(201).json({
      message: 'Lesson created successfully',
      lesson: { id: result.insertId, course_id: courseId, title, content, video_url, video_file: videoFilePath, document_file: documentFilePath, document_type: documentFileType, order_num: orderNum }
    });
  } catch (error) {
    logger.error('Create lesson error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const updateLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, video_url, order_num, remove_video_file, remove_document_file } = req.body;
    const files = req.files || [];
    
    const videoFile = files.find(f => f.fieldname === 'video_file');
    const documentFile = files.find(f => f.fieldname === 'document_file');

    const [existing] = await pool.query('SELECT * FROM lessons WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    let videoFilePath = existing[0].video_file;
    if (remove_video_file === 'true') {
      if (existing[0].video_file) {
        const oldFilePath = path.join(__dirname, '..', existing[0].video_file);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      videoFilePath = null;
    } else if (videoFile) {
      if (existing[0].video_file) {
        const oldFilePath = path.join(__dirname, '..', existing[0].video_file);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      videoFilePath = `/uploads/${videoFile.filename}`;
    }

    let documentFilePath = existing[0].document_file;
    let documentFileType = existing[0].document_type;
    if (remove_document_file === 'true') {
      if (existing[0].document_file) {
        const oldDocPath = path.join(__dirname, '..', existing[0].document_file);
        if (fs.existsSync(oldDocPath)) {
          fs.unlinkSync(oldDocPath);
        }
      }
      documentFilePath = null;
      documentFileType = null;
    } else if (documentFile) {
      if (existing[0].document_file) {
        const oldDocPath = path.join(__dirname, '..', existing[0].document_file);
        if (fs.existsSync(oldDocPath)) {
          fs.unlinkSync(oldDocPath);
        }
      }
      documentFilePath = `/uploads/${documentFile.filename}`;
      documentFileType = documentFile.mimetype;
    }

    const orderNum = order_num ? parseInt(order_num) : existing[0].order_num;

    await pool.query(
      'UPDATE lessons SET title = ?, content = ?, video_url = ?, video_file = ?, document_file = ?, document_type = ?, order_num = ? WHERE id = ?',
      [title, content || '', video_url || '', videoFilePath, documentFilePath, documentFileType, orderNum, id]
    );

    res.json({ message: 'Lesson updated successfully' });
  } catch (error) {
    logger.error('Update lesson error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const deleteLesson = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT * FROM lessons WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    if (existing[0].video_file) {
      const filePath = path.join(__dirname, '..', existing[0].video_file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await pool.query('DELETE FROM lessons WHERE id = ?', [id]);

    res.json({ message: 'Lesson deleted successfully' });
  } catch (error) {
    logger.error('Delete lesson error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getLessons,
  createLesson,
  updateLesson,
  deleteLesson
};

