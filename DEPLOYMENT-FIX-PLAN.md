# Deployment Fix Plan - Online Learning Platform

## Overview
This document outlines all fixes required to deploy the Online Learning Platform to Hostinger. The project was audited and found to have several critical issues that must be resolved before production deployment.

---

## Phase 1: Environment Configuration (CRITICAL)

### 1.1 Create .env Template
- [x] Create `.env.example` file with all required variables
- [x] Document each environment variable purpose
- Variables needed:
  - `DB_HOST` - MySQL host (localhost or Hostinger MySQL host)
  - `DB_PORT` - MySQL port (default: 3306)
  - `DB_USER` - Database username
  - `DB_PASSWORD` - Database password
  - `DB_NAME` - Database name
  - `JWT_SECRET` - Secret key for JWT tokens (32+ chars recommended)
  - `PORT` - Server port (default: 5000)
  - `NODE_ENV` - Environment (development/production)
  - `FRONTEND_URL` - Frontend domain for CORS
  - `ADMIN_URL` - Admin panel domain for CORS

### 1.2 Update .gitignore
- [x] Ensure `.env` and `.env.production` are ignored (already done)

---

## Phase 2: Hardcoded URL Fixes (CRITICAL)

### 2.1 Create URL Helper Utility
- [x] Create `src/utils/apiUrl.js` in frontend
- [x] Create `src/utils/apiUrl.js` in admin
- Function: `getApiUrl(path)` - returns full URL based on environment

### 2.2 Frontend Files to Update
| File | Line(s) | Current | Fix |
|------|---------|---------|-----|
| `src/pages/CourseEditor.jsx` | 53, 107, 278 | `http://localhost:5000` | Use `getApiUrl()` |
| `src/pages/CourseLearning.jsx` | 270, 319, 329 | `http://localhost:5000` | Use `getApiUrl()` |
| `src/pages/StudentProfile.jsx` | 178 | `http://localhost:5000` | Use `getApiUrl()` |
| `src/pages/StudentCourses.jsx` | 323 | `http://localhost:5000` | Use `getApiUrl()` |
| `src/pages/CourseDetail.jsx` | 496 | `http://localhost:5000` | Use `getApiUrl()` |
| `src/pages/AdminEnrollments.jsx` | 296 | `http://localhost:5000` | Use `getApiUrl()` |
| `src/pages/AdminDashboard.jsx` | 115 | `http://localhost:5000` | Use `getApiUrl()` |
| `src/pages/AdminCourses.jsx` | 119 | `http://localhost:5000` | Use `getApiUrl()` |
| `src/components/PaymentUploadModal.jsx` | 73, 270 | `http://localhost:5000` | Use `getApiUrl()` |
| `src/components/CourseCard.jsx` | 14 | `http://localhost:5000` | Use `getApiUrl()` |

### 2.3 Admin Files to Update
| File | Line(s) | Current | Fix |
|------|---------|---------|-----|
| `src/pages/CourseEditor.jsx` | 404, 566 | `http://localhost:5000` | Use `getApiUrl()` |
| `src/pages/AdminSettings.jsx` | 421 | `http://localhost:5000` | Use `getApiUrl()` |
| `src/pages/AdminPayments.jsx` | 29 | `http://localhost:5000` | Use `getApiUrl()` |
| `src/pages/AdminCourseHandouts.jsx` | 203 | `http://localhost:5000` | Use `getApiUrl()` |
| `src/components/AdminLayout.jsx` | - | `http://localhost:5000` | Use `getApiUrl()` |

---

## Phase 3: Security Enhancements (CRITICAL)

### 3.1 CORS Configuration
- [x] Replace `app.use(cors())` with configured CORS
- [x] Allow only specified origins from environment variables
- [x] Configure credentials for cookies

### 3.2 Rate Limiting
- [x] Install `express-rate-limit` package
- [x] Add rate limiter to auth routes (login, register)
- [x] Configure: 5 minutes, 5 attempts for login
- [x] Configure: 15 minutes, 3 attempts for register

### 3.3 Helmet Security Headers
- [x] Install `helmet` package
- [x] Add helmet middleware
- [x] Configure Content Security Policy if needed

### 3.4 Remove/Protect Dangerous Endpoints
- [x] Remove or heavily restrict `/api/migrate` endpoint
- [x] Remove `/api/payments/debug` endpoint
- [x] These expose database structure and data

---

## Phase 4: Input Validation (IMPORTANT)

### 4.1 Install Validation Library
- [x] Install `express-validator` package

### 4.2 Add Validation to Routes
- [x] Auth routes (register, login, changePassword)
- [x] Course routes (create, update)
- [x] Enrollment routes
- [x] Payment routes

---

## Phase 5: Production Configuration

### 5.1 Update Vite Configs
- [x] Update `frontend/vite.config.js` for production builds
- [x] Update `admin/vite.config.js` for production builds
- [x] Remove development proxy settings for production

### 5.2 Environment Files for Frontend
- [x] Create `.env.production` template for frontend
- [x] Create `.env.production` template for admin

---

## Phase 6: Hostinger Deployment Setup

### 6.1 Database Setup
1. Log into Hostinger control panel
2. Go to MySQL Databases
3. Create new database (e.g., `u123456789_online_learning`)
4. Create database user with full privileges
5. Note: host, database name, username, password

### 6.2 Node.js Setup (VPS/Cloud)
1. Go to Node.js section in control panel
2. Create new app
3. Set app root: `/public_html/backend`
4. Set startup file: `server.js`
5. Set environment variables in panel

### 6.3 Static Files
1. Frontend dist served from root
2. Admin dist served from `/admin` route
3. Backend handles routing

### 6.4 File Permissions
```bash
chmod 755 uploads/
chmod 755 uploads/avatars/
chmod 755 uploads/payments/
chmod 755 uploads/videos/
```

---

## Files to Create/Modify

### New Files
1. `backend/.env.example` - Environment template
2. `frontend/src/utils/apiUrl.js` - URL helper
3. `admin/src/utils/apiUrl.js` - URL helper
4. `frontend/.env.example` - Frontend env template
5. `admin/.env.example` - Admin env template
5. `backend/middleware/rateLimiter.js` - Rate limiting middleware
6. `backend/middleware/validators.js` - Input validation middleware

### Modified Files
1. `backend/server.js` - CORS, helmet, rate limiting, remove endpoints
2. `backend/package.json` - Add new dependencies
3. `frontend/vite.config.js` - Production config
4. `admin/vite.config.js` - Production config
5. All frontend/admin pages with hardcoded URLs

---

## Dependencies to Add

```json
{
  "helmet": "^7.1.0",
  "express-rate-limit": "^7.1.0",
  "express-validator": "^7.0.0"
}
```

---

## Testing Checklist

After all fixes:
- [ ] Run backend with production env variables
- [ ] Build frontend: `npm run build`
- [ ] Build admin: `npm run build`
- [ ] Test all image uploads and display
- [ ] Test video uploads and playback
- [ ] Test payment proof uploads
- [ ] Test authentication flow
- [ ] Test CORS with actual domain
- [ ] Verify rate limiting works
- [ ] Check security headers with browser dev tools

---

## Deployment Order

1. Set up MySQL database in Hostinger
2. Configure environment variables in Hostinger
3. Upload all files to server
4. Run `npm install` in backend directory
5. Start Node.js application
6. Verify health endpoint works
7. Test frontend and admin panels
8. Create admin user via database or script

---

## Rollback Plan

If deployment fails:
1. Keep backup of working local version
2. Hostinger allows reverting to previous deployment
3. Database can be restored from backup
4. Environment variables can be quickly updated

---

*Last Updated: March 30, 2026*
*Status: Implementation in progress*
