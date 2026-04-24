const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const cookieParser = require('cookie-parser');
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
const logger = require('./utils/logger');

const fs = require('fs');

// Auto-create all required upload directories at startup
const uploadDirs = [
  'uploads',
  'uploads/avatars',
  'uploads/payments',
  'uploads/handouts',
  'uploads/payment_settings',
  'uploads/videos'
];
uploadDirs.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// Sync built static assets to root to bypass Nginx/LiteSpeed static file 404s on Hostinger
const syncStaticAssets = () => {
  const copyRecursiveSync = (src, dest) => {
    if (!fs.existsSync(src)) return;
    const stats = fs.statSync(src);
    if (stats.isDirectory()) {
      if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
      fs.readdirSync(src).forEach(child => {
        copyRecursiveSync(path.join(src, child), path.join(dest, child));
      });
    } else {
      fs.copyFileSync(src, dest);
    }
  };

  try {
    copyRecursiveSync(path.join(__dirname, '../admin/dist/assets'), path.join(__dirname, '../admin/assets'));
    if (fs.existsSync(path.join(__dirname, '../admin/dist/vite.svg'))) {
      fs.copyFileSync(path.join(__dirname, '../admin/dist/vite.svg'), path.join(__dirname, '../admin/vite.svg'));
    }

    copyRecursiveSync(path.join(__dirname, '../frontend/dist/assets'), path.join(__dirname, '../assets'));
    if (fs.existsSync(path.join(__dirname, '../frontend/dist/vite.svg'))) {
      fs.copyFileSync(path.join(__dirname, '../frontend/dist/vite.svg'), path.join(__dirname, '../vite.svg'));
    }
  } catch (err) {
    console.warn('Could not sync static assets:', err.message);
  }
};
syncStaticAssets();

const app = express();

// Production: trust proxy (Nginx / Hostinger reverse proxy)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Security: Helmet middleware for security headers
const isProduction = process.env.NODE_ENV === 'production';
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: isProduction ? {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:", "https:"],
      mediaSrc: ["'self'", "blob:", "https:"],
      connectSrc: ["'self'", process.env.FRONTEND_URL, process.env.ADMIN_URL].filter(Boolean)
    }
  } : false
}));

// CORS Configuration - restrict origins in production
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5000',
      process.env.FRONTEND_URL,
      process.env.ADMIN_URL
    ].filter(Boolean);
    
    if (process.env.NODE_ENV === 'production') {
      // In production, only allow configured origins
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    } else {
      // In development, allow all origins
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Respond to ALL preflight OPTIONS requests immediately before any other middleware.
// Without this, Hostinger's CDN/LiteSpeed intercepts OPTIONS and returns 503.
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limit for login/register
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login attempts per 15 minutes
  message: { message: 'Too many login attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Apply rate limiting to auth routes
app.use('/api/auth/login', loginLimiter);
app.use('/api/auth/register', loginLimiter);
app.use('/api/auth', authLimiter);

app.use('/api/auth', authRoutes);
// IMPORTANT: lesson and handout routes MUST be mounted before courseRoutes.
// courseRoutes has a greedy GET /:id handler that would intercept
// /api/courses/:id/lessons and /api/courses/:id/handouts otherwise.
app.use('/api', lessonRoutes);
app.use('/api', lessonProgressRoutes);
app.use('/api', handoutRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/users', userRoutes);
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
  res.json({ message: 'API is running', timestamp: new Date().toISOString() });
});

// NOTE: /api/migrate endpoint removed for security.
// Database tables are auto-created by initDatabase() in config/database.js

// Serve static built files
const frontendDist = path.join(__dirname, '../frontend/dist');
const adminDist = path.join(__dirname, '../admin/dist');

// Admin panel static files (must be before frontend to avoid conflicts)
app.use('/admin', express.static(adminDist));

// Admin SPA catch-all: any /admin/* route serves admin's index.html
app.get('/admin/*', (req, res) => {
  res.sendFile(path.join(adminDist, 'index.html'));
});
app.get('/admin', (req, res) => {
  res.sendFile(path.join(adminDist, 'index.html'));
});

// Frontend static files
app.use(express.static(frontendDist));

// Frontend SPA catch-all: any non-API, non-upload, non-admin route serves frontend's index.html
app.get('*', (req, res, next) => {
  // Skip API routes, uploads, and admin routes
  if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/') || req.path.startsWith('/admin')) {
    return next();
  }
  res.sendFile(path.join(frontendDist, 'index.html'));
});

app.use((err, req, res, next) => {
  logger.error('Server Error:', err);
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
      logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
