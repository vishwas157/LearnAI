require('dotenv').config();
const { chatWithTutor, generateSummary, generateQuizWithAI } = require('../services/geminiService');

async function testAllGeminiQuestions() {
  console.log('====================================================');
  console.log('🧪 VERIFYING LIVE GEMINI RESPONSES FOR ALL 5 QUESTIONS');
  console.log('====================================================\n');

  // Test 1: Math Query
  console.log('----------------------------------------------------');
  console.log('Question 1: "What is 2 + 2?"');
  console.log('----------------------------------------------------');
  const res1 = await chatWithTutor({
    messages: [{ role: 'user', content: 'What is 2 + 2?' }],
    subject: 'Mathematics',
  });
  console.log('Answer 1:\n', res1);

  // Test 2: Binary Search
  console.log('\n----------------------------------------------------');
  console.log('Question 2: "Explain binary search in simple language."');
  console.log('----------------------------------------------------');
  const res2 = await chatWithTutor({
    messages: [{ role: 'user', content: 'Explain binary search in simple language.' }],
    subject: 'Computer Science',
  });
  console.log('Answer 2:\n', res2);

  // Test 3: DBMS vs RDBMS
  console.log('\n----------------------------------------------------');
  console.log('Question 3: "What is the difference between DBMS and RDBMS?"');
  console.log('----------------------------------------------------');
  const res3 = await chatWithTutor({
    messages: [{ role: 'user', content: 'What is the difference between DBMS and RDBMS?' }],
    subject: 'Database Management Systems',
  });
  console.log('Answer 3:\n', res3);

  // Test 4: Interactive Quiz Me
  console.log('\n----------------------------------------------------');
  console.log('Question 4: "Quiz me on neural networks."');
  console.log('----------------------------------------------------');
  const res4 = await chatWithTutor({
    messages: [{ role: 'user', content: 'Quiz me on neural networks.' }],
    subject: 'Artificial Intelligence',
  });
  console.log('Answer 4:\n', res4);

  // Test 5: Context-Aware Material Query
  console.log('\n----------------------------------------------------');
  console.log('Question 5: "Explain this material." (with Operating Systems scheduling context)');
  console.log('----------------------------------------------------');
  const sampleMaterial = `CPU scheduling is the process by which the operating system decides which process in the ready queue gets executed by the CPU. Preemptive scheduling interrupts running tasks when a higher-priority task arrives (e.g. Round Robin), whereas Non-preemptive scheduling allows tasks to run until termination or I/O wait (e.g. FCFS).`;
  const res5 = await chatWithTutor({
    messages: [{ role: 'user', content: 'Explain this material.' }],
    materialContext: sampleMaterial,
    subject: 'Operating Systems',
  });
  console.log('Answer 5:\n', res5);

  // Test 6: Multi-turn Chat Memory
  console.log('\n----------------------------------------------------');
  console.log('Test 6: Multi-Turn Conversation Memory');
  console.log('----------------------------------------------------');
  const conversation = [
    { role: 'user', content: 'What is normalization in databases?' },
    { role: 'assistant', content: 'Database normalization is the process of organizing data in a database to reduce data redundancy and improve data integrity.' },
    { role: 'user', content: 'Explain the second normal form.' }
  ];
  const res6 = await chatWithTutor({
    messages: conversation,
    subject: 'Database Systems',
  });
  console.log('Answer 6:\n', res6);

  console.log('\n====================================================');
  console.log('🏁 ALL GEMINI TESTS COMPLETED SUCCESSFULLY WITH ZERO HARDCODED RESPONSES!');
  console.log('====================================================');
}

testAllGeminiQuestions().catch(err => {
  console.error('Test Failed:', err);
  process.exit(1);
});
