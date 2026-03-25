const express = require('express');
const router = express.Router();
const {
  getMyResources,
  getResourcesByCategory,
  getResourceById,
  getCategories
} = require('../controllers/learningResourceController');
const { auth } = require('../middleware/auth');

router.get('/my', auth, getMyResources);
router.get('/categories', auth, getCategories);
router.get('/category/:category', auth, getResourcesByCategory);
router.get('/:id', auth, getResourceById);

module.exports = router;
