const express = require('express');
const router = express.Router();
const {
  getAllGroups,
  getMyGroups,
  getGroupDetails,
  getGroupMembers,
  createGroup,
  updateGroup,
  deleteGroup,
  addMembers,
  removeMember,
  getStudentsNotInGroup,
  getAllStudents,
  joinGroup,
  leaveGroup
} = require('../controllers/studentGroupController');
const { auth } = require('../middleware/auth');

router.get('/', auth, getAllGroups);
router.get('/all', auth, getAllGroups);
router.get('/my', auth, getMyGroups);
router.get('/:id', auth, getGroupDetails);
router.get('/:id/members', auth, getGroupMembers);
router.post('/', auth, createGroup);
router.put('/:id', auth, updateGroup);
router.delete('/:id', auth, deleteGroup);
router.post('/:id/members', auth, addMembers);
router.delete('/:id/members/:userId', auth, removeMember);
router.get('/:id/students/not-in-group', auth, getStudentsNotInGroup);
router.get('/students/all', auth, getAllStudents);
router.post('/:id/join', auth, joinGroup);
router.delete('/:id/leave', auth, leaveGroup);

module.exports = router;
