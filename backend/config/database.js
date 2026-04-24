const mysql = require('mysql2/promise');
const knexConfig = require('../knexfile');
require('dotenv').config();

const environment = process.env.NODE_ENV || 'development';
const knex = require('knex')(knexConfig[environment]);

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
  
  // Ensure the database exists before running migrations
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

  const dbName = process.env.DB_NAME || 'online_learning';
  await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
  await connection.end();

  try {
    // Run Knex migrations
    console.log(`Running migrations for environment: ${environment}...`);
    await knex.migrate.latest();
    console.log('Database migrations completed successfully');

    // Ensure default payment settings exist
    const [existingSettings] = await pool.query('SELECT id FROM payment_settings LIMIT 1');
    if (existingSettings.length === 0) {
      await pool.query(`
        INSERT INTO payment_settings (bank_name, account_name, account_number, amount, instructions) 
        VALUES ('GCash', 'Juan Dela Cruz', '09123456789', 5000.00, 'Please transfer the exact amount and upload your payment proof with reference number.')
      `);
      console.log('Default payment settings created');
    }
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  }
};

module.exports = { pool, knex, initDatabase };
