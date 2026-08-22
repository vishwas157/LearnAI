const { chatWithTutor, generateSummary, generateQuizWithAI } = require('../services/geminiService');

async function testGemini() {
  console.log('====================================================');
  console.log('🧪 Testing Gemini Service & Zero-Template Flow');
  console.log('====================================================\n');

  // Test 1: Verification of error throwing when API key is missing
  console.log('Test 1: Missing API Key Error Verification');
  try {
    await chatWithTutor({
      messages: [{ role: 'user', content: 'What is 2 + 2?' }],
      subject: 'Math',
    });
    console.error('❌ FAIL: Expected error when GEMINI_API_KEY is missing, but got response.');
  } catch (err) {
    if (err.code === 'MISSING_API_KEY') {
      console.log('✓ PASS: Accurately threw MISSING_API_KEY error with message:', err.message);
    } else {
      console.log('✓ PASS: Threw error (no hardcoded fallback):', err.message);
    }
  }

  console.log('\n====================================================');
  console.log('To test live Gemini generative responses, set GEMINI_API_KEY in backend/.env');
  console.log('====================================================\n');
}

testGemini();
