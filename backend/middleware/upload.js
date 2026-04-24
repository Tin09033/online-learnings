const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Base uploads directory
const uploadDir = path.join(__dirname, '../uploads');

// Helper: ensure a subdirectory exists and return its path
const ensureSubDir = (subDir) => {
  const dir = path.join(uploadDir, subDir);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
};

// Ensure root uploads dir exists on module load
ensureSubDir('.');

// Factory: create a diskStorage that routes files to a specific subdirectory
const makeStorage = (subDir) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, ensureSubDir(subDir));
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname).toLowerCase());
    }
  });

// Per-type storage — each type saves to its own subdirectory
const imageStorage   = makeStorage('.');          // root: course thumbnails
const avatarStorage  = makeStorage('avatars');
const paymentStorage = makeStorage('payments');
const handoutStorage = makeStorage('handouts');
const videoStorage   = makeStorage('videos');
const lessonStorage  = makeStorage('videos');     // lessons share video folder

// ── File filters ─────────────────────────────────────────────────────────────

const imageFilter = (req, file, cb) => {
  const allowedExtensions = ['.jpeg', '.jpg', '.png', '.gif', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  if (allowedExtensions.includes(ext) && allowedMimeTypes.includes(file.mimetype)) {
    return cb(null, true);
  }
  cb(new Error('Only image files are allowed! (jpeg, jpg, png, gif, webp)'));
};

const videoFilter = (req, file, cb) => {
  const allowedExtensions = ['.mp4', '.m4v', '.webm', '.mov', '.avi', '.mkv', '.wmv'];
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedMimeTypes = [
    'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo',
    'video/x-matroska', 'video/x-ms-wmv', 'video/mpeg'
  ];

  if (allowedExtensions.includes(ext) || allowedMimeTypes.includes(file.mimetype)) {
    return cb(null, true);
  }
  cb(new Error('Only video files are allowed! (mp4, webm, mov, avi, etc.)'));
};

const handoutFilter = (req, file, cb) => {
  const allowedExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.zip', '.rar'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedExtensions.includes(ext)) {
    return cb(null, true);
  }
  cb(new Error('File type not allowed! (PDF, Word, Excel, PPT, TXT, ZIP, RAR allowed)'));
};

const lessonFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const videoExts = ['.mp4', '.m4v', '.webm', '.mov', '.avi', '.mkv', '.wmv'];
  const docExts   = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.zip', '.rar'];

  if (videoExts.includes(ext) || docExts.includes(ext)) {
    return cb(null, true);
  }
  cb(new Error('File type not allowed! (Videos, PDF, Word, Excel, ZIP allowed)'));
};

// ── Multer instances — each uses its own storage + filter ────────────────────

// General image upload (course thumbnails) — saves to uploads/
const upload = multer({
  storage: imageStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: imageFilter
});

// Avatar uploads — saves to uploads/avatars/
const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFilter
});

// Payment proof uploads — saves to uploads/payments/
const uploadPayment = multer({
  storage: paymentStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: imageFilter
});

// Handout uploads — saves to uploads/handouts/
const uploadHandout = multer({
  storage: handoutStorage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: handoutFilter
});

// Video uploads — saves to uploads/videos/
const uploadVideo = multer({
  storage: videoStorage,
  limits: { fileSize: 500 * 1024 * 1024 },
  fileFilter: videoFilter
});

// Lesson files (video + documents) — saves to uploads/videos/
const uploadFiles = multer({
  storage: lessonStorage,
  limits: { fileSize: 500 * 1024 * 1024 },
  fileFilter: lessonFilter
});

module.exports = {
  upload,
  uploadVideo,
  uploadHandout,
  uploadAvatar,
  uploadCourseImage: upload,
  uploadPayment,
  uploadFiles
};
