const User = require('../models/User');
const Material = require('../models/Material');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const Bookmark = require('../models/Bookmark');
const LearningActivity = require('../models/LearningActivity');
const ChatSession = require('../models/ChatSession');

const seedInitialData = async () => {
  try {
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      console.log('Database already contains records. Skipping seed.');
      return;
    }

    console.log('Seeding fresh LearnAI demo data...');

    // 1. Create Demo Users with deterministic ObjectIds (Verified for immediate login)
    const studentUser = await User.create({
      _id: '650000000000000000000001',
      name: 'Alex Johnson',
      email: 'student@learnai.com',
      password: 'password123',
      role: 'student',
      preferredLanguage: 'en',
      avatar: 'avatar-1',
      emailVerified: true,
      studyStreak: 5,
      totalStudyTimeMinutes: 180,
    });

    const adminUser = await User.create({
      _id: '650000000000000000000002',
      name: 'Dr. Sarah Connor',
      email: 'admin@learnai.com',
      password: 'adminpassword123',
      role: 'admin',
      preferredLanguage: 'en',
      avatar: 'avatar-4',
      emailVerified: true,
      studyStreak: 12,
      totalStudyTimeMinutes: 420,
    });

    console.log('✓ Created Demo Users: student@learnai.com, admin@learnai.com');

    // 2. Create Sample Study Materials
    const material1 = await Material.create({
      title: 'Neural Networks & Deep Learning Architectures',
      description: 'Comprehensive guide to artificial neural networks, backpropagation, activation functions, and transformer attention mechanisms.',
      subject: 'Artificial Intelligence',
      fileType: 'manual',
      uploadedBy: studentUser._id,
      tags: ['AI', 'Deep Learning', 'Neural Networks', 'Transformers'],
      readingProgress: 85,
      isCompleted: false,
      studyTimeSeconds: 2400,
      content: `# Neural Networks & Deep Learning Architectures

## 1. Fundamental Concepts
Artificial Neural Networks (ANNs) are computational models inspired by biological neural systems in the animal brain. An ANN consists of connected units or nodes called artificial neurons. Each connection can transmit a signal to other neurons.

### Core Components:
1. **Input Layer:** Receives raw sensory data or feature vectors without processing.
2. **Hidden Layers:** Extract progressive levels of abstract features through mathematical transformations.
3. **Output Layer:** Produces predictions (e.g., class probabilities in classification or continuous values in regression).

## 2. Mathematical Foundations
Each neuron calculates a weighted sum of inputs, adds a learnable bias term, and applies a non-linear activation function:

$$z = \\sum_{i=1}^n w_i x_i + b$$
$$a = \\sigma(z)$$

### Common Activation Functions:
- **ReLU (Rectified Linear Unit):** $f(x) = \\max(0, x)$. Highly popular due to computational simplicity and reducing vanishing gradients.
- **Sigmoid:** $\\sigma(x) = \\frac{1}{1 + e^{-x}}$. Maps values to $(0, 1)$, ideal for binary classification output layers.
- **Softmax:** Normalizes an unconstrained score vector into a probability distribution summing to 1.0.

## 3. Backpropagation and Optimization
Backpropagation calculates the gradient of the loss function with respect to each weight via the Chain Rule of calculus. An optimization algorithm like **Adam** (Adaptive Moment Estimation) or **SGD** (Stochastic Gradient Descent) uses these gradients to adjust weights iteratively:

$$w_{new} = w_{old} - \\alpha \\frac{\\partial L}{\\partial w}$$

where $\\alpha$ represents the learning rate.

## 4. Modern Architectures
- **Convolutional Neural Networks (CNNs):** Excel in visual data using localized spatial feature filters and pooling layers.
- **Recurrent Neural Networks (RNNs & LSTMs):** Model sequential data and time-series dependencies.
- **Transformers:** Utilize Self-Attention mechanisms ($Attention(Q, K, V) = \\text{softmax}(\\frac{QK^T}{\\sqrt{d_k}})V$) to process tokens in parallel across long contexts.`,
    });

    const material2 = await Material.create({
      title: 'Data Structures and Algorithm Complexity (Big-O)',
      description: 'Mastering asymptotic notation, trees, graphs, dynamic programming, and search algorithms.',
      subject: 'Computer Science',
      fileType: 'manual',
      uploadedBy: studentUser._id,
      tags: ['Data Structures', 'Algorithms', 'Big-O', 'Trees', 'Graphs'],
      readingProgress: 100,
      isCompleted: true,
      studyTimeSeconds: 3600,
      content: `# Data Structures & Algorithm Complexity (Big-O)

## 1. Asymptotic Analysis
Asymptotic notation characterizes algorithm efficiency when input size $N$ grows arbitrarily large, ignoring hardware constants.

### Common Time Complexities:
- **$O(1)$ - Constant Time:** Hash table lookup, array index access.
- **$O(\\log N)$ - Logarithmic Time:** Binary Search on sorted arrays, balanced binary search tree operations.
- **$O(N)$ - Linear Time:** Single linear scan, string matching.
- **$O(N \\log N)$ - Linearithmic Time:** MergeSort, QuickSort (average), HeapSort.
- **$O(N^2)$ - Quadratic Time:** BubbleSort, nested loop matrix traversal.
- **$O(2^N)$ - Exponential Time:** Naive recursive Fibonacci computation.

## 2. Core Non-Linear Data Structures
### Binary Search Trees (BST)
A binary tree where for each node $u$, all values in the left subtree are smaller than $u$, and all values in the right subtree are greater than $u$.
- In-order traversal visits nodes in non-decreasing sorted order.
- Self-balancing trees (AVL, Red-Black Trees) guarantee $O(\\log N)$ worst-case height.

### Graphs
Represented using either an **Adjacency Matrix** ($O(V^2)$ space) or an **Adjacency List** ($O(V + E)$ space).
- **Breadth-First Search (BFS):** Uses a Queue, explores nearest neighbors first, finds shortest unweighted paths.
- **Depth-First Search (DFS):** Uses recursion/Stack, explores down each branch to exhaustion, detects topological sorts and cycles.

## 3. Dynamic Programming Strategy
Solves complex problems by breaking them into overlapping subproblems with optimal substructure.
- **Memoization (Top-Down):** Recursive approach caching subproblem results in a hash table.
- **Tabulation (Bottom-Up):** Iterative approach building solutions sequentially in an array.`,
    });

    const material3 = await Material.create({
      title: 'Cellular Respiration and Photosynthesis',
      description: 'Biochemical pathways of ATP generation, glycolysis, Krebs cycle, and light reactions.',
      subject: 'Biology',
      fileType: 'manual',
      uploadedBy: studentUser._id,
      tags: ['Biology', 'Biochemistry', 'ATP', 'Cellular Respiration'],
      readingProgress: 60,
      isCompleted: false,
      studyTimeSeconds: 1500,
      content: `# Cellular Respiration and Photosynthesis

## 1. Cellular Respiration Overview
Cellular respiration is the biochemical process by which eukaryotic cells convert glucose and oxygen into chemical energy (ATP), releasing carbon dioxide and water as byproducts:

$$C_6H_{12}O_6 + 6O_2 \\rightarrow 6CO_2 + 6H_2O + \\sim 32\\text{ ATP}$$

### Three Main Stages:
1. **Glycolysis:** Occurs in the cytoplasm. Converts 1 glucose into 2 pyruvate molecules, yielding a net of 2 ATP and 2 NADH. Anaerobic (requires no oxygen).
2. **Citric Acid Cycle (Krebs Cycle):** Occurs in the mitochondrial matrix. Generates electron carriers (NADH and $FADH_2$) along with 2 ATP.
3. **Oxidative Phosphorylation:** Occurs across the inner mitochondrial membrane. The Electron Transport Chain (ETC) pumps protons to generate a gradient that drives ATP Synthase, yielding $\\sim 28$ ATP.

## 2. Photosynthesis: Light and Dark Reactions
Photosynthesis converts solar radiant energy into chemical energy stored in glucose bonds:
$$6CO_2 + 6H_2O + \\text{Light} \\rightarrow C_6H_{12}O_6 + 6O_2$$

- **Light-Dependent Reactions:** Take place in thylakoid membranes; water is split (photolysis) to generate $O_2$, ATP, and NADPH.
- **Calvin Cycle (Light-Independent):** Takes place in the stroma; enzyme RuBisCO fixes $CO_2$ into G3P sugars.`,
    });

    console.log('✓ Created Sample Study Materials');

    // 3. Create Sample Quizzes
    const quiz1 = await Quiz.create({
      title: 'Deep Learning & Neural Networks Mastery',
      description: 'Test your understanding of activation functions, backpropagation, and transformer architectures.',
      subject: 'Artificial Intelligence',
      difficulty: 'medium',
      timeLimitMinutes: 10,
      createdBy: studentUser._id,
      generatedByAI: true,
      materialReference: material1._id,
      questions: [
        {
          question: 'What is the primary reason the ReLU activation function is widely favored over Sigmoid in deep hidden layers?',
          options: [
            'It prevents the vanishing gradient problem and is computationally efficient',
            'It restricts outputs strictly between -1 and +1',
            'It is differentiable at all points including exactly zero',
            'It completely eliminates the need for a bias term'
          ],
          correctAnswer: 0,
          explanation: 'ReLU (max(0, x)) has a constant gradient of 1 for positive values, which prevents gradients from decaying exponentially (vanishing gradient) during backpropagation through many deep layers.',
          questionType: 'mcq'
        },
        {
          question: 'In the Transformer self-attention mechanism, what do the symbols Q, K, and V represent?',
          options: [
            'Quantity, Kinetic energy, and Velocity',
            'Query, Key, and Value vectors',
            'Queue, Kernel, and Variable matrix',
            'Quadratic, Kalman, and Variance operators'
          ],
          correctAnswer: 1,
          explanation: 'In self-attention, input tokens are projected into Query, Key, and Value matrices to calculate dynamic attention weight distributions.',
          questionType: 'mcq'
        },
        {
          question: 'Which optimization algorithm adapts individual learning rates for different parameters using first and second moments of gradients?',
          options: [
            'Standard Batch Gradient Descent',
            'Adam (Adaptive Moment Estimation)',
            'Bubble Search Optimizer',
            'Depth First Optimizer'
          ],
          correctAnswer: 1,
          explanation: 'Adam combines the principles of Momentum (first moment) and RMSprop (second moment) to maintain per-parameter adaptive learning rates.',
          questionType: 'mcq'
        },
        {
          question: 'What mathematical rule enables backpropagation to compute partial derivatives through nested layer transformations?',
          options: [
            'Pythagorean Theorem',
            'Chain Rule of Calculus',
            'Euler Characteristic',
            'Fundamental Theorem of Arithmetic'
          ],
          correctAnswer: 1,
          explanation: 'The Chain Rule of calculus enables the propagation of the loss gradient backward layer by layer through compositions of functions.',
          questionType: 'mcq'
        },
        {
          question: 'Which neural network architecture is traditionally best suited for computer vision and localized feature extraction?',
          options: [
            'Convolutional Neural Networks (CNNs)',
            'Simple Feedforward Perceptron',
            'Recurrent Neural Network without gates',
            'Markov Decision Process'
          ],
          correctAnswer: 0,
          explanation: 'CNNs utilize spatial convolution kernels to extract translation-invariant visual patterns like edges, textures, and object parts.',
          questionType: 'mcq'
        }
      ]
    });

    const quiz2 = await Quiz.create({
      title: 'Algorithm Complexity & Data Structures Benchmark',
      description: 'Evaluate your knowledge of Big-O complexity, binary search trees, and graph algorithms.',
      subject: 'Computer Science',
      difficulty: 'hard',
      timeLimitMinutes: 12,
      createdBy: studentUser._id,
      generatedByAI: true,
      materialReference: material2._id,
      questions: [
        {
          question: 'What is the worst-case time complexity of standard QuickSort when the pivot is chosen poorly (e.g. sorted array with first element as pivot)?',
          options: [
            'O(N log N)',
            'O(N^2)',
            'O(log N)',
            'O(N)'
          ],
          correctAnswer: 1,
          explanation: 'When partitioned unbalancedly (1 element vs N-1 elements each step), QuickSort recurses N times with O(N) partitioning, resulting in O(N^2) worst case.',
          questionType: 'mcq'
        },
        {
          question: 'Which graph traversal algorithm uses a First-In-First-Out (FIFO) queue and is optimal for finding the shortest path on unweighted graphs?',
          options: [
            'Depth-First Search (DFS)',
            'Breadth-First Search (BFS)',
            'Topological Sort',
            'Tarjan Strongly Connected Component'
          ],
          correctAnswer: 1,
          explanation: 'BFS explores nodes layer by layer using a FIFO queue, guaranteeing the shortest path in unweighted graphs.',
          questionType: 'mcq'
        },
        {
          question: 'In a balanced Binary Search Tree (such as AVL or Red-Black Tree), what is the time complexity to search, insert, or delete an element?',
          options: [
            'O(1)',
            'O(log N)',
            'O(N)',
            'O(N log N)'
          ],
          correctAnswer: 1,
          explanation: 'Balanced BSTs enforce a tree height bounded by O(log N), ensuring all search, insertion, and deletion operations execute in O(log N) worst-case time.',
          questionType: 'mcq'
        },
        {
          question: 'What is the average time complexity for key lookup in a well-distributed Hash Table?',
          options: [
            'O(1)',
            'O(log N)',
            'O(N)',
            'O(N^2)'
          ],
          correctAnswer: 0,
          explanation: 'Hash tables achieve average O(1) constant time lookup by transforming keys into array indices using a hash function.',
          questionType: 'mcq'
        }
      ]
    });

    console.log('✓ Created Sample Quizzes');

    // 4. Create Sample Quiz Attempts for Realistic Analytics
    await QuizAttempt.create({
      user: studentUser._id,
      quiz: quiz1._id,
      answers: [
        { questionIndex: 0, selectedAnswer: 0, isCorrect: true, questionText: 'ReLU activation benefit', explanation: 'Prevents vanishing gradient.' },
        { questionIndex: 1, selectedAnswer: 1, isCorrect: true, questionText: 'Transformer Q, K, V', explanation: 'Query, Key, Value.' },
        { questionIndex: 2, selectedAnswer: 1, isCorrect: true, questionText: 'Adam optimizer', explanation: 'First and second moments.' },
        { questionIndex: 3, selectedAnswer: 1, isCorrect: true, questionText: 'Backpropagation foundation', explanation: 'Chain Rule.' },
        { questionIndex: 4, selectedAnswer: 0, isCorrect: true, questionText: 'Computer vision architecture', explanation: 'CNNs.' },
      ],
      score: 5,
      totalQuestions: 5,
      percentage: 100,
      accuracy: 100,
      timeTakenSeconds: 210,
      attemptedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    });

    await QuizAttempt.create({
      user: studentUser._id,
      quiz: quiz2._id,
      answers: [
        { questionIndex: 0, selectedAnswer: 1, isCorrect: true, questionText: 'QuickSort worst case', explanation: 'O(N^2).' },
        { questionIndex: 1, selectedAnswer: 1, isCorrect: true, questionText: 'Shortest path traversal', explanation: 'BFS with FIFO queue.' },
        { questionIndex: 2, selectedAnswer: 1, isCorrect: true, questionText: 'Balanced BST complexity', explanation: 'O(log N).' },
        { questionIndex: 3, selectedAnswer: 2, isCorrect: false, questionText: 'Hash table average lookup', explanation: 'O(1) average, selected O(N).' },
      ],
      score: 3,
      totalQuestions: 4,
      percentage: 75,
      accuracy: 75,
      timeTakenSeconds: 310,
      attemptedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    });

    // 5. Create Sample Bookmarks
    await Bookmark.create({
      user: studentUser._id,
      type: 'material',
      referenceId: material1._id,
      title: 'Neural Networks & Deep Learning Architectures',
      content: 'Important foundational material covering ReLU, Adam Optimizer, and Self-Attention formulas.',
      tags: ['AI', 'Deep Learning'],
    });

    await Bookmark.create({
      user: studentUser._id,
      type: 'quiz_question',
      referenceId: quiz2._id,
      title: 'Hash Table Average Lookup Complexity',
      content: 'Remember: Hash table lookup is O(1) average case, but can degrade to O(N) if many hash collisions occur.',
      tags: ['Data Structures', 'Big-O'],
    });

    // 6. Create Initial Learning Activities
    await LearningActivity.create({
      user: studentUser._id,
      activityType: 'read_material',
      material: material1._id,
      durationSeconds: 1200,
      metadata: { title: material1.title },
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    });

    await LearningActivity.create({
      user: studentUser._id,
      activityType: 'quiz_attempt',
      durationSeconds: 210,
      metadata: { quizTitle: quiz1.title, score: 5, totalQuestions: 5 },
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    });

    await LearningActivity.create({
      user: studentUser._id,
      activityType: 'ai_chat',
      durationSeconds: 300,
      metadata: { subject: 'Artificial Intelligence', topic: 'Attention Mechanism' },
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    });

    // 7. Create Sample AI Chat Session
    await ChatSession.create({
      user: studentUser._id,
      title: 'Understanding Backpropagation and Vanishing Gradients',
      materialReference: material1._id,
      subject: 'Artificial Intelligence',
      messages: [
        {
          role: 'user',
          content: 'Can you explain why the vanishing gradient problem happens with Sigmoid in deep networks?',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
        {
          role: 'assistant',
          content: `Great question! Here is a simple breakdown:

### Why Gradients Vanish:
1. **The Derivative Maximum:** The derivative of the Sigmoid function $\\sigma'(x) = \\sigma(x)(1 - \\sigma(x))$ has a maximum value of only **0.25** (when $x=0$).
2. **Repeated Multiplication (Chain Rule):** During backpropagation across $L$ layers, we multiply these small derivatives together:
$$0.25 \\times 0.25 \\times 0.25 \\dots < 0.25^L$$
3. **The Result:** By the time the gradient reaches the earliest layers, it becomes infinitesimally close to zero ($0.0000...$). The front layers stop updating, so the model cannot learn!

### How ReLU Solves It:
ReLU's derivative is **1.0** for all positive values ($x > 0$). Multiplying $1.0 \\times 1.0 \\dots = 1.0$, which lets gradients flow freely back to early layers.`,
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 5000),
        }
      ]
    });

    console.log('✓ Successfully seeded complete LearnAI sample data!');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
};

// If run directly: `node utils/seedData.js`
if (require.main === module) {
  require('dotenv').config();
  const { connectDB, disconnectDB } = require('../config/db');
  
  (async () => {
    await connectDB();
    await seedInitialData();
    console.log('Seeding complete. Exiting...');
    process.exit(0);
  })();
}

module.exports = seedInitialData;
