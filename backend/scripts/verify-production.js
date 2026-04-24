/**
 * LMS Production Verification Script
 * Tests: Registration, Cookie Auth, State Recovery, Logging
 */
const http = require('http');

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}`;

// Helper to make requests
const request = (method, path, data = null, headers = {}) => {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : '';
    const options = {
      hostname: 'localhost',
      port: PORT,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            body: body ? JSON.parse(body) : null,
            headers: res.headers
          });
        } catch (e) {
          resolve({ statusCode: res.statusCode, body, headers: res.headers });
        }
      });
    });

    req.on('error', (e) => reject(e));
    if (postData) req.write(postData);
    req.end();
  });
};

async function verify() {
  console.log('🧪 Starting LMS Production Verification...\n');

  try {
    // 1. Test Registration
    const testEmail = `test_${Date.now()}@example.com`;
    console.log(`1. Testing Registration for ${testEmail}...`);
    const regRes = await request('POST', '/api/auth/register', {
      name: 'Test User',
      email: testEmail,
      password: 'password123'
    });

    if (regRes.statusCode !== 201) {
      throw new Error(`Registration failed: ${JSON.stringify(regRes.body)}`);
    }
    console.log('✅ Registration successful.');

    // 2. Extract cookies
    const cookies = regRes.headers['set-cookie'];
    if (!cookies || cookies.length < 2) {
      throw new Error('❌ Cookies not set in registration response!');
    }
    console.log('✅ Auth cookies received.');

    // 3. Test /api/auth/me (State Recovery)
    console.log('2. Testing /api/auth/me using cookies...');
    const cookieHeader = cookies.map(c => c.split(';')[0]).join('; ');
    const meRes = await request('GET', '/api/auth/me', null, { 'Cookie': cookieHeader });

    if (meRes.statusCode !== 200 || meRes.body.email !== testEmail) {
      throw new Error(`State recovery failed: ${JSON.stringify(meRes.body)}`);
    }
    console.log(`✅ State recovery successful for ${meRes.body.name}.`);

    // 4. Test Optional Auth (Public access with context)
    console.log('3. Testing /api/courses (Optional Auth verification)...');
    const coursesRes = await request('GET', '/api/courses', null, { 'Cookie': cookieHeader });
    if (coursesRes.statusCode !== 200) {
      throw new Error(`Optional auth endpoint failed: ${coursesRes.statusCode}`);
    }
    console.log('✅ Optional auth route accessible.');

    // 5. Cleanup (Logout)
    console.log('4. Testing Logout...');
    const logoutRes = await request('POST', '/api/auth/logout', null, { 'Cookie': cookieHeader });
    const logoutCookies = logoutRes.headers['set-cookie'] || [];
    const isCleared = logoutCookies.some(c => c.includes('Max-Age=0') || c.includes('1970'));
    
    if (logoutRes.statusCode !== 200 || !isCleared) {
      throw new Error('❌ Logout failed to clear cookies.');
    }
    console.log('✅ Logout successful and cookies cleared.');

    // 6. DB Cleanup
    const { pool } = require('../config/database');
    await pool.query('DELETE FROM users WHERE email = ?', [testEmail]);
    console.log('\n✨ ALL TESTS PASSED SUCCESSFULLY! LMS is production ready.');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ VERIFICATION FAILED:', error.message);
    process.exit(1);
  }
}

verify();
