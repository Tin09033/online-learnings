const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function createAdmin() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'online_learning'
  });

  const password = 'admin123';
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const [result] = await connection.execute(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
    ['Admin', 'admin@example.com', hashedPassword, 'admin']
  );

  console.log('Admin created successfully!');
  console.log('Email: admin@example.com');
  console.log('Password: admin123');
  console.log('ID:', result.insertId);

  await connection.end();
}

createAdmin().catch(console.error);
