# Hostinger Node.js Deployment Guide

## Prerequisites

- Hostinger **Cloud Hosting** or **VPS** plan (shared hosting doesn't support Node.js)
- MySQL database created in Hostinger control panel

## Step 1: Create MySQL Database

1. Go to **Hosting** → **MySQL Databases**
2. Create a new database (e.g., `u123456789_online_learning`)
3. Create a database user and assign to the database
4. Note down:
   - Database host (usually `localhost` or a specific host)
   - Database name
   - Database username
   - Database password

## Step 2: Configure Environment Variables

In Hostinger File Manager or via SSH, create `.env` file in `backend/` folder:

```env
# Server
PORT=5000
NODE_ENV=production

# Database (use values from Step 1)
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name

# JWT (generate a strong secret)
JWT_SECRET=generate-a-32+-character-random-string-here

# Frontend URLs (your actual domain)
FRONTEND_URL=https://yourdomain.com
ADMIN_URL=https://yourdomain.com/admin
```

## Step 3: Deploy via Git

1. Go to **Hosting** → **Git**
2. Click **Clone a repository**
3. Enter your GitHub repo URL
4. Set branch: `main`
5. Set deployment path (e.g., `/public_html`)

## Step 4: Configure Node.js App

1. Go to **Hosting** → **Node.js**
2. Click **Create Application**
3. Set:
   - **App name**: `online-learning`
   - **Mode**: `Production`
   - **App URL**: your domain
   - **App directory**: `/public_html` (or your deployment path)
   - **Startup file**: `backend/server.js`
   - **Node.js version**: 18.x or 20.x

4. Click **Create**

## Step 5: Start the Application

1. In Node.js panel, click **Start** or **Restart**
2. Check logs for any errors

## Alternative: Manual Deployment via FTP

1. Build locally:
   ```bash
   npm run build
   ```

2. Upload these folders via FTP:
   - `backend/`
   - `frontend/dist/` → upload contents to root
   - `admin/dist/` → upload contents to `/admin/`

3. Create `.env` file in `backend/`

4. Start via Hostinger Node.js panel

## Troubleshooting

### Check Logs
- Go to **Node.js** → click on your app → **Logs**

### Database Connection Issues
- Verify DB credentials in `.env`
- Check if DB host is correct (some hosts use `localhost`, others use specific hostnames)

### Port Issues
- Hostinger may use a different port internally
- Check the PORT environment variable in Node.js panel

### Static Files Not Loading
- The backend serves static files from `frontend/dist` and `admin/dist`
- Ensure builds completed successfully before deployment
