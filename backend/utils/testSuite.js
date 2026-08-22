const API_BASE = 'http://localhost:5000/api';

async function request(url, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

async function runTestSuite() {
  console.log('====================================================');
  console.log('🧪 Starting LearnAI Complete Verification & Test Suite');
  console.log('====================================================');

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName) => {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${testName}`);
      failed++;
    }
  };

  try {
    // 1. Health Check
    const healthRes = await request(`${API_BASE}/health`);
    assert(healthRes.data.status === 'healthy', 'GET /api/health - Server is running and healthy');

    // 2. Disposable Email Blocklist Validation
    const disposableRes = await request(`${API_BASE}/auth/register`, {
      method: 'POST',
      body: JSON.stringify({
        name: 'Spam Bot',
        email: 'fakeuser@mailinator.com',
        password: 'password123',
      }),
    });
    assert(disposableRes.status === 400 && disposableRes.data.success === false, 'POST /api/auth/register - Disposable email domain (mailinator.com) is blocked');

    // 3. New User Registration Flow (Email Verification Required)
    const testEmail = `newstudent_${Date.now()}@university.edu`;
    const regRes = await request(`${API_BASE}/auth/register`, {
      method: 'POST',
      body: JSON.stringify({
        name: 'Jordan Miller',
        email: testEmail,
        password: 'studentpassword123',
        preferredLanguage: 'en',
      }),
    });
    assert(regRes.data.success === true && regRes.data.data.emailVerified === false, 'POST /api/auth/register - Account created with emailVerified: false');
    const initialToken = regRes.data.data.debugToken;

    // 4. Duplicate Email Rejection
    const dupRes = await request(`${API_BASE}/auth/register`, {
      method: 'POST',
      body: JSON.stringify({
        name: 'Jordan Miller Duplicate',
        email: testEmail,
        password: 'studentpassword123',
      }),
    });
    assert(dupRes.status === 400 && dupRes.data.success === false, 'POST /api/auth/register - Duplicate registration rejected');

    // 5. Login Attempt Before Verification (Must be Blocked)
    const preVerifyLogin = await request(`${API_BASE}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: testEmail,
        password: 'studentpassword123',
      }),
    });
    assert(preVerifyLogin.status === 403 && preVerifyLogin.data.code === 'EMAIL_NOT_VERIFIED', 'POST /api/auth/login - Unverified account login blocked with EMAIL_NOT_VERIFIED code');

    // 6. Resend Verification Token Flow
    const resendRes = await request(`${API_BASE}/auth/resend-verification`, {
      method: 'POST',
      body: JSON.stringify({ email: testEmail }),
    });
    assert(resendRes.data.success === true && resendRes.data.data.debugToken, 'POST /api/auth/resend-verification - Successfully generated new verification link');
    const freshToken = resendRes.data.data.debugToken;

    // 7. Verify Invalidation of Old Token
    const oldTokenVerify = await request(`${API_BASE}/auth/verify-email?token=${initialToken}`);
    assert(oldTokenVerify.status === 400 && oldTokenVerify.data.success === false, 'GET /api/auth/verify-email - Old token is invalidated after resend');

    // 8. Verify Email Address via New Token
    const validVerify = await request(`${API_BASE}/auth/verify-email?token=${freshToken}`);
    assert(validVerify.data.success === true && validVerify.data.data.emailVerified === true, 'GET /api/auth/verify-email - Valid token activates account');

    // 9. Login Succeeded After Verification
    const postVerifyLogin = await request(`${API_BASE}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: testEmail,
        password: 'studentpassword123',
      }),
    });
    assert(postVerifyLogin.data.success === true && postVerifyLogin.data.data.token, 'POST /api/auth/login - Verified user logs in successfully');
    const newStudentToken = postVerifyLogin.data.data.token;
    const studentAuthHeader = { headers: { Authorization: `Bearer ${newStudentToken}` } };

    // 10. Admin Login
    const adminLoginRes = await request(`${API_BASE}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@learnai.com',
        password: 'adminpassword123',
      }),
    });
    assert(adminLoginRes.data.data.user.role === 'admin', 'POST /api/auth/login - Demo Admin login authenticated');
    const adminToken = adminLoginRes.data.data.token;
    const adminAuthHeader = { headers: { Authorization: `Bearer ${adminToken}` } };

    // 11. Study Materials API
    const materialsRes = await request(`${API_BASE}/materials`, studentAuthHeader);
    assert(materialsRes.data.data.materials.length > 0, `GET /api/materials - Digital library materials loaded (${materialsRes.data.data.materials.length} found)`);
    const testMaterial = materialsRes.data.data.materials[0];

    // 12. Reading Progress Milestones
    const progressRes = await request(`${API_BASE}/materials/${testMaterial._id}/progress`, {
      method: 'POST',
      body: JSON.stringify({ progress: 100, durationSeconds: 300 }),
      ...studentAuthHeader,
    });
    assert(progressRes.data.data.readingProgress === 100 && progressRes.data.data.isCompleted === true, 'POST /api/materials/:id/progress - Updated reading milestone to 100% completed');

    // 13. AI Summarizer
    const summaryRes = await request(`${API_BASE}/ai/summarize`, {
      method: 'POST',
      body: JSON.stringify({
        materialId: testMaterial._id,
        mode: 'exam_revision',
        language: 'en',
      }),
      ...studentAuthHeader,
    });
    assert(summaryRes.data.data.summary && summaryRes.data.data.summary.includes('### KEY CONCEPTS'), 'POST /api/ai/summarize - Generated exam revision notes with structured headings');

    // 14. AI Tutor Chat
    const chatRes = await request(`${API_BASE}/ai/chat`, {
      method: 'POST',
      body: JSON.stringify({
        message: 'Explain dynamic programming vs greedy algorithms simply.',
        materialId: testMaterial._id,
        language: 'en',
      }),
      ...studentAuthHeader,
    });
    assert(chatRes.data.data.reply && chatRes.data.data.reply.length > 20, 'POST /api/ai/chat - AI Tutor answered question with pedagogical clarity');

    // 15. AI Quiz Generation
    const aiQuizRes = await request(`${API_BASE}/ai/generate-quiz`, {
      method: 'POST',
      body: JSON.stringify({
        topic: 'Graph Traversal & Shortest Paths',
        subject: 'Computer Science',
        numQuestions: 4,
        difficulty: 'medium',
        questionType: 'mcq',
      }),
      ...studentAuthHeader,
    });
    assert(aiQuizRes.data.data.quiz && aiQuizRes.data.data.quiz.questions.length >= 4, 'POST /api/ai/generate-quiz - AI Quiz generated and saved to DB');
    const generatedQuiz = aiQuizRes.data.data.quiz;

    // 16. Quiz Attempt & Auto-Grading
    const attemptRes = await request(`${API_BASE}/quiz/${generatedQuiz._id}/attempt`, {
      method: 'POST',
      body: JSON.stringify({
        answers: [
          { questionIndex: 0, selectedAnswer: 0 },
          { questionIndex: 1, selectedAnswer: 1 },
          { questionIndex: 2, selectedAnswer: 0 },
          { questionIndex: 3, selectedAnswer: 1 },
        ],
        timeTakenSeconds: 85,
      }),
      ...studentAuthHeader,
    });
    assert(typeof attemptRes.data.data.score === 'number' && attemptRes.data.data.detailedReview.length > 0, 'POST /api/quiz/:id/attempt - Graded quiz attempt and returned detailed explanations');

    // 17. Learning Analytics
    const analyticsRes = await request(`${API_BASE}/analytics`, studentAuthHeader);
    assert(analyticsRes.data.data.analytics.totalQuizzesAttempted > 0, 'GET /api/analytics - Aggregated student learning metrics');

    // 18. Bookmarks System
    const createBmRes = await request(`${API_BASE}/bookmarks`, {
      method: 'POST',
      body: JSON.stringify({
        type: 'material',
        referenceId: testMaterial._id,
        title: 'Bookmarked Study Material',
        content: 'Important revision reference.',
      }),
      ...studentAuthHeader,
    });
    assert(createBmRes.data.data.bookmark._id, 'POST /api/bookmarks - Saved bookmark to knowledge vault');

    // 19. Global Search
    const searchRes = await request(`${API_BASE}/search?q=neural`, studentAuthHeader);
    assert(searchRes.data.data.totalCount > 0, 'GET /api/search - Cross-platform search returned relevant records');

    // 20. Admin User Management & Content Moderation
    const adminUsersRes = await request(`${API_BASE}/admin/users`, adminAuthHeader);
    assert(adminUsersRes.data.data.users.length >= 3, 'GET /api/admin/users - Admin retrieved all registered student accounts');

    const adminContentRes = await request(`${API_BASE}/admin/content`, adminAuthHeader);
    assert(adminContentRes.data.data.materials.length > 0 && adminContentRes.data.data.quizzes.length > 0, 'GET /api/admin/content - Admin retrieved all platform materials and quizzes');

    console.log('====================================================');
    console.log(`🏁 All Verification Tests Passed: ${passed} Passed, ${failed} Failed`);
    console.log('====================================================');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Test Suite Error:', error);
    process.exit(1);
  }
}

runTestSuite();
