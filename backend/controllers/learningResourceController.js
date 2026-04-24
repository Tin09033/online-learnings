const logger = require('../utils/logger');
const { pool } = require('../config/database');

const getMyResources = async (req, res) => {
  try {
    const [resources] = await pool.query(`
      SELECT lr.*, c.title as course_title
      FROM learning_resources lr
      LEFT JOIN courses c ON c.id = lr.course_id
      WHERE lr.is_global = 1 
         OR lr.course_id IN (SELECT course_id FROM enrollments WHERE user_id = ?)
         OR lr.created_by = ?
      ORDER BY lr.created_at DESC
    `, [req.user.id, req.user.id]);

    res.json(resources);
  } catch (error) {
    logger.error('Get resources error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getResourcesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    const [resources] = await pool.query(`
      SELECT lr.*, c.title as course_title
      FROM learning_resources lr
      LEFT JOIN courses c ON c.id = lr.course_id
      WHERE lr.category = ?
        AND (lr.is_global = 1 
             OR lr.course_id IN (SELECT course_id FROM enrollments WHERE user_id = ?)
             OR lr.created_by = ?)
      ORDER BY lr.created_at DESC
    `, [category, req.user.id, req.user.id]);

    res.json(resources);
  } catch (error) {
    logger.error('Get resources by category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getResourceById = async (req, res) => {
  try {
    const { id } = req.params;

    const [resource] = await pool.query(`
      SELECT lr.*, c.title as course_title
      FROM learning_resources lr
      LEFT JOIN courses c ON c.id = lr.course_id
      WHERE lr.id = ?
    `, [id]);

    if (resource.length === 0) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    res.json(resource[0]);
  } catch (error) {
    logger.error('Get resource error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getCategories = async (req, res) => {
  try {
    const [categories] = await pool.query(`
      SELECT DISTINCT category FROM learning_resources
      WHERE category IS NOT NULL AND category != ''
      ORDER BY category
    `);

    res.json(categories.map(c => c.category));
  } catch (error) {
    logger.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getMyResources,
  getResourcesByCategory,
  getResourceById,
  getCategories
};

