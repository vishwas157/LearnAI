const API_BASE = 'http://localhost:5000/api';

async function request(url, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

async function testCompleteAuthFlow() {
  console.log('====================================================');
  console.log('🚀 TESTING NEW SIMPLIFIED REGISTRATION & AUTH FLOW');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, description) => {
    if (condition) {
      console.log(`  ✓ PASS: ${description}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${description}`);
      failed++;
    }
  };

  const testUser = {
    name: 'Sarah Connor',
    email: `sarah_${Date.now()}@university.edu`,
    password: 'securePassword123',
    confirmPassword: 'securePassword123',
    preferredLanguage: 'en',
    role: 'student',
  };

  // 1. Password mismatch validation
  const mismatchRes = await request(`${API_BASE}/auth/register`, {
    method: 'POST',
    body: JSON.stringify({
      ...testUser,
      confirmPassword: 'differentPassword',
    }),
  });
  assert(mismatchRes.status === 400 && mismatchRes.data.message === 'Passwords do not match', '1. Rejects registration when passwords do not match');

  // 2. Short password validation
  const shortPassRes = await request(`${API_BASE}/auth/register`, {
    method: 'POST',
    body: JSON.stringify({
      ...testUser,
      password: '123',
      confirmPassword: '123',
    }),
  });
  assert(shortPassRes.status === 400, '2. Rejects registration when password is under 6 characters');

  // 3. Register a new student (Instant direct account creation)
  const regRes = await request(`${API_BASE}/auth/register`, {
    method: 'POST',
    body: JSON.stringify(testUser),
  });
  assert(
    regRes.status === 201 &&
    regRes.data.success === true &&
    regRes.data.data.token &&
    regRes.data.data.user.email === testUser.email &&
    regRes.data.data.user.role === 'student' &&
    regRes.data.data.user.emailVerified === true,
    '3. Direct Registration creates user immediately, returns JWT token with emailVerified: true'
  );

  const initialToken = regRes.data.data.token;

  // 4. Duplicate registration attempt
  const dupRes = await request(`${API_BASE}/auth/register`, {
    method: 'POST',
    body: JSON.stringify(testUser),
  });
  assert(dupRes.status === 400 && dupRes.data.message.includes('already exists'), '4. Duplicate email registration rejected');

  // 5. Access authenticated route (/api/auth/me) with token received from registration
  const meRes = await request(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${initialToken}` },
  });
  assert(
    meRes.status === 200 &&
    meRes.data.data.user.name === testUser.name &&
    meRes.data.data.user.email === testUser.email,
    '5. /api/auth/me authenticates immediately with registration token (Direct Login Flow)'
  );

  // 6. Sign in with the registered credentials
  const loginRes = await request(`${API_BASE}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({
      email: testUser.email,
      password: testUser.password,
    }),
  });
  assert(
    loginRes.status === 200 &&
    loginRes.data.success === true &&
    loginRes.data.data.token &&
    loginRes.data.data.user.email === testUser.email,
    '6. Login with new credentials succeeds without email verification blocker'
  );

  // 7. Test invalid password login
  const badLogin = await request(`${API_BASE}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({
      email: testUser.email,
      password: 'wrongPassword999',
    }),
  });
  assert(badLogin.status === 401, '7. Login with wrong password properly rejected (401)');

  // 8. Register a teacher / admin account
  const teacherUser = {
    name: 'Prof. Davis',
    email: `davis_${Date.now()}@university.edu`,
    password: 'teacherPassword123',
    confirmPassword: 'teacherPassword123',
    role: 'teacher',
  };
  const teacherReg = await request(`${API_BASE}/auth/register`, {
    method: 'POST',
    body: JSON.stringify(teacherUser),
  });
  assert(
    teacherReg.status === 201 &&
    teacherReg.data.data.user.role === 'teacher',
    '8. Teacher account registered and assigned role correctly'
  );

  // 9. Verify Demo Student login
  const demoStudentLogin = await request(`${API_BASE}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({
      email: 'student@learnai.com',
      password: 'password123',
    }),
  });
  assert(
    demoStudentLogin.status === 200 &&
    demoStudentLogin.data.data.user.email === 'student@learnai.com',
    '9. Demo Student (One-click) signs in successfully'
  );

  // 10. Verify Demo Admin login
  const demoAdminLogin = await request(`${API_BASE}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({
      email: 'admin@learnai.com',
      password: 'adminpassword123',
    }),
  });
  assert(
    demoAdminLogin.status === 200 &&
    demoAdminLogin.data.data.user.role === 'admin',
    '10. Demo Admin (One-click) signs in successfully'
  );

  console.log('\n====================================================');
  console.log(`🏁 Result: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

testCompleteAuthFlow();
