require('dotenv').config();
const { chatWithTutor } = require('../services/geminiService');

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runAcademicSuite() {
  console.log('================================================================');
  console.log('🎓 LEARNAI ACADEMIC AI/ML/DL TUTOR - 12-POINT LIVE VERIFICATION');
  console.log('================================================================\n');

  const testCases = [
    {
      id: 1,
      title: '1. Definition & Scope: "What is artificial intelligence?"',
      query: 'What is artificial intelligence?',
      subject: 'Artificial Intelligence',
      mode: 'detailed'
    },
    {
      id: 2,
      title: '2. Beginner-Friendly: "Explain machine learning in simple words."',
      query: 'Explain machine learning in simple words.',
      subject: 'Machine Learning',
      mode: 'simple'
    },
    {
      id: 3,
      title: '3. Core ML Diagnostics: "What is overfitting?"',
      query: 'What is overfitting?',
      subject: 'Machine Learning',
      mode: 'detailed'
    },
    {
      id: 4,
      title: '4. Optimization with Example: "Explain gradient descent with an example."',
      query: 'Explain gradient descent with an example.',
      subject: 'Optimization & ML',
      mode: 'problem_solving'
    },
    {
      id: 5,
      title: '5. Deep Learning Architecture Comparison: "What is the difference between CNN and RNN?"',
      query: 'What is the difference between CNN and RNN?',
      subject: 'Deep Learning',
      mode: 'compare'
    },
    {
      id: 6,
      title: '6. Mathematical Rigor: "Explain backpropagation mathematically."',
      query: 'Explain backpropagation mathematically with the chain rule.',
      subject: 'Neural Networks & Calculus',
      mode: 'detailed'
    },
    {
      id: 7,
      title: '7. Python Implementation: "Write Python code for linear regression."',
      query: 'Write Python code for linear regression using Scikit-Learn and NumPy.',
      subject: 'Python & Data Science',
      mode: 'coding'
    },
    {
      id: 8,
      title: '8. Interactive Active Recall: "Quiz me on neural networks."',
      query: 'Quiz me on neural networks.',
      subject: 'Deep Learning',
      mode: 'quiz_me'
    },
    {
      id: 9,
      title: '9. University Exam Answer: "Give me an exam answer for supervised learning."',
      query: 'Give me a structured university exam answer for supervised learning.',
      subject: 'Machine Learning',
      mode: 'exam'
    },
    {
      id: 10,
      title: '10. GenAI & Modern NLP: "Explain transformers."',
      query: 'Explain transformers architecture and self-attention mechanism.',
      subject: 'Natural Language Processing & Generative AI',
      mode: 'detailed'
    },
    {
      id: 11,
      title: '11. Concept Taxonomy: "What is the difference between AI, ML and DL?"',
      query: 'What is the difference between AI, ML and DL?',
      subject: 'Artificial Intelligence',
      mode: 'compare'
    },
    {
      id: 12,
      title: '12. Multi-turn Follow-up: "What is the role of self-attention in it?"',
      isMultiTurn: true,
      history: [
        { role: 'user', content: 'What are transformers in deep learning?' },
        { role: 'assistant', content: 'Transformers are deep learning architectures introduced in "Attention Is All You Need" (2017) that process sequences in parallel using self-attention.' },
        { role: 'user', content: 'What is the role of self-attention in it?' }
      ],
      subject: 'NLP & Transformers',
      mode: 'detailed'
    }
  ];

  for (const tc of testCases) {
    console.log(`\n----------------------------------------------------------------`);
    console.log(`🧪 Running Test ${tc.id}: ${tc.title}`);
    console.log(`----------------------------------------------------------------`);

    try {
      const messages = tc.isMultiTurn
        ? tc.history
        : [{ role: 'user', content: tc.query }];

      const startTime = Date.now();
      const answer = await chatWithTutor({
        messages,
        subject: tc.subject,
        mode: tc.mode,
      });
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);

      console.log(`✓ Response generated in ${duration}s (Length: ${answer.length} chars)`);
      console.log(`\nSample Output Snippet:\n${answer.slice(0, 350)}...\n`);
    } catch (err) {
      console.error(`❌ Test ${tc.id} Failed:`, err.message);
      process.exit(1);
    }

    // Brief rate-limit pause between consecutive queries
    await delay(1000);
  }

  console.log('\n================================================================');
  console.log('🎉 ALL 12 ACADEMIC AI/ML/DL TEST CASES COMPLETED SUCCESSFULLY!');
  console.log('================================================================\n');
}

runAcademicSuite().catch((err) => {
  console.error('Suite crashed:', err);
  process.exit(1);
});
