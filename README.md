# Online Learning Platform

A modern, responsive Online Learning Platform built with React, Node.js, Express, and MySQL.

## Features

- Clean, modern UI with Tailwind CSS
- Responsive design (mobile-first)
- Role-based authentication (Admin & Student)
- Full CRUD operations
- Course management
- Lesson management
- Student enrollment and progress tracking
- User management
- Image upload with preview
- Toast notifications

## Tech Stack

### Frontend
- React 18
- Tailwind CSS
- Framer Motion (animations)
- React Router
- Axios
- Lucide React (icons)
- React Toastify

### Backend
- Node.js
- Express.js
- MySQL
- JWT Authentication
- bcrypt (password hashing)
- Multer (file uploads)

## Quick Start

### Step 1: Start XAMPP
- Open XAMPP Control Panel
- Click "Start" for Apache and MySQL

### Step 2: Create Database
1. Open http://localhost/phpmyadmin
2. Click "Databases"
3. Create database: `online_learning`
4. Tables auto-create when backend starts

### Step 3: Run All Services

Double-click these batch files:

1. **start-backend.bat** - Backend API (Port 5000)
2. **start-student.bat** - Student Website (Port 3000)
3. **start-admin.bat** - Admin Panel (Port 3001)

Or use **start-all.bat** to start everything at once!

## URLs

| Service | URL |
|---------|-----|
| Student Website | http://localhost:3000 |
| Admin Panel | http://localhost:3001 |
| Backend API | http://localhost:5000 |
| phpMyAdmin | http://localhost/phpmyadmin |

## Project Structure

```
Online learnings/
├── backend/           # Node.js API (Port 5000)
├── frontend/          # React Student App (Port 3000)
├── admin/             # React Admin Panel (Port 3001)
├── start-backend.bat  # Start backend
├── start-student.bat  # Start student app
├── start-admin.bat    # Start admin panel
├── start-all.bat      # Start everything
└── README.md
```

## Creating Admin Account

1. Go to http://localhost:3000/register
2. Create account
3. Open phpMyAdmin → `online_learning` → `users` table
4. Edit user → Change `role` to `admin`
5. Login at http://localhost:3001

## How to Use

### Student App (Port 3000)
- Browse courses
- Register/Login
- Enroll in courses
- Track progress

### Admin Panel (Port 3001)
- Dashboard with stats
- Manage courses & lessons
- Manage users
- View enrollments

## Troubleshooting

**MySQL Connection Error:**
- Check XAMPP MySQL is running
- Verify `.env` has `DB_USER=root` and `DB_PASSWORD=` (empty)

**Port Already in Use:**
```bash
netstat -ano | findstr :3000
taskkill /PID <pid_number> /F
```

## License

MIT License
