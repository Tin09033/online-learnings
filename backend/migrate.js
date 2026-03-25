const mysql = require('mysql2/promise');
require('dotenv').config();

const migrateDatabase = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'online_learning'
  });

  try {
    console.log('Starting database migration...');

    const [tables] = await connection.query('SHOW TABLES');
    console.log('Current tables:', tables);

    const columnsToAdd = [
      { name: 'avatar', sql: 'ALTER TABLE users ADD COLUMN avatar VARCHAR(255) AFTER role' },
      { name: 'phone', sql: 'ALTER TABLE users ADD COLUMN phone VARCHAR(50) AFTER avatar' },
      { name: 'bio', sql: 'ALTER TABLE users ADD COLUMN bio TEXT AFTER phone' },
      { name: 'notification_email', sql: 'ALTER TABLE users ADD COLUMN notification_email TINYINT(1) DEFAULT 1 AFTER bio' },
      { name: 'notification_progress', sql: 'ALTER TABLE users ADD COLUMN notification_progress TINYINT(1) DEFAULT 1 AFTER notification_email' },
      { name: 'notification_courses', sql: 'ALTER TABLE users ADD COLUMN notification_courses TINYINT(1) DEFAULT 1 AFTER notification_progress' }
    ];

    for (const col of columnsToAdd) {
      try {
        await connection.query(`SELECT ${col.name} FROM users LIMIT 1`);
        console.log(`Column ${col.name} already exists, skipping...`);
      } catch (error) {
        try {
          await connection.query(col.sql);
          console.log(`Added column ${col.name}`);
        } catch (addError) {
          if (addError.code === 'ER_DUP_FIELDNAME') {
            console.log(`Column ${col.name} already exists`);
          } else {
            console.error(`Error adding ${col.name}:`, addError.message);
          }
        }
      }
    }

    const tablesToCreate = [
      {
        name: 'lesson_progress',
        sql: `
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
        `
      },
      {
        name: 'handouts',
        sql: `
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
        `
      },
      {
        name: 'announcements',
        sql: `
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
        `
      }
    ];

    for (const table of tablesToCreate) {
      try {
        await connection.query(`SELECT * FROM ${table.name} LIMIT 1`);
        console.log(`Table ${table.name} already exists`);
      } catch (error) {
        try {
          await connection.query(table.sql);
          console.log(`Created table ${table.name}`);
        } catch (tableError) {
          if (tableError.code === 'ER_TABLE_EXISTS_ERROR') {
            console.log(`Table ${table.name} already exists`);
          } else {
            console.error(`Error creating ${table.name}:`, tableError.message);
          }
        }
      }
    }

    try {
      await connection.query('SELECT status FROM courses LIMIT 1');
      console.log('Column status already exists in courses');
    } catch (error) {
      try {
        await connection.query('ALTER TABLE courses ADD COLUMN status ENUM("draft", "published") DEFAULT "draft" AFTER description');
        console.log('Added status column to courses');
      } catch (addError) {
        if (addError.code === 'ER_DUP_FIELDNAME') {
          console.log('Column status already exists in courses');
        } else {
          console.error('Error adding status column:', addError.message);
        }
      }
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await connection.end();
  }
};

migrateDatabase();
