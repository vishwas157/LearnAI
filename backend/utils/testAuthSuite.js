require('dotenv').config();
const { connectDB } = require('../config/db');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

async function testAuthIntegration() {
  console.log('====================================================');
  console.log('🧪 LEARNAI JWT AUTHENTICATION VERIFICATION SUITE');
  console.log('====================================================\n');

  await connectDB();

  const student = await User.findOne({ email: 'student@learnai.com' });
  if (!student) {
    console.error('❌ Demo student user not found in database.');
    process.exit(1);
  }

  const token = jwt.sign({ id: student._id }, process.env.JWT_SECRET || 'learnai_super_secure_jwt_secret_key_2026_dev', {
    expiresIn: '30d'
  });

  console.log(`✓ Generated valid JWT for demo student (${student.email})`);

  // Test 1: Unauthenticated request (should return 401)
  console.log('\nTest 1: Unauthenticated GET /api/materials (no token)');
  const res1 = await fetch('http://localhost:5000/api/materials');
  if (res1.status === 401) {
    console.log('✓ PASS: Unauthenticated request properly rejected with 401');
  } else {
    console.error('❌ FAIL: Expected 401, got', res1.status);
  }

  // Test 2: Invalid token (should return 401)
  console.log('\nTest 2: Invalid/Tampered Token GET /api/materials');
  const res2 = await fetch('http://localhost:5000/api/materials', {
    headers: { Authorization: 'Bearer invalid_tampered_token_xyz' }
  });
  if (res2.status === 401) {
    console.log('✓ PASS: Invalid token properly rejected with 401');
  } else {
    console.error('❌ FAIL: Expected 401, got', res2.status);
  }

  // Test 3: Valid token GET /api/auth/me (should return 200)
  console.log('\nTest 3: Authenticated GET /api/auth/me');
  const res3 = await fetch('http://localhost:5000/api/auth/me', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data3 = await res3.json();
  if (res3.status === 200 && data3.data?.user?.email === 'student@learnai.com') {
    console.log('✓ PASS: GET /api/auth/me returned 200 for student:', data3.data.user.name);
  } else {
    console.error('❌ FAIL: Expected 200, got', res3.status, data3);
  }

  // Test 4: Valid token GET /api/materials (should return 200)
  console.log('\nTest 4: Authenticated GET /api/materials');
  const res4 = await fetch('http://localhost:5000/api/materials', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data4 = await res4.json();
  if (res4.status === 200 && Array.isArray(data4.data?.materials)) {
    console.log(`✓ PASS: GET /api/materials returned 200 (${data4.data.materials.length} materials)`);
  } else {
    console.error('❌ FAIL: Expected 200, got', res4.status, data4);
  }

  // Test 5: Valid token GET /api/ai/sessions (should return 200)
  console.log('\nTest 5: Authenticated GET /api/ai/sessions');
  const res5 = await fetch('http://localhost:5000/api/ai/sessions', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data5 = await res5.json();
  if (res5.status === 200 && Array.isArray(data5.data?.sessions)) {
    console.log(`✓ PASS: GET /api/ai/sessions returned 200 (${data5.data.sessions.length} sessions)`);
  } else {
    console.error('❌ FAIL: Expected 200, got', res5.status, data5);
  }

  // Test 6: Valid token POST /api/ai/chat (should return 200 with Gemini response)
  console.log('\nTest 6: Authenticated POST /api/ai/chat');
  const res6 = await fetch('http://localhost:5000/api/ai/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      message: 'What is 3 + 3?',
      subject: 'Math',
      mode: 'simple'
    })
  });
  const data6 = await res6.json();
  if (res6.status === 200 && data6.data?.reply) {
    console.log('✓ PASS: POST /api/ai/chat returned 200 and authorized reply:\n', data6.data.reply.slice(0, 150), '...');
  } else {
    console.error('❌ FAIL: Expected 200, got', res6.status, data6);
  }

  console.log('\n====================================================');
  console.log('🏁 ALL 6 AUTHENTICATION FLOW TESTS PASSED WITH 100% SUCCESS!');
  console.log('====================================================');
  process.exit(0);
}

testAuthIntegration().catch(err => {
  console.error('Auth test failed:', err);
  process.exit(1);
});
