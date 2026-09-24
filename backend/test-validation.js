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
  console.log('========================================================');
  console.log('🧪 DG INTERNS HUB - WEEK 6 PASSWORD VALIDATION TESTS');
  console.log('========================================================\n');

  console.log('--- 1. Testing Signup Password Validation Rules ---');
  
  // Test 1: Empty Fields
  const res1 = await post('/api/auth/signup', {});
  console.log('Test 1 (Empty Body):', res1.status === 400 ? '✅ PASS' : '❌ FAIL', '->', res1.body.message);

  // Test 2: Invalid Email
  const res2 = await post('/api/auth/signup', {
    name: 'Vishal',
    email: 'notanemail',
    password: 'Vishal@123',
    confirmPassword: 'Vishal@123',
  });
  console.log('Test 2 (Invalid Email):', res2.status === 400 ? '✅ PASS' : '❌ FAIL', '->', res2.body.message);

  // Test 3: Example 'V@123' (Invalid: less than 8 characters, missing lowercase)
  const res3 = await post('/api/auth/signup', {
    name: 'Vishal',
    email: 'v1@example.com',
    password: 'V@123',
    confirmPassword: 'V@123',
  });
  console.log("Test 3 ('V@123' < 8 chars):", res3.status === 400 ? '✅ PASS' : '❌ FAIL', '->', res3.body.message);

  // Test 4: Example 'vishal123' (Invalid: missing uppercase & special char)
  const res4 = await post('/api/auth/signup', {
    name: 'Vishal',
    email: 'v2@example.com',
    password: 'vishal123',
    confirmPassword: 'vishal123',
  });
  console.log("Test 4 ('vishal123' no uppercase, no special):", res4.status === 400 ? '✅ PASS' : '❌ FAIL', '->', res4.body.message);

  // Test 5: Example 'VISHAL@123' (Invalid: missing lowercase)
  const res5 = await post('/api/auth/signup', {
    name: 'Vishal',
    email: 'v3@example.com',
    password: 'VISHAL@123',
    confirmPassword: 'VISHAL@123',
  });
  console.log("Test 5 ('VISHAL@123' no lowercase):", res5.status === 400 ? '✅ PASS' : '❌ FAIL', '->', res5.body.message);

  // Test 6: Example 'Vishal123' (Invalid: missing special character)
  const res6 = await post('/api/auth/signup', {
    name: 'Vishal',
    email: 'v4@example.com',
    password: 'Vishal123',
    confirmPassword: 'Vishal123',
  });
  console.log("Test 6 ('Vishal123' no special character):", res6.status === 400 ? '✅ PASS' : '❌ FAIL', '->', res6.body.message);

  // Test 7: Password Mismatch
  const res7 = await post('/api/auth/signup', {
    name: 'Vishal',
    email: 'v5@example.com',
    password: 'Vishal@123',
    confirmPassword: 'Vishal@999',
  });
  console.log('Test 7 (Password Mismatch):', res7.status === 400 ? '✅ PASS' : '❌ FAIL', '->', res7.body.message);

  console.log('\n--- 2. Testing Login Password Validation Rules ---');

  // Test 8: Login Missing Fields
  const res8 = await post('/api/auth/login', {});
  console.log('Test 8 (Missing Login Fields):', res8.status === 400 ? '✅ PASS' : '❌ FAIL', '->', res8.body.message);

  // Test 9: Login with Invalid Password 'vishal123'
  const res9 = await post('/api/auth/login', {
    email: 'test@example.com',
    password: 'vishal123',
  });
  console.log("Test 9 (Login 'vishal123' invalid):", res9.status === 400 ? '✅ PASS' : '❌ FAIL', '->', res9.body.message);

  // Test 10: Login with Invalid Password 'V@123' (< 8 chars)
  const res10 = await post('/api/auth/login', {
    email: 'test@example.com',
    password: 'V@123',
  });
  console.log("Test 10 (Login 'V@123' < 8 chars):", res10.status === 400 ? '✅ PASS' : '❌ FAIL', '->', res10.body.message);

  console.log('\n--- 3. Testing Protected Route Without Token ---');
  // Test 11: Access /api/auth/me without Token
  const res11 = await get('/api/auth/me');
  console.log('Test 11 (No Token on /api/auth/me):', res11.status === 401 ? '✅ PASS' : '❌ FAIL', '->', res11.body.message);

  // Test 12: Access /api/auth/me with Invalid Token
  const res12 = await get('/api/auth/me', 'invalid_tampered_token');
  console.log('Test 12 (Invalid Token):', res12.status === 401 ? '✅ PASS' : '❌ FAIL', '->', res12.body.message);

  console.log('\n--- 4. Testing Logout Route ---');
  // Test 13: Logout Route
  const res13 = await post('/api/auth/logout', {});
  console.log('Test 13 (Logout):', res13.status === 200 ? '✅ PASS' : '❌ FAIL', '->', res13.body.message);

  console.log('\n========================================================');
  console.log('🎉 ALL PASSWORD VALIDATION & AUTH TESTS COMPLETED!');
  console.log('========================================================\n');
}

runTests().catch(console.error);
