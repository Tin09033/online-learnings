const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const { pool } = require('../config/database');

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
  return { accessToken, refreshToken };
};

const setTokenCookies = (res, accessToken, refreshToken) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days (matches refresh token)
  };

  res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
  res.cookie('refreshToken', refreshToken, cookieOptions);
};

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const role = 'student';

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    const [existingUsers] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role]
    );

    const user = { id: result.insertId, name, email, role };
    const { accessToken, refreshToken } = generateTokens(user);

    // Store refresh token in DB
    await pool.query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [user.id, refreshToken, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]
    );

    setTokenCookies(res, accessToken, refreshToken);

    res.status(201).json({
      message: 'User registered successfully',
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    // Store refresh token in DB
    await pool.query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [user.id, refreshToken, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]
    );

    setTokenCookies(res, accessToken, refreshToken);

    res.json({
      message: 'Login successful',
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ message: 'Refresh token required' });

    // Check if token exists in DB
    const [tokens] = await pool.query('SELECT * FROM refresh_tokens WHERE token = ?', [token]);
    if (tokens.length === 0) return res.status(403).json({ message: 'Invalid refresh token' });

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    
    const [users] = await pool.query('SELECT id, name, email, role FROM users WHERE id = ?', [decoded.id]);
    if (users.length === 0) return res.status(404).json({ message: 'User not found' });

    const user = users[0];
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = generateTokens(user);

    // Replace old refresh token with new one (rotation)
    await pool.query('DELETE FROM refresh_tokens WHERE token = ?', [token]);
    await pool.query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [user.id, newRefreshToken, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]
    );

    setTokenCookies(res, newAccessToken, newRefreshToken);

    res.json({ message: 'Token refreshed successfully' });
  } catch (error) {
    logger.error('Refresh token error:', error);
    res.status(403).json({ message: 'Invalid refresh token' });
  }
};

const logout = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      await pool.query('DELETE FROM refresh_tokens WHERE token = ?', [token]);
    }
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getMe = async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, name, email, role, phone, bio, avatar, notification_email, notification_progress, notification_courses, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(users[0]);
  } catch (error) {
    logger.error('Get me error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, email, phone, bio } = req.body;
    
    const [existingUsers] = await pool.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, req.user.id]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    await pool.query(
      'UPDATE users SET name = ?, email = ?, phone = ?, bio = ? WHERE id = ?',
      [name, email, phone || null, bio || null, req.user.id]
    );

    const [users] = await pool.query(
      'SELECT id, name, email, role, phone, bio, avatar, notification_email, notification_progress, notification_courses, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    res.json({ message: 'Profile updated successfully', user: users[0] });
  } catch (error) {
    logger.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const [users] = await pool.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, users[0].password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    logger.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    await pool.query('UPDATE users SET avatar = ? WHERE id = ?', [avatarUrl, req.user.id]);

    res.json({ message: 'Avatar updated successfully', avatar: avatarUrl });
  } catch (error) {
    logger.error('Update avatar error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateNotifications = async (req, res) => {
  try {
    const { notification_email, notification_progress, notification_courses } = req.body;

    await pool.query(
      'UPDATE users SET notification_email = ?, notification_progress = ?, notification_courses = ? WHERE id = ?',
      [notification_email ? 1 : 0, notification_progress ? 1 : 0, notification_courses ? 1 : 0, req.user.id]
    );

    res.json({ message: 'Notification preferences updated successfully' });
  } catch (error) {
    logger.error('Update notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getLearningStats = async (req, res) => {
  try {
    const [enrollments] = await pool.query(
      'SELECT e.*, c.title as course_title FROM enrollments e JOIN courses c ON e.course_id = c.id WHERE e.user_id = ?',
      [req.user.id]
    );

    const totalEnrolled = enrollments.length;
    const completed = enrollments.filter(e => e.status === 'completed').length;
    const inProgress = enrollments.filter(e => e.status === 'active').length;
    const totalProgress = enrollments.reduce((sum, e) => sum + e.progress, 0);
    const averageProgress = totalEnrolled > 0 ? Math.round(totalProgress / totalEnrolled) : 0;

    const [lessonProgress] = await pool.query(
      'SELECT COUNT(*) as completed_lessons FROM lesson_progress WHERE user_id = ?',
      [req.user.id]
    );

    res.json({
      totalEnrolled,
      completed,
      inProgress,
      averageProgress,
      completedLessons: lessonProgress[0]?.completed_lessons || 0
    });
  } catch (error) {
    logger.error('Get learning stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { 
  register, 
  login, 
  refreshToken, 
  logout, 
  getMe, 
  updateProfile, 
  changePassword, 
  updateAvatar, 
  updateNotifications, 
  getLearningStats 
};

