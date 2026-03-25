const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new Error('Only image files are allowed!'));
};

const videoFilter = (req, file, cb) => {
  const allowedTypes = /mp4|mpeg4|webm|mov|avi|mkv|wmv/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const allowedMimes = /video\/(mp4|mpeg4|webm|quicktime|x-msvideo|x-matroska|x-ms-wmv)/;
  const mimetype = allowedMimes.test(file.mimetype);
  
  if (extname || mimetype) {
    return cb(null, true);
  }
  cb(new Error('Only video files are allowed! (mp4, webm, mov, avi)'));
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFilter
});

const uploadVideo = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 },
  fileFilter: videoFilter
});

module.exports = { upload, uploadVideo };
