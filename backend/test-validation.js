// Comprehensive API Test Suite
const http = require('http');

function post(path, body, token) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data),
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path,
        method: 'POST',
        headers,
      },
      (res) => {
        let resData = '';
        res.on('data', (chunk) => (resData += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(resData) });
          } catch (e) {
            resolve({ status: res.statusCode, raw: resData });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function get(path, token) {
  return new Promise((resolve, reject) => {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path,
        method: 'GET',
        headers,
      },
      (res) => {
        let resData = '';
        res.on('data', (chunk) => (resData += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(resData) });
          } catch (e) {
            resolve({ status: res.statusCode, raw: resData });
          }
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

async function runTests() {
  console.log('--- 1. Testing Signup Validations ---');
  
  // Test 1: Empty Signup
  const res1 = await post('/api/auth/signup', {});
  console.log('Test 1 (Empty Body):', res1.status === 400 ? '✅ PASS' : '❌ FAIL', res1.body.message);

  // Test 2: Invalid Email
  const res2 = await post('/api/auth/signup', {
    name: 'Student',
    email: 'notanemail',
    password: 'password123',
    confirmPassword: 'password123',
  });
  console.log('Test 2 (Invalid Email):', res2.status === 400 ? '✅ PASS' : '❌ FAIL', res2.body.message);

  // Test 3: Short Password
  const res3 = await post('/api/auth/signup', {
    name: 'Student',
    email: 'student@example.com',
    password: '123',
    confirmPassword: '123',
  });
  console.log('Test 3 (Short Password):', res3.status === 400 ? '✅ PASS' : '❌ FAIL', res3.body.message);

  // Test 4: Password Mismatch
  const res4 = await post('/api/auth/signup', {
    name: 'Student',
    email: 'student@example.com',
    password: 'password123',
    confirmPassword: 'password456',
  });
  console.log('Test 4 (Password Mismatch):', res4.status === 400 ? '✅ PASS' : '❌ FAIL', res4.body.message);

  console.log('\n--- 2. Testing Login Validations ---');
  // Test 5: Missing Login Fields
  const res5 = await post('/api/auth/login', {});
  console.log('Test 5 (Missing Login Fields):', res5.status === 400 ? '✅ PASS' : '❌ FAIL', res5.body.message);

  console.log('\n--- 3. Testing Protected Route Without Token ---');
  // Test 6: Access /api/auth/me without Token
  const res6 = await get('/api/auth/me');
  console.log('Test 6 (No Token on /api/auth/me):', res6.status === 401 ? '✅ PASS' : '❌ FAIL', res6.body.message);

  // Test 7: Access /api/auth/me with Invalid Token
  const res7 = await get('/api/auth/me', 'invalid_tampered_token');
  console.log('Test 7 (Invalid Token):', res7.status === 401 ? '✅ PASS' : '❌ FAIL', res7.body.message);

  console.log('\n--- 4. Testing Logout Route ---');
  // Test 8: Logout Route
  const res8 = await post('/api/auth/logout', {});
  console.log('Test 8 (Logout):', res8.status === 200 ? '✅ PASS' : '❌ FAIL', res8.body.message);

  console.log('\nAll validation and security checks completed!');
}

runTests().catch(console.error);
