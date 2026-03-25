const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'online_learning',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const initDatabase = async () => {
  let connection;
  let retries = 5;
  
  while (retries > 0) {
    try {
      connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || ''
      });
      break;
    } catch (error) {
      retries--;
      if (retries === 0) throw error;
      console.log(`MySQL connection failed, retrying... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'online_learning'}`);
  await connection.query(`USE ${process.env.DB_NAME || 'online_learning'}`);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role ENUM('admin', 'student') DEFAULT 'student',
      avatar VARCHAR(255),
      phone VARCHAR(50),
      bio TEXT,
      notification_email TINYINT(1) DEFAULT 1,
      notification_progress TINYINT(1) DEFAULT 1,
      notification_courses TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS courses (
      id INT PRIMARY KEY AUTO_INCREMENT,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      image VARCHAR(255),
      amount DECIMAL(10,2) DEFAULT 0,
      status ENUM('draft', 'published') DEFAULT 'draft',
      created_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  try {
    const [cols] = await connection.query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'courses' AND COLUMN_NAME = 'amount'", [process.env.DB_NAME || 'online_learning']);
    if (cols.length === 0) {
      await connection.query('ALTER TABLE courses ADD COLUMN amount DECIMAL(10,2) DEFAULT 0');
    }
  } catch (e) {
    // Ignore error
  }

  await connection.query(`
    CREATE TABLE IF NOT EXISTS handouts (
      id INT PRIMARY KEY AUTO_INCREMENT,
      course_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      file_path VARCHAR(255) NOT NULL,
      file_type VARCHAR(50),
      file_size INT,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS announcements (
      id INT PRIMARY KEY AUTO_INCREMENT,
      course_id INT,
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      priority ENUM('normal', 'important', 'urgent') DEFAULT 'normal',
      created_by INT,
      scheduled_at TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS announcement_groups (
      id INT PRIMARY KEY AUTO_INCREMENT,
      announcement_id INT NOT NULL,
      group_id INT NOT NULL,
      FOREIGN KEY (announcement_id) REFERENCES announcements(id) ON DELETE CASCADE,
      FOREIGN KEY (group_id) REFERENCES student_groups(id) ON DELETE CASCADE,
      UNIQUE KEY unique_announcement_group (announcement_id, group_id)
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS lessons (
      id INT PRIMARY KEY AUTO_INCREMENT,
      course_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      content TEXT,
      video_url VARCHAR(255),
      video_file VARCHAR(255),
      order_num INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    )
  `);

  try {
    const [cols] = await connection.query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'lessons' AND COLUMN_NAME = 'video_file'", [process.env.DB_NAME || 'online_learning']);
    if (cols.length === 0) {
      await connection.query('ALTER TABLE lessons ADD COLUMN video_file VARCHAR(255)');
      console.log('Added video_file column to lessons table');
    }
  } catch (e) {
    console.error('Error adding video_file column:', e.message);
  }

  try {
    const [cols] = await connection.query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'lessons' AND COLUMN_NAME = 'document_file'", [process.env.DB_NAME || 'online_learning']);
    if (cols.length === 0) {
      await connection.query('ALTER TABLE lessons ADD COLUMN document_file VARCHAR(255)');
      console.log('Added document_file column to lessons table');
    }
  } catch (e) {
    console.error('Error adding document_file column:', e.message);
  }

  try {
    const [cols] = await connection.query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'lessons' AND COLUMN_NAME = 'document_type'", [process.env.DB_NAME || 'online_learning']);
    if (cols.length === 0) {
      await connection.query('ALTER TABLE lessons ADD COLUMN document_type VARCHAR(100)');
      console.log('Added document_type column to lessons table');
    }
  } catch (e) {
    console.error('Error adding document_type column:', e.message);
  }

  await connection.query(`
    CREATE TABLE IF NOT EXISTS lesson_progress (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      lesson_id INT NOT NULL,
      completed TINYINT(1) DEFAULT 0,
      completed_at TIMESTAMP NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
      UNIQUE KEY unique_progress (user_id, lesson_id)
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS enrollments (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      course_id INT NOT NULL,
      progress INT DEFAULT 0,
      status ENUM('pending', 'active', 'completed') DEFAULT 'pending',
      enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
      UNIQUE KEY unique_enrollment (user_id, course_id)
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS payments (
      id INT PRIMARY KEY AUTO_INCREMENT,
      enrollment_id INT NOT NULL,
      user_id INT NOT NULL,
      course_id INT NOT NULL,
      amount DECIMAL(10,2),
      payment_method ENUM('bank_transfer', 'e_wallet', 'gcash', 'paymaya', 'other') DEFAULT 'bank_transfer',
      proof_path VARCHAR(255),
      reference_number VARCHAR(100),
      notes TEXT,
      status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
      verified_by INT,
      verified_at TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
      FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      type ENUM('payment_confirmed', 'class_link', 'enrollment_pending', 'general', 'announcement') DEFAULT 'general',
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      course_id INT,
      enrollment_id INT,
      class_link VARCHAR(255),
      is_read TINYINT(1) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL,
      FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE SET NULL
    )
  `);

  try {
    await connection.query(`ALTER TABLE notifications MODIFY COLUMN type ENUM('payment_confirmed', 'class_link', 'enrollment_pending', 'general', 'announcement') DEFAULT 'general'`);
  } catch (e) {
    // Ignore error
  }

  await connection.query(`
    CREATE TABLE IF NOT EXISTS course_class_links (
      id INT PRIMARY KEY AUTO_INCREMENT,
      course_id INT NOT NULL,
      class_link VARCHAR(500) NOT NULL,
      scheduled_at TIMESTAMP NULL,
      notes TEXT,
      created_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS payment_settings (
      id INT PRIMARY KEY AUTO_INCREMENT,
      bank_name VARCHAR(255),
      account_name VARCHAR(255),
      account_number VARCHAR(100),
      amount DECIMAL(10,2),
      qr_code_path VARCHAR(255),
      instructions TEXT,
      updated_by INT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS student_groups (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      created_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS student_group_members (
      id INT PRIMARY KEY AUTO_INCREMENT,
      group_id INT NOT NULL,
      user_id INT NOT NULL,
      added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (group_id) REFERENCES student_groups(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE KEY unique_member (group_id, user_id)
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS student_todos (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      text VARCHAR(500) NOT NULL,
      priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
      due_date DATE,
      completed TINYINT(1) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS student_events (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      event_date DATETIME NOT NULL,
      course_id INT,
      event_type ENUM('quiz', 'assignment', 'class', 'meeting', 'deadline', 'other') DEFAULT 'other',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS learning_paths (
      id INT PRIMARY KEY AUTO_INCREMENT,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      icon VARCHAR(50),
      duration VARCHAR(100),
      status ENUM('draft', 'published') DEFAULT 'published',
      created_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS learning_path_courses (
      id INT PRIMARY KEY AUTO_INCREMENT,
      learning_path_id INT NOT NULL,
      course_id INT NOT NULL,
      order_num INT DEFAULT 0,
      FOREIGN KEY (learning_path_id) REFERENCES learning_paths(id) ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
      UNIQUE KEY unique_path_course (learning_path_id, course_id)
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS learning_path_enrollments (
      id INT PRIMARY KEY AUTO_INCREMENT,
      learning_path_id INT NOT NULL,
      user_id INT NOT NULL,
      progress INT DEFAULT 0,
      status ENUM('active', 'completed') DEFAULT 'active',
      enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (learning_path_id) REFERENCES learning_paths(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE KEY unique_path_enrollment (learning_path_id, user_id)
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS student_goals (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      target_type ENUM('course_completion', 'lesson_completion', 'hours_learned', 'certificates', 'custom') DEFAULT 'custom',
      target_value INT DEFAULT 100,
      current_value INT DEFAULT 0,
      deadline DATE,
      status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
      linked_course_id INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (linked_course_id) REFERENCES courses(id) ON DELETE SET NULL
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS learning_resources (
      id INT PRIMARY KEY AUTO_INCREMENT,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      resource_type ENUM('pdf', 'video', 'link', 'document', 'template') DEFAULT 'pdf',
      file_path VARCHAR(500),
      external_url VARCHAR(500),
      category VARCHAR(100),
      is_global TINYINT(1) DEFAULT 0,
      course_id INT,
      created_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  const [existingSettings] = await connection.query('SELECT id FROM payment_settings LIMIT 1');
  if (existingSettings.length === 0) {
    await connection.query(`
      INSERT INTO payment_settings (bank_name, account_name, account_number, amount, instructions) 
      VALUES ('GCash', 'Juan Dela Cruz', '09123456789', 5000.00, 'Please transfer the exact amount and upload your payment proof with reference number.')
    `);
    console.log('Default Philippine payment settings created');
  } else {
    const [settings] = await connection.query('SELECT * FROM payment_settings LIMIT 1');
    if (settings[0] && (!settings[0].bank_name || settings[0].bank_name === 'Sample Bank')) {
      await connection.query(`
        UPDATE payment_settings SET 
          bank_name = 'GCash',
          account_name = 'Juan Dela Cruz',
          account_number = '09123456789'
        WHERE id = ?
      `, [settings[0].id]);
      console.log('Payment settings updated with Philippine payment details');
    }
  }

  await connection.end();
  console.log('Database initialized successfully');
};

module.exports = { pool, initDatabase };
