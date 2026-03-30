const mysql = require('mysql2/promise');

async function test() {
  try {
    const connection = await mysql.createConnection({
      host: '127.0.0.1',
      port: 3306,
      user: 'root',
      password: '',
      family: 4
    });
    console.log('Connected!');
    const [rows] = await connection.query('SHOW DATABASES');
    console.log('Databases:', rows);
    await connection.end();
  } catch (err) {
    console.log('Error:', err.message);
  }
}

test();
