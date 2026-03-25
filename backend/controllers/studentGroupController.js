const { pool } = require('../config/database');

const getAllGroups = async (req, res) => {
  try {
    const [groups] = await pool.query(`
      SELECT sg.*, u.name as created_by_name,
             (SELECT COUNT(*) FROM student_group_members WHERE group_id = sg.id) as member_count
      FROM student_groups sg
      LEFT JOIN users u ON sg.created_by = u.id
      ORDER BY sg.created_at DESC
    `);

    res.json(groups);
  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getGroupById = async (req, res) => {
  try {
    const { id } = req.params;

    const [group] = await pool.query(`
      SELECT sg.*, u.name as created_by_name
      FROM student_groups sg
      LEFT JOIN users u ON sg.created_by = u.id
      WHERE sg.id = ?
    `, [id]);

    if (group.length === 0) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const [members] = await pool.query(`
      SELECT sgm.*, u.name, u.email
      FROM student_group_members sgm
      JOIN users u ON sgm.user_id = u.id
      WHERE sgm.group_id = ?
      ORDER BY sgm.added_at DESC
    `, [id]);

    res.json({ ...group[0], members });
  } catch (error) {
    console.error('Get group error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createGroup = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Group name is required' });
    }

    const [result] = await pool.query(
      'INSERT INTO student_groups (name, description, created_by) VALUES (?, ?, ?)',
      [name, description || '', req.user.id]
    );

    res.status(201).json({
      message: 'Group created successfully',
      group: { id: result.insertId, name, description }
    });
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const [existing] = await pool.query('SELECT * FROM student_groups WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Group not found' });
    }

    await pool.query(
      'UPDATE student_groups SET name = ?, description = ? WHERE id = ?',
      [name || existing[0].name, description ?? existing[0].description, id]
    );

    res.json({ message: 'Group updated successfully' });
  } catch (error) {
    console.error('Update group error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteGroup = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT * FROM student_groups WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Group not found' });
    }

    await pool.query('DELETE FROM student_groups WHERE id = ?', [id]);

    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    console.error('Delete group error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const addMembers = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_ids } = req.body;

    if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
      return res.status(400).json({ message: 'User IDs array is required' });
    }

    const [group] = await pool.query('SELECT * FROM student_groups WHERE id = ?', [id]);
    if (group.length === 0) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const [students] = await pool.query(
      'SELECT id FROM users WHERE id IN (?) AND role = ?',
      [user_ids, 'student']
    );

    if (students.length === 0) {
      return res.status(400).json({ message: 'No valid students found' });
    }

    for (const student of students) {
      await pool.query(
        'INSERT IGNORE INTO student_group_members (group_id, user_id) VALUES (?, ?)',
        [id, student.id]
      );
    }

    res.json({ message: `${students.length} students added to group` });
  } catch (error) {
    console.error('Add members error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const removeMember = async (req, res) => {
  try {
    const { id, userId } = req.params;

    const [existing] = await pool.query(
      'SELECT * FROM student_group_members WHERE group_id = ? AND user_id = ?',
      [id, userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Member not found in group' });
    }

    await pool.query(
      'DELETE FROM student_group_members WHERE group_id = ? AND user_id = ?',
      [id, userId]
    );

    res.json({ message: 'Member removed from group' });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getStudentsNotInGroup = async (req, res) => {
  try {
    const { id } = req.params;

    const [students] = await pool.query(`
      SELECT u.id, u.name, u.email
      FROM users u
      WHERE u.role = 'student'
      AND u.id NOT IN (
        SELECT user_id FROM student_group_members WHERE group_id = ?
      )
      ORDER BY u.name
    `, [id]);

    res.json(students);
  } catch (error) {
    console.error('Get students not in group error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAllStudents = async (req, res) => {
  try {
    const [students] = await pool.query(`
      SELECT u.id, u.name, u.email
      FROM users u
      WHERE u.role = 'student'
      ORDER BY u.name
    `);

    res.json(students);
  } catch (error) {
    console.error('Get all students error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getMyGroups = async (req, res) => {
  try {
    const [groups] = await pool.query(`
      SELECT sg.*, u.name as created_by_name,
             (SELECT COUNT(*) FROM student_group_members WHERE group_id = sg.id) as member_count
      FROM student_groups sg
      JOIN student_group_members sgm ON sg.id = sgm.group_id
      LEFT JOIN users u ON sg.created_by = u.id
      WHERE sgm.user_id = ?
      ORDER BY sg.created_at DESC
    `, [req.user.id]);

    res.json(groups);
  } catch (error) {
    console.error('Get my groups error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getGroupDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const [group] = await pool.query(`
      SELECT sg.*, u.name as created_by_name
      FROM student_groups sg
      LEFT JOIN users u ON sg.created_by = u.id
      WHERE sg.id = ?
    `, [id]);

    if (group.length === 0) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const [isMember] = await pool.query(
      'SELECT * FROM student_group_members WHERE group_id = ? AND user_id = ?',
      [id, req.user.id]
    );

    const [members] = await pool.query(`
      SELECT u.id, u.name, u.email, u.avatar
      FROM student_group_members sgm
      JOIN users u ON sgm.user_id = u.id
      WHERE sgm.group_id = ?
      ORDER BY sgm.added_at ASC
    `, [id]);

    res.json({
      ...group[0],
      is_member: isMember.length > 0,
      members
    });
  } catch (error) {
    console.error('Get group details error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getGroupMembers = async (req, res) => {
  try {
    const { id } = req.params;

    const [members] = await pool.query(`
      SELECT u.id, u.name, u.email, u.avatar
      FROM student_group_members sgm
      JOIN users u ON sgm.user_id = u.id
      WHERE sgm.group_id = ?
      ORDER BY sgm.added_at ASC
    `, [id]);

    res.json(members);
  } catch (error) {
    console.error('Get group members error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const leaveGroup = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      'DELETE FROM student_group_members WHERE group_id = ? AND user_id = ?',
      [id, req.user.id]
    );

    res.json({ message: 'Left group successfully' });
  } catch (error) {
    console.error('Leave group error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const joinGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [group] = await pool.query('SELECT * FROM student_groups WHERE id = ?', [id]);
    if (group.length === 0) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const [existing] = await pool.query(
      'SELECT * FROM student_group_members WHERE group_id = ? AND user_id = ?',
      [id, userId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Already a member of this group' });
    }

    await pool.query(
      'INSERT INTO student_group_members (group_id, user_id) VALUES (?, ?)',
      [id, userId]
    );

    res.json({ message: 'Joined group successfully' });
  } catch (error) {
    console.error('Join group error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
  addMembers,
  removeMember,
  getStudentsNotInGroup,
  getAllStudents,
  getMyGroups,
  getGroupDetails,
  getGroupMembers,
  joinGroup,
  leaveGroup
};
