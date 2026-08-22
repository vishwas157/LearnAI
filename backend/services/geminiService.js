const { getGenerativeModel, getGeminiClient } = require('../config/gemini');

const CANDIDATE_MODELS = ['gemini-3.6-flash', 'gemini-flash-latest', 'gemini-3.5-flash'];

/**
 * Robust Mode Instructions for Academic Tutor
 */
const MODE_INSTRUCTIONS = {
  simple: `MODE: Simple Explanation (Beginner Friendly)
- Explain to a beginner student using simple, everyday language and an intuitive real-world analogy.
- Avoid unnecessary jargon or explain technical terms immediately in plain English.
- Focus on intuition, high-level picture, and practical relevance.`,

  detailed: `MODE: Detailed Technical Explanation
- Provide an in-depth, rigorous academic explanation covering core mechanisms, theoretical foundation, architecture, and mathematical rationale.
- Include formal definitions, structured headings, and considerations for practical implementations.`,

  exam: `MODE: University Exam Answer
- Structure as a high-scoring university examination answer with distinct sections:
  1. Formal Definition & Core Concept
  2. Detailed Theoretical Explanation (with numbered points)
  3. Mathematical Formulas / Architecture / Flow Breakdown
  4. Concrete Practical Example
  5. Key Advantages & Limitations
  6. Concluding Summary
- Highlight exam-critical points and likely test questions.`,

  interview: `MODE: Technical Interview Preparation
- Format as an answer for a top-tier Tech / Data Science / AI Engineer interview:
  - Crisp, confident 30-second elevator pitch definition.
  - Core mechanics and internal workings.
  - Key trade-offs, edge cases, time & space complexities (O(...)).
  - Common interview pitfalls and 2-3 likely follow-up questions with concise answers.`,

  coding: `MODE: Coding Implementation & Software Engineering
- Provide clean, robust, well-commented Python code using modern standard libraries (e.g. NumPy, PyTorch, Scikit-learn, Pandas, TensorFlow).
- First explain the algorithmic logic and prerequisites.
- Provide the complete code with inline comments on critical lines.
- Explain key sections of the code and describe expected input/output.`,

  problem_solving: `MODE: Step-by-Step Problem Solving
- Solve the problem with thorough pedagogical rigor.
- State Given parameters, Target objective, and Formulas used.
- Walk through each mathematical/computational step with intermediate calculations and clear justifications.
- State the final verified answer clearly.`,

  quiz_me: `MODE: Interactive Quiz & Active Recall
- Create an engaging active recall quiz on the topic.
- Include 3-5 high-yield questions (mix of Conceptual MCQ, Scenario-based, and Short Calculation/Reasoning).
- Provide the answer choices, then invite the student to answer OR provide full answer explanations with pedagogical reasoning.`,

  revision: `MODE: High-Impact Revision Notes
- Format as concise, high-impact revision notes for rapid pre-exam review:
  - Bulleted key concepts & definitions.
  - Critical formulas, equations, and cheat-sheet rules.
  - Common traps & mnemonics.`,

  compare: `MODE: Comparative Concept Analysis
- Provide a structured side-by-side comparison table analyzing the concepts.
- Highlight key dimensions: Definition, Architecture, Training/Execution, Complexity, Use Cases, Advantages, and Limitations.
- Conclude with a decision guide on when to choose which.`,

  research: `MODE: Research & Advanced Architecture
- Discuss state-of-the-art developments, mathematical derivations, optimization challenges, novel loss functions, scaling laws, and modern research literature directions.`
};

/**
 * Build Comprehensive Academic System Prompt
 */
const buildAcademicSystemInstruction = ({ subject = 'General', mode = 'detailed', materialContext = '', language = 'en' }) => {
  const langNames = { en: 'English', hi: 'Hindi', gu: 'Gujarati' };
  const targetLang = langNames[language] || 'English';

  const modeInstruction = MODE_INSTRUCTIONS[mode] || MODE_INSTRUCTIONS.detailed;

  let prompt = `You are LearnAI, an expert academic AI tutor and personal study mentor.
Your goal is to help students truly understand subjects deeply, cultivate rigorous academic problem-solving skills, and prepare them thoroughly for coursework and exams.

KNOWLEDGE DOMAINS:
You have deep, authoritative mastery of:
- Artificial Intelligence (Intelligent agents, search algorithms: BFS, DFS, A*, heuristics, knowledge representation, expert systems, planning, uncertainty).
- Machine Learning (Supervised, unsupervised, reinforcement learning, linear/logistic regression, SVM, decision trees, random forests, boosting, XGBoost, PCA, clustering, bias-variance tradeoff, regularization, evaluation metrics).
- Deep Learning & Neural Networks (Perceptrons, backpropagation, gradient descent, optimizers, CNNs, RNNs, LSTMs, GRUs, Transformers, Attention mechanisms, Autoencoders, GANs, embeddings).
- Natural Language Processing (Tokenization, TF-IDF, Word2Vec, BERT, GPT, Seq2Seq, attention, LLMs, prompt engineering, RAG, vector databases).
- Computer Vision (Convolution, pooling, feature maps, image classification, object detection, segmentation, transfer learning).
- Generative AI (LLMs, fine-tuning, inference, embeddings, RAG architectures, multi-agent systems, multimodal AI, AI safety).
- Mathematics for AI/ML (Linear Algebra, vectors, matrices, determinants, eigenvalues; Calculus, gradients, Jacobians, Hessians, chain rule; Probability & Statistics, Bayes theorem, distributions, variance, entropy, cross-entropy; Optimization, convex functions, gradient descent variants).
- Algorithms & Data Structures and Computer Science fundamentals.

PEDAGOGICAL TEACHING PRINCIPLES:
1. Direct Answer First: Give a clear, direct answer to the student's question before elaborating.
2. Conceptual Depth: Explain why things work, not just how.
3. Concrete Analogies & Examples: Connect abstract formulas to everyday intuition and practical software/AI applications.
4. Mathematical & Algorithmic Rigor: When math is involved, explain the intuition, show the formula, explain every variable, and work through examples step-by-step.
5. Clean Code: When asked for code, provide clean, idiomatic Python (NumPy, Scikit-learn, PyTorch, Pandas) with comments and walkthrough.
6. Honest & Fact-based: Never invent facts or formulas. If uncertain, state so clearly.

CURRENT RESPONSE FORMATTING:
${modeInstruction}

LANGUAGE REQUIREMENT:
Respond in ${targetLang}. Use clean, professional Markdown with clear headings, bold keywords, formatted lists, tables, and fenced code blocks.`;

  if (materialContext && materialContext.trim().length > 0) {
    prompt += `\n\nSTUDY MATERIAL CONTEXT (Subject: ${subject}):
"""
${materialContext.slice(0, 30000)}
"""
MATERIAL CONTEXT RULE:
Use the supplied study material as your primary source. If the answer is not present in the material, explicitly state: "This topic is not covered in the selected material.", and then provide general academic knowledge clearly labelled as additional explanation.`;
  }

  return prompt;
};

/**
 * Helper to call Gemini generateContent with automatic model fallback on temporary 503/429/404 errors
 */
const generateWithModelFallback = async (contentPayload, options = {}) => {
  const client = getGeminiClient();
  if (!client) {
    console.error('[AI] Gemini API key is missing from backend/.env');
    const err = new Error('Gemini API key is not configured in backend/.env');
    err.code = 'MISSING_API_KEY';
    throw err;
  }

  let lastError = null;

  for (const modelName of CANDIDATE_MODELS) {
    try {
      console.log(`[AI] Gemini request started (Model: ${modelName})`);
      const model = client.getGenerativeModel({ model: modelName, ...options });
      
      const result = await model.generateContent(contentPayload);
      const response = await result.response;
      const text = response.text();
      console.log(`[AI] Gemini response received (Model: ${modelName})`);
      return text;
    } catch (error) {
      lastError = error;
      console.warn(`[AI] Model ${modelName} warning: ${error.message || error}. Trying fallback candidate...`);
    }
  }

  console.error('[AI] All Gemini model attempts failed:', lastError?.message);
  const err = new Error(lastError?.message || 'Unable to connect to the AI service.');
  err.code = 'AI_SERVICE_ERROR';
  throw err;
};

/**
 * Generate AI Summary from text using Gemini
 */
const generateSummary = async ({ text, mode = 'medium', language = 'en' }) => {
  const langInstructions = {
    en: 'Output in clear, academic English.',
    hi: 'Output in fluent Hindi (हिंदी) using appropriate Devanagari script and clear terminology.',
    gu: 'Output in fluent Gujarati (ગુજરાતી) using clear and accurate academic terminology.',
  };

  const modePrompts = {
    quick: 'Provide a concise high-yield executive summary focusing only on the most critical takeaways.',
    medium: 'Provide a balanced conceptual breakdown with key points and definitions.',
    detailed: 'Provide an in-depth, comprehensive educational breakdown with thorough explanations.',
    bullet_points: 'Format the entire output as structured, concise bullet points for rapid reading.',
    exam_revision: 'Format as high-impact exam revision notes highlighting formulas, key facts, and likely test questions.',
  };

  const prompt = `You are an expert academic tutor and EdTech summarization specialist for LearnAI.
Analyze the following study material and generate a structured summary.
STRICT RULE: Do NOT invent facts or hallucinate information that is not supported by the source text.

Summary Style Mode: ${modePrompts[mode] || modePrompts.medium}
Language Requirement: ${langInstructions[language] || langInstructions.en}

Your response MUST follow this structured format with these exact uppercase headings:

### KEY CONCEPTS
[Core concepts explained clearly]

### IMPORTANT DEFINITIONS
[Key terms and their precise definitions]

### MAIN POINTS
[Numbered or bulleted list of essential arguments/facts]

### EXAM REVISION NOTES
[Critical formulas, test-focused highlights, or mnemonics]

### QUICK SUMMARY
[A 2-3 sentence concluding synthesis]

SOURCE TEXT:
"""
${text.slice(0, 30000)}
"""`;

  return await generateWithModelFallback(prompt);
};

/**
 * Interactive AI Tutor Chat with conversation history and optional material context
 */
const chatWithTutor = async ({ messages = [], materialContext = '', subject = 'General', mode = 'detailed', language = 'en' }) => {
  const systemInstruction = buildAcademicSystemInstruction({
    subject,
    mode,
    materialContext,
    language,
  });

  // Build real conversation history for Gemini (strict alternation of user and model)
  const lastUserMessage = messages[messages.length - 1]?.content || 'Hello';
  const historyMessages = messages.slice(0, -1);

  const formattedContents = [];

  // Helper to safely append alternating turns
  for (const msg of historyMessages.slice(-10)) {
    const role = msg.role === 'assistant' ? 'model' : 'user';
    const text = msg.content || '';
    if (!text.trim()) continue;

    if (formattedContents.length > 0 && formattedContents[formattedContents.length - 1].role === role) {
      // Merge consecutive same-role messages
      formattedContents[formattedContents.length - 1].parts[0].text += `\n\n${text}`;
    } else {
      formattedContents.push({
        role,
        parts: [{ text }],
      });
    }
  }

  // Ensure history starts with 'user' if non-empty
  if (formattedContents.length > 0 && formattedContents[0].role !== 'user') {
    formattedContents.shift();
  }

  // Append current user message
  if (formattedContents.length > 0 && formattedContents[formattedContents.length - 1].role === 'user') {
    formattedContents[formattedContents.length - 1].parts[0].text += `\n\n${lastUserMessage}`;
  } else {
    formattedContents.push({
      role: 'user',
      parts: [{ text: lastUserMessage }],
    });
  }

  return await generateWithModelFallback({ contents: formattedContents }, { systemInstruction });
};

/**
 * Generate Structured Quiz using Gemini
 */
const generateQuizWithAI = async ({ topic, subject = 'General', numQuestions = 5, difficulty = 'medium', questionType = 'mcq', materialContent = '', language = 'en' }) => {
  const langNames = { en: 'English', hi: 'Hindi', gu: 'Gujarati' };
  const targetLang = langNames[language] || 'English';

  const prompt = `You are an expert curriculum and exam designer for LearnAI.
Create a high-quality ${difficulty} difficulty quiz on the topic: "${topic}" (Subject: ${subject}).
Number of questions: ${numQuestions}.
Question Type: ${questionType}.
Language: ${targetLang}.

${materialContent ? `SOURCE MATERIAL TO BASE QUESTIONS ON:\n"""\n${materialContent.slice(0, 30000)}\n"""\n` : ''}

CRITICAL REQUIREMENT:
You MUST respond ONLY with a valid, parseable JSON object. No Markdown code fences, no backticks, no comments, no extra text before or after.

JSON SCHEMA:
{
  "title": "${topic} Quiz",
  "subject": "${subject}",
  "difficulty": "${difficulty}",
  "questions": [
    {
      "question": "Clear, precise question text here?",
      "options": [
        "Option A text",
        "Option B text",
        "Option C text",
        "Option D text"
      ],
      "correctAnswer": 0,
      "explanation": "Detailed explanation of why Option A is correct and why other options are incorrect.",
      "questionType": "mcq"
    }
  ]
}

Ensure "correctAnswer" is an integer index from 0 to 3 corresponding to the correct string in the "options" array.
For True/False questions, options should have exactly ["True", "False"] and correctAnswer 0 or 1.
Every question MUST include a thorough, pedagogical explanation.`;

  const rawResult = await generateWithModelFallback(prompt);
  let rawText = rawResult.trim();

  if (rawText.startsWith('```json')) {
    rawText = rawText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (rawText.startsWith('```')) {
    rawText = rawText.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  const parsed = JSON.parse(rawText);
  if (parsed && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
    const validQuestions = parsed.questions.map((q, idx) => ({
      question: q.question || `Question ${idx + 1}`,
      options: Array.isArray(q.options) && q.options.length >= 2 ? q.options : ["Option A", "Option B", "Option C", "Option D"],
      correctAnswer: typeof q.correctAnswer === 'number' && q.correctAnswer >= 0 && q.correctAnswer < (q.options?.length || 4) ? q.correctAnswer : 0,
      explanation: q.explanation || 'Refer to the study material for detailed solution steps.',
      questionType: q.questionType || 'mcq'
    }));

    return {
      title: parsed.title || `${topic} Quiz`,
      subject: parsed.subject || subject,
      difficulty: parsed.difficulty || difficulty,
      questions: validQuestions,
    };
  }

  throw new Error('Invalid JSON structure returned by AI model.');
};

module.exports = {
  generateSummary,
  chatWithTutor,
  generateQuizWithAI,
  MODE_INSTRUCTIONS,
};
