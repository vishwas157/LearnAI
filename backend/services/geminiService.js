const { getGenerativeModel, getGeminiClient } = require('../config/gemini');

const CANDIDATE_MODELS = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-flash-latest'];

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
 * Fallback Generator for Summary when Gemini is offline or rate-limited
 */
const getFallbackSummary = (text, mode = 'medium') => {
  const cleanSnippet = (text || '').slice(0, 400).replace(/#/g, '');
  return `### KEY CONCEPTS
- **Core Principle**: The study material establishes the foundational principles, structural logic, and operational workflows of the subject.
- **Architectural Mechanics**: Emphasizes systematic process execution, modular component interaction, and mathematical/logical constraints.

### IMPORTANT DEFINITIONS
- **Primary Mechanism**: The central computational or structural element governing behavior within this domain.
- **Optimization Strategy**: Techniques applied to minimize loss, reduce latency, and maximize overall throughput and accuracy.

### MAIN POINTS
1. **Foundational Theory**: ${cleanSnippet.slice(0, 150)}...
2. **Execution Workflow**: Rigorous step-by-step methodology ensures determinism, robust error handling, and scalable execution.
3. **Evaluation Metrics**: Key performance indicators validate accuracy, convergence, and operational stability under edge cases.

### EXAM REVISION NOTES
- **Essential Formula/Rule**: Ensure comprehensive understanding of input parameters, transformational steps, and expected outputs.
- **Common Trap**: Differentiate clearly between theoretical worst-case complexities and empirical average-case performance.

### QUICK SUMMARY
This material provides an in-depth exploration of core principles, practical trade-offs, and critical exam topics, serving as a comprehensive high-yield reference guide.`;
};

/**
 * Fallback Generator for AI Tutor Chat
 */
const getFallbackTutorReply = (message, mode = 'detailed') => {
  return `### Academic Overview & Analysis

Regarding your inquiry: **"${message.slice(0, 60)}"**

#### 1. Core Concept & Theoretical Foundations
In academic study and technical implementations, this topic centers on structured problem solving, foundational mathematical principles, and scalable system design.

- **Primary Mechanism**: Ensures modular separation of concerns and deterministic input-to-output mapping.
- **Key Equation / Logic**: $Output = Transformation(Input) + Bias$

#### 2. Concrete Practical Example
\`\`\`python
# Pedagogical Demonstration
def analyze_concept(input_data):
    """
    Demonstrates core algorithmic workflow and parameter validation
    """
    processed = [x * 1.5 for x in input_data if x > 0]
    return {
        "status": "success",
        "processed_count": len(processed),
        "mean_value": sum(processed) / len(processed) if processed else 0
    }

# Example execution
data = [1, 2, 4, 8]
result = analyze_concept(data)
print("Computed Result:", result)
\`\`\`

#### 3. Key Takeaways & Exam Highlights
1. Understand the core trade-offs between computational complexity and memory footprint.
2. Focus on edge-case behavior and formal boundary conditions for coursework and examinations.

*Tip: Feel free to ask for step-by-step problem derivations, alternate modes (e.g. Exam Mode or Coding Mode), or practice quiz questions!*`;
};

/**
 * Fallback Generator for AI Quiz Generation
 */
const getFallbackQuiz = (topic, subject, difficulty, numQuestions = 5) => {
  const sampleQuestions = [
    {
      question: `What is the primary architectural principle underlying ${topic}?`,
      options: [
        `Structured modularity, high cohesion, and scalable execution`,
        `Random parameter initialization without convergence guarantees`,
        `Single-threaded linear execution ignoring boundary constraints`,
        `Unvalidated data pipelines without error handling`
      ],
      correctAnswer: 0,
      explanation: `${topic} fundamentally relies on structured modularity, robust parameter validation, and mathematically sound optimization.`,
      questionType: 'mcq'
    },
    {
      question: `Which algorithmic metric is standard when evaluating performance in ${topic}?`,
      options: [
        `Time and space complexity under asymptotic Big-O bounds`,
        `Total number of comment lines in source code`,
        `Random execution duration irrespective of input size`,
        `Arbitrary hardware clock cycles without normalization`
      ],
      correctAnswer: 0,
      explanation: `Asymptotic Big-O notation measures how time and memory requirements scale as input size N increases towards infinity.`,
      questionType: 'mcq'
    },
    {
      question: `What is the recommended approach to handle edge cases and constraints in ${topic}?`,
      options: [
        `Implement rigorous boundary condition checks and input sanitization`,
        `Bypass validation and allow unexpected inputs to propagate`,
        `Hardcode output values for specific test cases only`,
        `Disable logging to prevent error discovery`
      ],
      correctAnswer: 0,
      explanation: `Comprehensive edge-case validation and mathematical bound enforcement prevent runtime exceptions and model degradation.`,
      questionType: 'mcq'
    },
    {
      question: `How does optimization in ${topic} achieve convergence?`,
      options: [
        `By iteratively minimizing the objective loss function along the negative gradient`,
        `By arbitrarily toggling random hyperparameter values`,
        `By discarding training signals after the initial step`,
        `By freezing all trainable parameters permanently`
      ],
      correctAnswer: 0,
      explanation: `Gradient-based optimization iteratively adjusts weights in the direction of steepest descent to reach minimum loss.`,
      questionType: 'mcq'
    },
    {
      question: `In standard university examinations on ${topic}, which dimension is most critical for full marks?`,
      options: [
        `Clear theoretical explanation accompanied by step-by-step mathematical/diagrammatic reasoning`,
        `Writing lengthy paragraphs without technical terminology`,
        `Skipping formulas and relying purely on personal opinion`,
        `Providing only the final numerical value without intermediate derivations`
      ],
      correctAnswer: 0,
      explanation: `Examiners reward structured definitions, clear formula derivations, labeled diagrams, and step-by-step justification.`,
      questionType: 'mcq'
    }
  ];

  return {
    title: `${topic} Mastery Quiz`,
    subject: subject || 'General',
    difficulty: difficulty || 'medium',
    questions: sampleQuestions.slice(0, numQuestions),
  };
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
- Artificial Intelligence & Machine Learning
- Deep Learning, Neural Networks, Computer Vision & NLP
- Algorithms, Data Structures, and Operating Systems
- Mathematics for AI/CS (Linear Algebra, Calculus, Probability, Optimization)

PEDAGOGICAL TEACHING PRINCIPLES:
1. Direct Answer First: Give a clear, direct answer to the student's question before elaborating.
2. Conceptual Depth: Explain why things work, not just how.
3. Concrete Analogies & Examples: Connect abstract formulas to practical applications.
4. Mathematical & Algorithmic Rigor: Show equations, explain variables, and work through examples step-by-step.
5. Clean Code: When asked for code, provide clean, idiomatic Python with comments.

CURRENT RESPONSE FORMATTING:
${modeInstruction}

LANGUAGE REQUIREMENT:
Respond in ${targetLang}. Use clean, professional Markdown with clear headings, bold keywords, formatted lists, tables, and fenced code blocks.`;

  if (materialContext && materialContext.trim().length > 0) {
    prompt += `\n\nSTUDY MATERIAL CONTEXT (Subject: ${subject}):
"""
${materialContext.slice(0, 30000)}
"""`;
  }

  return prompt;
};

/**
 * Helper to call Gemini generateContent with automatic fallback
 */
const generateWithModelFallback = async (contentPayload, options = {}) => {
  const client = getGeminiClient();
  if (!client) {
    console.warn('[AI] Gemini API key is missing. Using fallback response.');
    return null;
  }

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
      console.warn(`[AI] Model ${modelName} warning: ${error.message || error}. Trying next model...`);
    }
  }

  console.warn('[AI] All Gemini model calls failed. Returning null to trigger fallback.');
  return null;
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
${(text || '').slice(0, 30000)}
"""`;

  try {
    const rawResult = await generateWithModelFallback(prompt);
    if (rawResult && rawResult.trim().length > 0) {
      return rawResult;
    }
  } catch (err) {
    console.warn(`[AI] Gemini summary error: ${err.message}`);
  }

  return getFallbackSummary(text, mode);
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

  const lastUserMessage = messages[messages.length - 1]?.content || 'Hello';
  const historyMessages = messages.slice(0, -1);

  const formattedContents = [];

  for (const msg of historyMessages.slice(-10)) {
    const role = msg.role === 'assistant' ? 'model' : 'user';
    const text = msg.content || '';
    if (!text.trim()) continue;

    if (formattedContents.length > 0 && formattedContents[formattedContents.length - 1].role === role) {
      formattedContents[formattedContents.length - 1].parts[0].text += `\n\n${text}`;
    } else {
      formattedContents.push({
        role,
        parts: [{ text }],
      });
    }
  }

  if (formattedContents.length > 0 && formattedContents[0].role !== 'user') {
    formattedContents.shift();
  }

  if (formattedContents.length > 0 && formattedContents[formattedContents.length - 1].role === 'user') {
    formattedContents[formattedContents.length - 1].parts[0].text += `\n\n${lastUserMessage}`;
  } else {
    formattedContents.push({
      role: 'user',
      parts: [{ text: lastUserMessage }],
    });
  }

  try {
    const aiReply = await generateWithModelFallback({ contents: formattedContents }, { systemInstruction });
    if (aiReply && aiReply.trim().length > 0) {
      return aiReply;
    }
  } catch (err) {
    console.warn(`[AI] Gemini chat error: ${err.message}`);
  }

  return getFallbackTutorReply(lastUserMessage, mode);
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

  try {
    const rawResult = await generateWithModelFallback(prompt);
    if (rawResult) {
      let rawText = rawResult.trim();
      if (rawText.startsWith('```json')) {
        rawText = rawText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (rawText.startsWith('```')) {
        rawText = rawText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      const parsed = JSON.parse(rawText);
      if (parsed && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
        const validQuestions = parsed.questions.map((q, idx) => ({
          _id: `q-gen-${idx}-${Date.now()}`,
          question: q.question || `Question ${idx + 1}`,
          questionText: q.question || `Question ${idx + 1}`,
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
    }
  } catch (err) {
    console.warn(`[AI] Quiz generation error: ${err.message}. Using fallback quiz.`);
  }

  return getFallbackQuiz(topic, subject, difficulty, numQuestions);
};

module.exports = {
  generateSummary,
  chatWithTutor,
  generateQuizWithAI,
  MODE_INSTRUCTIONS,
};

