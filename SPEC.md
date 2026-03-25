# Online Learning Platform - Technical Specification

## Project Overview
A modern, responsive Online Learning Platform similar to Udemy/Coursera with:
- Clean UI/UX with Tailwind CSS
- Full CRUD functionality
- Role-based system (Admin & Student)
- JWT Authentication
- RESTful API

## Technology Stack
- **Frontend**: React 18, Tailwind CSS, Framer Motion, React Router
- **Backend**: Node.js, Express.js, Multer, JWT, bcrypt
- **Database**: MySQL

## Project Structure
```
Online learnings/
├── backend/                 # Node.js + Express API
│   ├── config/
│   │   └── database.js      # MySQL connection
│   ├── controllers/         # Business logic
│   ├── middleware/          # Auth & file upload
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── uploads/             # Uploaded files
│   ├── .env                 # Environment variables
│   └── server.js            # Entry point
│
├── frontend/               # React Application
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── layouts/        # Layout components
│   │   ├── services/       # API service
│   │   ├── hooks/          # Custom hooks
│   │   ├── context/        # React context
│   │   └── App.jsx         # Main app
│   └── package.json
│
└── SPEC.md
```

## Database Schema

### users
- id (INT, PK, AUTO_INCREMENT)
- name (VARCHAR(255))
- email (VARCHAR(255), UNIQUE)
- password (VARCHAR(255))
- role (ENUM: 'admin', 'student')
- created_at (TIMESTAMP)

### courses
- id (INT, PK, AUTO_INCREMENT)
- title (VARCHAR(255))
- description (TEXT)
- image (VARCHAR(255))
- status (ENUM: 'draft', 'published')
- created_by (INT, FK)
- created_at (TIMESTAMP)

### lessons
- id (INT, PK, AUTO_INCREMENT)
- course_id (INT, FK)
- title (VARCHAR(255))
- content (TEXT)
- video_url (VARCHAR(255))
- order_num (INT)
- created_at (TIMESTAMP)

### handouts
- id (INT, PK, AUTO_INCREMENT)
- course_id (INT, FK)
- title (VARCHAR(255))
- file_path (VARCHAR(255))
- file_type (VARCHAR(50))
- file_size (INT)
- description (TEXT)
- created_at (TIMESTAMP)

### announcements
- id (INT, PK, AUTO_INCREMENT)
- course_id (INT, FK, nullable)
- title (VARCHAR(255))
- content (TEXT)
- priority (ENUM: 'normal', 'important', 'urgent')
- created_by (INT, FK)
- created_at (TIMESTAMP)

### lesson_progress
- id (INT, PK, AUTO_INCREMENT)
- user_id (INT, FK)
- lesson_id (INT, FK)
- completed (TINYINT, DEFAULT 0)
- completed_at (TIMESTAMP)
- UNIQUE KEY unique_progress (user_id, lesson_id)

### enrollments
- id (INT, PK, AUTO_INCREMENT)
- user_id (INT, FK)
- course_id (INT, FK)
- progress (INT, DEFAULT 0)
- status (ENUM: 'active', 'completed')
- enrolled_at (TIMESTAMP)

### learning_paths
- id (INT, PK, AUTO_INCREMENT)
- title (VARCHAR(255))
- description (TEXT)
- icon (VARCHAR(50))
- duration (VARCHAR(100))
- status (ENUM: 'draft', 'published')
- created_by (INT, FK)
- created_at (TIMESTAMP)

### learning_path_courses
- id (INT, PK, AUTO_INCREMENT)
- learning_path_id (INT, FK)
- course_id (INT, FK)
- order_num (INT)
- UNIQUE KEY unique_path_course (learning_path_id, course_id)

### learning_path_enrollments
- id (INT, PK, AUTO_INCREMENT)
- learning_path_id (INT, FK)
- user_id (INT, FK)
- progress (INT, DEFAULT 0)
- status (ENUM: 'active', 'completed')
- enrolled_at (TIMESTAMP)
- UNIQUE KEY unique_path_enrollment (learning_path_id, user_id)

### student_goals
- id (INT, PK, AUTO_INCREMENT)
- user_id (INT, FK)
- title (VARCHAR(255))
- description (TEXT)
- target_type (ENUM: 'course_completion', 'lesson_completion', 'hours_learned', 'certificates', 'custom')
- target_value (INT)
- current_value (INT)
- deadline (DATE)
- status (ENUM: 'active', 'completed', 'cancelled')
- linked_course_id (INT, FK, nullable)
- created_at (TIMESTAMP)

### learning_resources
- id (INT, PK, AUTO_INCREMENT)
- title (VARCHAR(255))
- description (TEXT)
- resource_type (ENUM: 'pdf', 'video', 'link', 'document', 'template')
- file_path (VARCHAR(500))
- external_url (VARCHAR(500))
- category (VARCHAR(100))
- is_global (TINYINT)
- course_id (INT, FK, nullable)
- created_by (INT, FK)
- created_at (TIMESTAMP)

### payment_settings
- id (INT, PK, AUTO_INCREMENT)
- bank_name (VARCHAR(255)) - Bank or e-wallet name (GCash, BDO, etc.)
- account_name (VARCHAR(255)) - Account holder name
- account_number (VARCHAR(100)) - Account number
- amount (DECIMAL(10,2)) - Default course fee in PHP
- qr_code_path (VARCHAR(255)) - QR code image path
- instructions (TEXT) - Payment instructions for students
- updated_by (INT, FK)
- updated_at (TIMESTAMP)

## API Endpoints

### Auth Routes
- POST /api/auth/register - Register new user
- POST /api/auth/login - Login user
- GET /api/auth/me - Get current user

### Course Routes
- GET /api/courses - Get all courses
- GET /api/courses/:id - Get course details
- POST /api/courses - Create course (admin)
- PUT /api/courses/:id - Update course (admin)
- PUT /api/courses/:id/status - Update course status (admin)
- DELETE /api/courses/:id - Delete course (admin)

### Lesson Routes
- GET /api/courses/:id/lessons - Get lessons for course
- POST /api/courses/:id/lessons - Add lesson (admin)
- PUT /api/lessons/:id - Update lesson (admin)
- DELETE /api/lessons/:id - Delete lesson (admin)

### Lesson Progress Routes
- POST /api/lessons/:lessonId/complete - Mark lesson complete (student)
- DELETE /api/lessons/:lessonId/complete - Mark lesson incomplete (student)
- GET /api/lessons/:lessonId/progress - Get lesson progress (student)
- GET /api/courses/:courseId/lesson-progress - Get all lesson progress for course
- GET /api/courses/:courseId/last-lesson - Get last incomplete lesson

### Handout Routes
- GET /api/courses/:courseId/handouts - Get course handouts
- POST /api/courses/:courseId/handouts - Add handout (admin)
- PUT /api/handouts/:handoutId - Update handout (admin)
- DELETE /api/handouts/:handoutId - Delete handout (admin)
- GET /api/courses/:courseId/student-handouts - Get student handouts (enrolled students)

### Announcement Routes
- GET /api/announcements - Get all announcements (admin)
- GET /api/announcements/courses/:courseId - Get course announcements
- POST /api/announcements - Create announcement (admin)
- PUT /api/announcements/:id - Update announcement (admin)
- DELETE /api/announcements/:id - Delete announcement (admin)
- GET /api/announcements/student - Get student announcements (student)

### Analytics Routes
- GET /api/analytics/dashboard - Get dashboard analytics (admin)
- GET /api/analytics/courses/:courseId - Get course analytics (admin)
- GET /api/analytics/students/:studentId - Get student analytics (admin)

### Enrollment Routes
- POST /api/enrollments - Enroll in course
- GET /api/enrollments/my - Get my enrollments
- PUT /api/enrollments/:id/progress - Update progress

### Learning Path Routes
- GET /api/learning-paths/all - Get all published learning paths
- GET /api/learning-paths/my - Get enrolled learning paths
- GET /api/learning-paths/:id - Get learning path details with courses
- POST /api/learning-paths/:id/enroll - Enroll in learning path
- DELETE /api/learning-paths/:id/enroll - Unenroll from learning path

### Student Goal Routes
- GET /api/student-goals/my - Get my goals
- POST /api/student-goals - Create new goal
- PUT /api/student-goals/:id - Update goal
- DELETE /api/student-goals/:id - Delete goal
- PUT /api/student-goals/:id/progress - Update goal progress

### Learning Resource Routes
- GET /api/learning-resources/my - Get my accessible resources
- GET /api/learning-resources/categories - Get resource categories
- GET /api/learning-resources/category/:category - Get resources by category
- GET /api/learning-resources/:id - Get resource details

### Payment Routes
- POST /api/payments - Submit payment proof (student)
- GET /api/payments/my - Get my payments (student)
- GET /api/payments/enrollment/:id - Get payment by enrollment (student)
- PUT /api/payments/:id/verify - Verify/reject payment (admin)
- GET /api/payments/all - Get all payments (admin)
- GET /api/payments/pending - Get pending payments (admin)
- GET /api/payments/settings - Get payment settings
- PUT /api/payments/settings - Update payment settings (admin)

### User Routes (Admin)
- GET /api/users - Get all users
- DELETE /api/users/:id - Delete user
- PUT /api/users/:id/role - Update user role

## Frontend Pages

### Public Pages
1. Home Page
   - Hero section with headline, description, CTA buttons
   - Statistics section (animated count-up)
   - "Why Choose Us" section
   - Featured courses

2. Login Page
   - Centered card layout
   - Email/password inputs
   - Show/hide password toggle
   - Form validation
   - Toast notifications

3. Register Page
   - Name/email/password inputs
   - Role selection (Student only for public registration)
   - Validation

4. Courses Page
   - Course grid (1/2/3/4 columns responsive)
   - Search and filter functionality
   - Pagination
   - Course cards with hover effects

### Student Pages
1. Student Dashboard
   - Enrolled courses
   - Progress tracking
   - Quick actions
   - Calendar with events
   - To-do list
   - Announcements widget

2. My Courses
   - Browse enrolled courses
   - Filter by status (active/completed/pending)
   - Search functionality
   - Progress tracking per course
   - Link to course detail

3. Learning Paths
   - Browse available learning paths
   - Enroll in learning paths
   - View path details with courses
   - Track path progress
   - Continue learning from last position

4. My Goals
   - Create custom learning goals
   - Track progress towards goals
   - Set deadlines and linked courses
   - Different goal types (course completion, hours learned, etc.)
   - Filter and search goals

5. Study Groups
   - Browse available groups
   - Create new groups
   - Join/leave groups
   - View group members
   - Group details modal

6. Resources
   - Browse learning resources
   - Filter by category
   - Download handouts and materials
   - Preview documents
   - Resources from enrolled courses

7. Payments (Philippine Payment Methods)
   - View payment history
   - Make payments via GCash, PayMaya, Maya, BDO, BPI, UnionBank
   - Upload payment proof with reference number
   - View payment status (pending, verified, rejected)
   - Copy account details to clipboard

8. Course View
   - Course details
   - Lessons list
   - Lesson content (video/text)
   - Progress tracking
   - Lesson completion toggle
   - Next/Previous lesson navigation
   - Resume from last position
   - Course handouts/materials download
   - Announcements display

9. Profile Settings
   - Update profile info
   - Change password

### Admin Pages
1. Admin Dashboard
   - Statistics cards
   - Recent enrollments
   - Quick actions

2. Course Management
   - Add/Edit/Delete courses
   - Image upload with preview
   - Course editor with lessons
   - Course status (draft/published)
   - Course handouts management
   - Course analytics

3. Handout Management
   - Upload handouts (PDF, DOC, XLS, images)
   - Edit/Delete handouts
   - File size limits (10MB)

4. Announcement Management
   - Create announcements
   - Priority levels (normal, important, urgent)
   - Course-specific or global announcements

5. User Management
   - User list
   - Delete users
   - View user details
   - View student progress

6. Enrollment Management
   - Enrollment list
   - Status tracking

7. Analytics
   - Course completion rates
   - Student progress tracking
   - Lesson engagement metrics

## UI/UX Guidelines

### Styling
- Tailwind CSS utility classes
- Border radius: `rounded-2xl` for cards, `rounded-lg` for buttons
- Shadows: `shadow-lg` for cards, `shadow-md` for buttons
- Transitions: `transition-all duration-300`
- Spacing: Consistent padding/margins (4, 6, 8 units)

### Colors
- Primary: Blue (blue-600, blue-700)
- Secondary: Gray (gray-50, gray-100, gray-800)
- Success: Green
- Error: Red

### Responsive Breakpoints
- Mobile: < 640px (1 column)
- Tablet: 640px - 1024px (2 columns)
- Desktop: > 1024px (3-4 columns)

### Animations (Framer Motion)
- Fade in: opacity 0 to 1
- Slide up: translateY 20px to 0
- Button hover: scale 1.05
- Page transitions

### Notifications
- Toast notifications only (no modals)
- Success: Green toast
- Error: Red toast
- Info: Blue toast

## Features Checklist

### Authentication
- [x] User registration
- [x] User login
- [x] JWT token management
- [x] Protected routes
- [x] Role-based access

### Course Management
- [x] Course CRUD (admin)
- [x] Image upload with preview
- [x] Lesson management
- [x] Course listing with pagination
- [x] Course search and filter
- [x] Course status (draft/published)
- [x] Handout management
- [x] Announcement management
- [x] Course analytics

### Student Features
- [x] Browse courses
- [x] Enroll in courses
- [x] View course content
- [x] Track progress
- [x] Mark lessons complete
- [x] View handouts/materials
- [x] View announcements
- [x] Profile management
- [x] Learning paths enrollment and tracking
- [x] Custom learning goals with progress tracking
- [x] Study groups (create, join, leave)
- [x] Learning resources and materials
- [x] To-do list
- [x] Calendar with events
- [x] Philippine payment methods (GCash, PayMaya, Maya, BDO, BPI, UnionBank)
- [x] Payment proof upload with reference number

### Admin Features
- [x] Dashboard with statistics
- [x] Course management
- [x] Handout management
- [x] Announcement management
- [x] User management
- [x] Student progress tracking
- [x] Enrollment tracking
- [x] Course analytics

## Security Considerations
- Password hashing with bcrypt
- JWT token expiration
- Protected API routes
- Input validation
- File upload restrictions
- SQL injection prevention

## Performance
- Lazy loading for routes
- Image optimization
- Code splitting
- Efficient database queries
