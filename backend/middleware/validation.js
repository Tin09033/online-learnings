const { body, param, validationResult } = require('express-validator');

// Validation error handler middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// Auth validation rules
const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters')
    .escape(),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail()
    .isLength({ max: 255 }).withMessage('Email must not exceed 255 characters'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6, max: 100 }).withMessage('Password must be between 6 and 100 characters'),
  handleValidationErrors
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters')
    .escape(),
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('phone')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Phone must not exceed 50 characters'),
  handleValidationErrors
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 6, max: 100 }).withMessage('New password must be between 6 and 100 characters'),
  handleValidationErrors
];

// Course validation rules
const createCourseValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Course title is required')
    .isLength({ max: 255 }).withMessage('Title must not exceed 255 characters')
    .escape(),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 }).withMessage('Description must not exceed 5000 characters'),
  body('amount')
    .optional()
    .isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  handleValidationErrors
];

const updateCourseValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('Invalid course ID'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 }).withMessage('Title must be between 1 and 255 characters')
    .escape(),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 }).withMessage('Description must not exceed 5000 characters'),
  body('amount')
    .optional()
    .isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  handleValidationErrors
];

// Lesson validation rules
const createLessonValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Lesson title is required')
    .isLength({ max: 255 }).withMessage('Title must not exceed 255 characters')
    .escape(),
  body('content')
    .optional()
    .trim(),
  body('video_url')
    .optional()
    .trim()
    .isURL().withMessage('Video URL must be a valid URL'),
  body('course_id')
    .isInt({ min: 1 }).withMessage('Valid course ID is required'),
  handleValidationErrors
];

// Enrollment validation
const enrollmentValidation = [
  param('courseId')
    .isInt({ min: 1 }).withMessage('Invalid course ID'),
  handleValidationErrors
];

// Payment validation
const verifyPaymentValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('Invalid payment ID'),
  body('status')
    .isIn(['verified', 'rejected']).withMessage('Status must be verified or rejected'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Notes must not exceed 1000 characters'),
  handleValidationErrors
];

// Announcement validation
const announcementValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Announcement title is required')
    .isLength({ max: 255 }).withMessage('Title must not exceed 255 characters')
    .escape(),
  body('content')
    .trim()
    .notEmpty().withMessage('Announcement content is required'),
  body('priority')
    .optional()
    .isIn(['normal', 'important', 'urgent']).withMessage('Invalid priority level'),
  body('course_id')
    .isInt({ min: 1 }).withMessage('Valid course ID is required'),
  handleValidationErrors
];

// ID parameter validation
const idParamValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('Invalid ID parameter'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  registerValidation,
  loginValidation,
  updateProfileValidation,
  changePasswordValidation,
  createCourseValidation,
  updateCourseValidation,
  createLessonValidation,
  enrollmentValidation,
  verifyPaymentValidation,
  announcementValidation,
  idParamValidation
};
