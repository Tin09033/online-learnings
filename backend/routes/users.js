const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  deleteUser,
  updateUserRole,
  getDashboardStats
} = require('../controllers/userController');
const { auth, admin } = require('../middleware/auth');

router.get('/', auth, admin, getAllUsers);
router.delete('/:id', auth, admin, deleteUser);
router.put('/:id/role', auth, admin, updateUserRole);
router.get('/dashboard', auth, admin, getDashboardStats);

module.exports = router;
