const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { initDatabase } = require('./config/database');
const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const lessonRoutes = require('./routes/lessons');
const enrollmentRoutes = require('./routes/enrollments');
const userRoutes = require('./routes/users');
const lessonProgressRoutes = require('./routes/lessonProgress');
const handoutRoutes = require('./routes/handouts');
const announcementRoutes = require('./routes/announcements');
const analyticsRoutes = require('./routes/analytics');
const paymentRoutes = require('./routes/payments');
const paymentSettingsRoutes = require('./routes/paymentSettings');
const studentGroupRoutes = require('./routes/studentGroups');
const classLinkRoutes = require('./routes/classLinks');
const notificationRoutes = require('./routes/notifications');
const studentTodoRoutes = require('./routes/studentTodos');
const studentEventRoutes = require('./routes/studentEvents');
const learningPathRoutes = require('./routes/learningPaths');
const studentGoalsRoutes = require('./routes/studentGoals');
const learningResourceRoutes = require('./routes/learningResources');

const fs = require('fs');
const paymentsDir = path.join(__dirname, 'uploads/payments');
if (!fs.existsSync(paymentsDir)) {
  fs.mkdirSync(paymentsDir, { recursive: true });
}

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api', lessonRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/users', userRoutes);
app.use('/api', lessonProgressRoutes);
app.use('/api', handoutRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/payments', paymentSettingsRoutes);
app.use('/api/student-groups', studentGroupRoutes);
app.use('/api/class-links', classLinkRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/student-todos', studentTodoRoutes);
app.use('/api/student-events', studentEventRoutes);
app.use('/api/learning-paths', learningPathRoutes);
app.use('/api/student-goals', studentGoalsRoutes);
app.use('/api/learning-resources', learningResourceRoutes);

app.get('/api/health', (req, res) => {
  res.json({ message: 'API is running' });
});

app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  if (err.message === 'Only image files are allowed!') {
    return res.status(400).json({ message: err.message });
  }
  if (err.message === 'Only video files are allowed! (mp4, webm, mov, avi)') {
    return res.status(400).json({ message: err.message });
  }
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'File too large. Maximum size is 500MB for videos.' });
  }
  if (err.message && err.message.includes('Invalid file type')) {
    return res.status(400).json({ message: err.message });
  }
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
