/**
 * LearnAI In-Memory Demo Store
 * Provides persistent in-memory data and state management for demo users
 * when MongoDB is not connected or unavailable.
 */

class DemoStore {
  constructor() {
    this.init();
  }

  init() {
    this.users = [
      {
        _id: 'demo-student-id',
        name: 'Demo Student',
        email: 'student@learnai.com',
        role: 'student',
        preferredLanguage: 'en',
        avatar: 'avatar-1',
        emailVerified: true,
        studyStreak: 3,
        totalStudyTimeMinutes: 45,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        _id: 'demo-admin-id',
        name: 'LearnAI Admin',
        email: 'admin@learnai.com',
        role: 'admin',
        preferredLanguage: 'en',
        avatar: 'avatar-1',
        emailVerified: true,
        studyStreak: 5,
        totalStudyTimeMinutes: 120,
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    this.materials = [
      {
        _id: 'mat-001',
        title: 'Deep Learning & Neural Networks Fundamentals',
        description: 'Comprehensive introduction to artificial neural networks, perceptrons, activation functions, backpropagation, and gradient descent.',
        subject: 'Artificial Intelligence',
        content: `### 1. Introduction to Neural Networks
Artificial Neural Networks (ANNs) are computational models inspired by biological neural networks in animal brains. A basic artificial neuron, also called a Perceptron, receives multiple inputs, applies weights to them, adds a bias, and passes the resulting linear combination through a non-linear activation function.

### 2. Forward Propagation
In a multi-layer feedforward network, information flows from the input layer through one or more hidden layers to the output layer:
z = W * x + b
a = sigma(z)

Where W represents the weight matrix, x is the input vector, b is the bias vector, and sigma is the non-linear activation function (such as ReLU, Sigmoid, or LeakyReLU).

### 3. Activation Functions
1. ReLU (Rectified Linear Unit): f(x) = max(0, x). It mitigates the vanishing gradient problem and is computationally efficient.
2. Sigmoid: f(x) = 1 / (1 + e^(-x)). Useful for binary classification output layers.
3. Softmax: Converts raw logits into probability distributions across multi-class categories.

### 4. Loss Functions & Backpropagation
Training involves minimizing an objective loss function:
- Binary Cross-Entropy (BCE) for binary classification.
- Categorical Cross-Entropy (CCE) for multi-class classification.
- Mean Squared Error (MSE) for continuous regression.

Backpropagation uses the Chain Rule of Calculus to compute partial derivatives of the loss with respect to every weight and bias in the network:
dL/dW = (dL/da) * (da/dz) * (dz/dW)

### 5. Gradient Descent Optimizers
- Stochastic Gradient Descent (SGD) with momentum.
- Adam (Adaptive Moment Estimation): Combines AdaGrad and RMSProp with exponential moving averages of past gradients and squared gradients.`,
        fileName: 'neural_networks_guide.pdf',
        fileType: 'pdf',
        fileSize: 1048576,
        fileUrl: null,
        uploadedBy: {
          _id: 'demo-admin-id',
          name: 'LearnAI Admin',
          email: 'admin@learnai.com',
        },
        tags: ['Deep Learning', 'Neural Networks', 'AI', 'Calculus'],
        readingProgress: 60,
        isCompleted: false,
        studyTimeSeconds: 1200,
        wordCount: 320,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        _id: 'mat-002',
        title: 'Operating Systems: Process Synchronization & Deadlocks',
        description: 'Detailed analysis of concurrency, race conditions, critical sections, semaphores, mutex locks, and deadlock prevention.',
        subject: 'Computer Science',
        content: `### 1. The Critical Section Problem
When multiple threads or processes execute concurrently and share mutable resources, race conditions can occur. A critical section is a segment of code where shared resources are accessed.

### 2. Requirements for a Valid Solution
1. Mutual Exclusion: If process P is executing in its critical section, no other processes can be executing in their critical sections.
2. Progress: If no process is in its critical section and some wish to enter, only those not in their remainder section can participate in deciding who enters next.
3. Bounded Waiting: There must be a bound on the number of times other processes are allowed to enter after a process has requested entry.

### 3. Synchronization Primitives
- Mutex Locks: Binary semaphore mechanism ensuring one-at-a-time access.
- Counting Semaphores: Integer variable manipulated only through wait() (P) and signal() (V) atomic operations.
- Monitors: High-level language construct providing synchronization with condition variables.

### 4. Deadlock Characterization (Coffman Conditions)
A deadlock occurs if and only if all four conditions hold simultaneously:
1. Mutual Exclusion: At least one resource is held in a non-shareable mode.
2. Hold and Wait: A process holds at least one resource and is waiting to acquire additional resources held by other processes.
3. No Preemption: Resources cannot be preempted; they are released only voluntarily.
4. Circular Wait: A closed chain of processes exists such that each process holds at least one resource needed by the next.

### 5. Deadlock Handling Strategies
- Prevention: Invalidate at least one of the four Coffman conditions.
- Avoidance: Use Dijkstra's Banker's Algorithm with safe state verification.
- Detection and Recovery: Build a Resource Allocation Graph (RAG) and terminate deadlocked processes or preempt resources.`,
        fileName: 'os_synchronization.pdf',
        fileType: 'pdf',
        fileSize: 850000,
        fileUrl: null,
        uploadedBy: {
          _id: 'demo-student-id',
          name: 'Demo Student',
          email: 'student@learnai.com',
        },
        tags: ['OS', 'Concurrency', 'Semaphores', 'Deadlock'],
        readingProgress: 100,
        isCompleted: true,
        studyTimeSeconds: 1800,
        wordCount: 290,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        _id: 'mat-003',
        title: 'Graph Traversal Algorithms: BFS & DFS',
        description: 'Comprehensive study of Breadth-First Search and Depth-First Search algorithms, time/space complexities, and shortest path properties.',
        subject: 'Computer Science',
        content: `### 1. Introduction to Graph Representations
Graphs G = (V, E) can be represented using:
- Adjacency List: Space complexity O(V + E). Optimal for sparse graphs.
- Adjacency Matrix: Space complexity O(V^2). Optimal for dense graphs and instant edge lookup.

### 2. Breadth-First Search (BFS)
BFS explores the graph level by level using a Queue (FIFO) data structure.
- Explores all neighbors at distance k before exploring neighbors at distance k + 1.
- Guarantees the shortest path in unweighted graphs.
- Time Complexity: O(V + E) with adjacency list.
- Space Complexity: O(V) for queue and visited set.

### 3. Depth-First Search (DFS)
DFS explores as far along each branch as possible before backtracking, using a Stack (LIFO) or recursive call stack.
- Useful for cycle detection, topological sorting (DAGs), finding connected components, and solving mazes.
- Time Complexity: O(V + E).
- Space Complexity: O(V) in worst-case recursion tree.

### 4. Key Comparative Highlights
- BFS is preferred when finding the shortest path on unweighted graphs.
- DFS requires less memory on very wide, shallow trees.
- Both mark visited vertices to avoid infinite loops in cyclic graphs.`,
        fileName: 'graphs_bfs_dfs.txt',
        fileType: 'txt',
        fileSize: 450000,
        fileUrl: null,
        uploadedBy: {
          _id: 'demo-student-id',
          name: 'Demo Student',
          email: 'student@learnai.com',
        },
        tags: ['Algorithms', 'Graphs', 'BFS', 'DFS'],
        readingProgress: 40,
        isCompleted: false,
        studyTimeSeconds: 900,
        wordCount: 210,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    this.quizzes = [
      {
        _id: 'quiz-001',
        title: 'Deep Learning & Neural Networks Mastery',
        description: 'Test your understanding of activation functions, backpropagation, gradient descent, and loss optimization.',
        subject: 'Artificial Intelligence',
        difficulty: 'medium',
        timeLimitMinutes: 10,
        generatedByAI: true,
        createdBy: {
          _id: 'demo-admin-id',
          name: 'LearnAI Admin',
        },
        questions: [
          {
            _id: 'q-001-1',
            question: 'What is the primary mathematical reason for using non-linear activation functions in multi-layer neural networks?',
            options: [
              'To prevent the multi-layer network from collapsing mathematically into an equivalent single-layer linear model',
              'To speed up floating point computations on CPU hardware',
              'To guarantee that weights never become negative during backpropagation',
              'To reduce memory footprint by rounding floating point tensors'
            ],
            correctAnswer: 0,
            explanation: 'Without non-linear activation functions, composing multiple linear layers W2*(W1*x + b1) + b2 simply results in another linear transformation W_combined*x + b_combined. Non-linearities allow the network to approximate complex non-linear functions (Universal Approximation Theorem).',
            questionType: 'mcq',
          },
          {
            _id: 'q-001-2',
            question: 'Which problem is the ReLU (Rectified Linear Unit) activation function specifically designed to alleviate during deep neural network training?',
            options: [
              'Vanishing Gradient Problem for positive activations',
              'Overfitting on training sets',
              'Underflow of input normalization',
              'Covariate shift between input batches'
            ],
            correctAnswer: 0,
            explanation: 'Sigmoid and Tanh activations saturate with near-zero derivatives for large positive or negative inputs. ReLU has a constant derivative of 1 for all x > 0, preventing the gradient from vanishing during backpropagation through deep layers.',
            questionType: 'mcq',
          },
          {
            _id: 'q-001-3',
            question: 'What mathematical rule is the backbone of the Backpropagation algorithm?',
            options: [
              'The Chain Rule of Differential Calculus',
              'Euler Totient Theorem',
              'Bayes Theorem of Conditional Probability',
              'L\'Hopital\'s Rule for Limits'
            ],
            correctAnswer: 0,
            explanation: 'Backpropagation recursively applies the Chain Rule of Calculus to compute the partial derivative of the loss function with respect to weights and biases in earlier layers.',
            questionType: 'mcq',
          },
          {
            _id: 'q-001-4',
            question: 'How does the Adam optimizer combine the strengths of AdaGrad and RMSProp?',
            options: [
              'By maintaining exponential moving averages of both past gradients (1st moment) and past squared gradients (2nd moment)',
              'By doubling the learning rate on every epoch',
              'By periodically resetting all weights to zero',
              'By computing exact Hessian matrices on second derivatives'
            ],
            correctAnswer: 0,
            explanation: 'Adam computes adaptive learning rates for each parameter by storing exponentially decaying averages of past gradients (momentum) and past squared gradients (RMSProp).',
            questionType: 'mcq',
          },
          {
            _id: 'q-001-5',
            question: 'Which loss function is standard for multi-class classification where classes are mutually exclusive and outputs pass through Softmax?',
            options: [
              'Categorical Cross-Entropy Loss',
              'Mean Squared Error (MSE)',
              'Hinge Loss',
              'L1 Absolute Error Loss'
            ],
            correctAnswer: 0,
            explanation: 'Categorical Cross-Entropy evaluates the difference between predicted probability distributions (Softmax output) and ground truth one-hot encoded label vectors.',
            questionType: 'mcq',
          }
        ],
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        _id: 'quiz-002',
        title: 'Operating Systems: Concurrency & Deadlocks',
        description: 'Evaluate your knowledge on race conditions, mutual exclusion, semaphores, and Banker\'s algorithm.',
        subject: 'Computer Science',
        difficulty: 'medium',
        timeLimitMinutes: 10,
        generatedByAI: false,
        createdBy: {
          _id: 'demo-student-id',
          name: 'Demo Student',
        },
        questions: [
          {
            _id: 'q-002-1',
            question: 'Which of the following is NOT one of the four Coffman conditions required for a deadlock to occur?',
            options: [
              'Preemptive Resource Allocation',
              'Mutual Exclusion',
              'Hold and Wait',
              'Circular Wait'
            ],
            correctAnswer: 0,
            explanation: 'The Coffman condition is "No Preemption" (resources cannot be preempted). If preemptive resource allocation is permitted, deadlock cannot hold.',
            questionType: 'mcq',
          },
          {
            _id: 'q-002-2',
            question: 'What data structure is utilized in Breadth-First Search (BFS) to manage node exploration order?',
            options: [
              'Queue (FIFO)',
              'Stack (LIFO)',
              'Priority Heap',
              'Binary Search Tree'
            ],
            correctAnswer: 0,
            explanation: 'BFS uses a FIFO (First-In, First-Out) Queue to explore nodes level-by-level in shortest-path order on unweighted graphs.',
            questionType: 'mcq',
          },
          {
            _id: 'q-002-3',
            question: 'What is the time complexity of Breadth-First Search (BFS) and Depth-First Search (DFS) when represented using an Adjacency List?',
            options: [
              'O(V + E)',
              'O(V * E)',
              'O(V^2)',
              'O(log V)'
            ],
            correctAnswer: 0,
            explanation: 'Both BFS and DFS visit every vertex once and check every incident edge once when using an Adjacency List representation, yielding O(V + E) time complexity.',
            questionType: 'mcq',
          }
        ],
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      }
    ];

    this.attempts = [
      {
        _id: 'att-001',
        user: 'demo-student-id',
        quiz: {
          _id: 'quiz-001',
          title: 'Deep Learning & Neural Networks Mastery',
          subject: 'Artificial Intelligence',
          difficulty: 'medium',
          generatedByAI: true,
        },
        score: 4,
        totalQuestions: 5,
        percentage: 80,
        accuracy: 80,
        timeTakenSeconds: 245,
        attemptedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        answers: [
          { questionIndex: 0, selectedAnswer: 0, isCorrect: true, questionText: 'What is the primary mathematical reason for using non-linear activation functions in multi-layer neural networks?', explanation: 'Non-linearities allow the network to approximate complex non-linear functions.' },
          { questionIndex: 1, selectedAnswer: 0, isCorrect: true, questionText: 'Which problem is the ReLU activation function specifically designed to alleviate?', explanation: 'ReLU prevents vanishing gradient for positive activations.' },
          { questionIndex: 2, selectedAnswer: 0, isCorrect: true, questionText: 'What mathematical rule is the backbone of the Backpropagation algorithm?', explanation: 'The Chain Rule of Differential Calculus.' },
          { questionIndex: 3, selectedAnswer: 1, isCorrect: false, questionText: 'How does the Adam optimizer combine the strengths of AdaGrad and RMSProp?', explanation: 'By maintaining exponential moving averages of both past gradients and past squared gradients.' },
          { questionIndex: 4, selectedAnswer: 0, isCorrect: true, questionText: 'Which loss function is standard for multi-class classification with Softmax?', explanation: 'Categorical Cross-Entropy.' },
        ],
      },
    ];

    this.bookmarks = [
      {
        _id: 'bm-001',
        user: 'demo-student-id',
        type: 'material',
        referenceId: 'mat-001',
        title: 'Deep Learning & Neural Networks Fundamentals',
        content: 'Backpropagation uses the Chain Rule of Calculus to compute partial derivatives of the loss with respect to every weight: dL/dW = (dL/da) * (da/dz) * (dz/dW)',
        tags: ['Deep Learning', 'Neural Networks'],
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        _id: 'bm-002',
        user: 'demo-student-id',
        type: 'explanation',
        referenceId: null,
        title: 'AI Note: The Four Coffman Deadlock Conditions',
        content: 'Deadlock requires 4 conditions: 1. Mutual Exclusion, 2. Hold and Wait, 3. No Preemption, 4. Circular Wait.',
        tags: ['OS', 'Deadlocks'],
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    this.chatSessions = [
      {
        _id: 'session-001',
        user: 'demo-student-id',
        title: 'Backpropagation & Matrix Derivatives',
        subject: 'Artificial Intelligence',
        materialReference: 'mat-001',
        messages: [
          {
            role: 'assistant',
            content: 'Hello! I am **LearnAI**, your academic study mentor. What concept or problem would you like to explore today?',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
          }
        ],
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        updatedAt: new Date(Date.now() - 3600000).toISOString(),
      }
    ];

    this.activities = [
      {
        _id: 'act-001',
        user: 'demo-student-id',
        activityType: 'quiz_attempt',
        durationSeconds: 245,
        metadata: {
          quizTitle: 'Deep Learning & Neural Networks Mastery',
          score: 4,
          totalQuestions: 5,
          percentage: 80,
        },
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        _id: 'act-002',
        user: 'demo-student-id',
        activityType: 'read_material',
        durationSeconds: 1200,
        metadata: {
          title: 'Deep Learning & Neural Networks Fundamentals',
          subject: 'Artificial Intelligence',
        },
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        _id: 'act-003',
        user: 'demo-student-id',
        activityType: 'ai_chat',
        durationSeconds: 300,
        metadata: {
          subject: 'Artificial Intelligence',
          mode: 'detailed',
        },
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      }
    ];
  }

  // --- Materials Methods ---
  getMaterials(query = {}) {
    let result = [...this.materials];
    if (query.subject && query.subject !== 'all' && query.subject !== 'All') {
      result = result.filter(m => m.subject.toLowerCase() === query.subject.toLowerCase());
    }
    if (query.search && query.search.trim()) {
      const s = query.search.trim().toLowerCase();
      result = result.filter(m =>
        m.title.toLowerCase().includes(s) ||
        (m.description && m.description.toLowerCase().includes(s)) ||
        (m.tags && m.tags.some(t => t.toLowerCase().includes(s)))
      );
    }
    return result;
  }

  getMaterialById(id) {
    return this.materials.find(m => m._id === id || m.id === id) || null;
  }

  createMaterial(materialData, user) {
    const newMat = {
      _id: `mat-${Date.now()}`,
      title: materialData.title || 'Untitled Material',
      description: materialData.description || '',
      subject: materialData.subject || 'General',
      content: materialData.content || materialData.textContent || '',
      fileName: materialData.fileName || null,
      fileType: materialData.fileType || 'manual',
      fileSize: materialData.fileSize || 0,
      fileUrl: materialData.fileUrl || null,
      uploadedBy: {
        _id: user?._id || user?.id || 'demo-student-id',
        name: user?.name || 'Demo Student',
        email: user?.email || 'student@learnai.com',
      },
      tags: Array.isArray(materialData.tags) ? materialData.tags : (materialData.tags ? materialData.tags.split(',').map(t => t.trim()) : []),
      readingProgress: 0,
      isCompleted: false,
      studyTimeSeconds: 0,
      wordCount: (materialData.content || materialData.textContent || '').split(/\s+/).filter(Boolean).length || 250,
      createdAt: new Date().toISOString(),
    };
    this.materials.unshift(newMat);
    return newMat;
  }

  updateMaterial(id, updateData) {
    const idx = this.materials.findIndex(m => m._id === id || m.id === id);
    if (idx === -1) return null;
    this.materials[idx] = {
      ...this.materials[idx],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };
    return this.materials[idx];
  }

  deleteMaterial(id) {
    const idx = this.materials.findIndex(m => m._id === id || m.id === id);
    if (idx === -1) return false;
    this.materials.splice(idx, 1);
    return true;
  }

  // --- Quiz Methods ---
  getQuizzes(query = {}) {
    let result = [...this.quizzes];
    if (query.subject && query.subject !== 'all' && query.subject !== 'All') {
      result = result.filter(q => q.subject.toLowerCase() === query.subject.toLowerCase());
    }
    if (query.difficulty && query.difficulty !== 'all' && query.difficulty !== 'All') {
      result = result.filter(q => q.difficulty.toLowerCase() === query.difficulty.toLowerCase());
    }
    if (query.search && query.search.trim()) {
      const s = query.search.trim().toLowerCase();
      result = result.filter(q =>
        q.title.toLowerCase().includes(s) ||
        (q.description && q.description.toLowerCase().includes(s))
      );
    }
    return result;
  }

  getQuizById(id) {
    return this.quizzes.find(q => q._id === id || q.id === id) || null;
  }

  createQuiz(quizData, user) {
    const newQuiz = {
      _id: `quiz-${Date.now()}`,
      title: quizData.title || 'Practice Quiz',
      description: quizData.description || '',
      subject: quizData.subject || 'General',
      difficulty: quizData.difficulty || 'medium',
      timeLimitMinutes: quizData.timeLimitMinutes || 10,
      questions: quizData.questions || [],
      createdBy: {
        _id: user?._id || user?.id || 'demo-student-id',
        name: user?.name || 'Demo Student',
      },
      generatedByAI: !!quizData.generatedByAI,
      materialReference: quizData.materialReference || null,
      createdAt: new Date().toISOString(),
    };
    this.quizzes.unshift(newQuiz);
    return newQuiz;
  }

  deleteQuiz(id) {
    const idx = this.quizzes.findIndex(q => q._id === id || q.id === id);
    if (idx === -1) return false;
    this.quizzes.splice(idx, 1);
    return true;
  }

  // --- Attempts & Analytics Methods ---
  submitQuizAttempt(quizId, answers, timeTakenSeconds, user) {
    const quiz = this.getQuizById(quizId);
    if (!quiz) return null;

    let score = 0;
    const totalQuestions = quiz.questions.length;
    const detailedAnswers = [];

    quiz.questions.forEach((q, idx) => {
      const userAnsObj = answers.find(a => a.questionIndex === idx || a.questionId === q._id);
      const selectedAnswer = userAnsObj !== undefined ? userAnsObj.selectedAnswer : -1;
      const isCorrect = selectedAnswer === q.correctAnswer;
      if (isCorrect) score += 1;

      detailedAnswers.push({
        questionIndex: idx,
        questionText: q.question || q.questionText,
        options: q.options,
        selectedAnswer,
        correctAnswer: q.correctAnswer,
        isCorrect,
        explanation: q.explanation || 'Refer to study material for foundational solution steps.',
      });
    });

    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
    const userId = user?._id || user?.id || 'demo-student-id';

    const attempt = {
      _id: `att-${Date.now()}`,
      user: userId,
      quiz: {
        _id: quiz._id,
        title: quiz.title,
        subject: quiz.subject,
        difficulty: quiz.difficulty,
        generatedByAI: quiz.generatedByAI,
        questions: quiz.questions,
      },
      answers: detailedAnswers,
      score,
      totalQuestions,
      percentage,
      accuracy: percentage,
      timeTakenSeconds: Number(timeTakenSeconds) || 60,
      attemptedAt: new Date().toISOString(),
      createdAt: new Date(),
    };

    this.attempts.unshift(attempt);

    // Record activity
    this.activities.unshift({
      _id: `act-${Date.now()}`,
      user: userId,
      activityType: 'quiz_attempt',
      durationSeconds: Number(timeTakenSeconds) || 60,
      metadata: {
        quizTitle: quiz.title,
        score,
        totalQuestions,
        percentage,
      },
      createdAt: new Date().toISOString(),
    });

    return attempt;
  }

  getQuizAttempts(userId) {
    const uid = userId || 'demo-student-id';
    return this.attempts.filter(a => a.user === uid || a.user === 'demo-student-id');
  }

  getAttemptById(attemptId) {
    return this.attempts.find(a => a._id === attemptId || a.id === attemptId) || null;
  }

  calculateAnalytics(userId) {
    const userAttempts = this.getQuizAttempts(userId);
    const totalMaterials = this.materials.length;
    const completedMaterials = this.materials.filter(m => m.isCompleted).length;

    let totalScore = 0;
    let totalPossibleScore = 0;
    let totalCorrect = 0;
    let totalQuestionsAnswered = 0;
    let totalTimeSeconds = 0;

    const scoreTrends = [];
    const subjectMap = {};

    userAttempts.forEach((att, index) => {
      totalScore += att.score || 0;
      totalPossibleScore += att.totalQuestions || 0;
      totalTimeSeconds += att.timeTakenSeconds || 0;

      const sub = att.quiz?.subject || 'General';
      if (!subjectMap[sub]) {
        subjectMap[sub] = { attempts: 0, totalScore: 0, totalQuestions: 0, accuracySum: 0 };
      }
      subjectMap[sub].attempts += 1;
      subjectMap[sub].totalScore += att.score || 0;
      subjectMap[sub].totalQuestions += att.totalQuestions || 0;
      subjectMap[sub].accuracySum += att.accuracy || 0;

      if (Array.isArray(att.answers)) {
        att.answers.forEach(a => {
          totalQuestionsAnswered++;
          if (a.isCorrect) totalCorrect++;
        });
      }

      scoreTrends.push({
        attemptIndex: index + 1,
        quizTitle: att.quiz?.title || `Quiz ${index + 1}`,
        score: att.score,
        totalQuestions: att.totalQuestions,
        percentage: att.percentage,
        accuracy: att.accuracy,
        date: att.attemptedAt ? att.attemptedAt.split('T')[0] : 'Recent',
      });
    });

    const averageScore = totalPossibleScore > 0 ? Math.round((totalScore / totalPossibleScore) * 100) : 0;
    const overallAccuracy = totalQuestionsAnswered > 0 ? Math.round((totalCorrect / totalQuestionsAnswered) * 100) : (userAttempts.length > 0 ? averageScore : 0);

    const subjectPerformance = Object.keys(subjectMap).map(subject => {
      const data = subjectMap[subject];
      return {
        subject,
        attempts: data.attempts,
        masteryRate: data.totalQuestions > 0 ? Math.round((data.totalScore / data.totalQuestions) * 100) : 0,
        avgAccuracy: Math.round(data.accuracySum / data.attempts),
      };
    });

    if (subjectPerformance.length === 0) {
      subjectPerformance.push(
        { subject: 'Artificial Intelligence', attempts: 1, masteryRate: 80, avgAccuracy: 80 },
        { subject: 'Computer Science', attempts: 0, masteryRate: 0, avgAccuracy: 0 }
      );
    }

    // 7 Days Activity
    const last7Days = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

      const dayAttempts = userAttempts.filter(a => {
        const attDate = a.attemptedAt ? a.attemptedAt.split('T')[0] : '';
        return attDate === dateStr;
      });

      last7Days.push({
        date: dateStr,
        day: dayName,
        quizzes: dayAttempts.length,
        activities: dayAttempts.length > 0 ? 1 : (i === 0 ? 1 : 0),
        studyMinutes: dayAttempts.length > 0 ? 25 : (i === 0 ? 15 : (i === 2 ? 30 : 0)),
      });
    }

    return {
      totalMaterials,
      completedMaterials,
      materialsStudied: totalMaterials,
      totalQuizzesAttempted: userAttempts.length,
      averageScore,
      overallAccuracy,
      totalCorrectAnswers: totalCorrect > 0 ? totalCorrect : 4,
      totalIncorrectAnswers: Math.max(0, totalQuestionsAnswered - totalCorrect) || 1,
      totalStudyTimeMinutes: Math.round(totalTimeSeconds / 60) + 45,
      studyStreakDays: 1,
      scoreTrends: scoreTrends.length > 0 ? scoreTrends : [
        { attemptIndex: 1, quizTitle: 'Deep Learning Mastery', score: 4, totalQuestions: 5, percentage: 80, accuracy: 80, date: 'Recent' }
      ],
      subjectPerformance,
      last7DaysActivity: last7Days,
      recentActivities: this.activities.slice(0, 5),
    };
  }

  // --- Bookmarks Methods ---
  getBookmarks(userId, query = {}) {
    let result = this.bookmarks.filter(b => b.user === userId || b.user === 'demo-student-id');
    if (query.type && query.type !== 'all') {
      result = result.filter(b => b.type === query.type);
    }
    if (query.search && query.search.trim()) {
      const s = query.search.trim().toLowerCase();
      result = result.filter(b =>
        b.title.toLowerCase().includes(s) ||
        b.content.toLowerCase().includes(s)
      );
    }
    return result;
  }

  createBookmark(bookmarkData, user) {
    const newBm = {
      _id: `bm-${Date.now()}`,
      user: user?._id || user?.id || 'demo-student-id',
      type: bookmarkData.type || 'material',
      referenceId: bookmarkData.referenceId || null,
      title: bookmarkData.title || 'Saved Bookmark',
      content: bookmarkData.content || '',
      tags: Array.isArray(bookmarkData.tags) ? bookmarkData.tags : (bookmarkData.tags ? [bookmarkData.tags] : []),
      metadata: bookmarkData.metadata || {},
      createdAt: new Date().toISOString(),
    };
    this.bookmarks.unshift(newBm);
    return newBm;
  }

  deleteBookmark(id, userId) {
    const idx = this.bookmarks.findIndex(b => b._id === id || b.id === id);
    if (idx === -1) return false;
    this.bookmarks.splice(idx, 1);
    return true;
  }

  // --- Chat Sessions Methods ---
  getChatSessions(userId) {
    return this.chatSessions.filter(s => s.user === userId || s.user === 'demo-student-id');
  }

  getChatSessionById(id, userId) {
    return this.chatSessions.find(s => s._id === id || s.id === id) || null;
  }

  saveChatMessage(sessionId, message, reply, user, options = {}) {
    let session = this.getChatSessionById(sessionId, user?._id);
    if (!session) {
      session = {
        _id: sessionId || `session-${Date.now()}`,
        user: user?._id || user?.id || 'demo-student-id',
        title: message.slice(0, 40) + '...',
        subject: options.subject || 'General',
        materialReference: options.materialId || null,
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.chatSessions.unshift(session);
    }

    session.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    });
    session.messages.push({
      role: 'assistant',
      content: reply,
      timestamp: new Date().toISOString(),
    });
    session.updatedAt = new Date().toISOString();

    return session;
  }

  // --- Search Methods ---
  search(queryStr, category = 'all') {
    if (!queryStr || !queryStr.trim()) {
      return { materials: [], quizzes: [], bookmarks: [] };
    }
    const q = queryStr.trim().toLowerCase();
    const res = { materials: [], quizzes: [], bookmarks: [] };

    if (category === 'all' || category === 'materials') {
      res.materials = this.materials.filter(m =>
        m.title.toLowerCase().includes(q) ||
        (m.description && m.description.toLowerCase().includes(q)) ||
        m.subject.toLowerCase().includes(q)
      ).slice(0, 10);
    }

    if (category === 'all' || category === 'quizzes') {
      res.quizzes = this.quizzes.filter(qz =>
        qz.title.toLowerCase().includes(q) ||
        (qz.description && q.description.toLowerCase().includes(q)) ||
        qz.subject.toLowerCase().includes(q)
      ).slice(0, 10);
    }

    if (category === 'all' || category === 'bookmarks') {
      res.bookmarks = this.bookmarks.filter(bm =>
        bm.title.toLowerCase().includes(q) ||
        bm.content.toLowerCase().includes(q)
      ).slice(0, 10);
    }

    return res;
  }

  // --- Admin Stats Methods ---
  getPlatformStats() {
    return {
      stats: {
        totalUsers: this.users.length,
        totalStudents: this.users.filter(u => u.role === 'student').length,
        totalAdmins: this.users.filter(u => u.role === 'admin').length,
        totalMaterials: this.materials.length,
        totalQuizzes: this.quizzes.length,
        totalAttempts: this.attempts.length,
      },
      recentUsers: this.users.slice(0, 5),
      recentActivities: this.activities.slice(0, 10),
    };
  }

  getUsers(query = {}) {
    let result = [...this.users];
    if (query.role && query.role !== 'all') {
      result = result.filter(u => u.role === query.role);
    }
    if (query.search && query.search.trim()) {
      const s = query.search.trim().toLowerCase();
      result = result.filter(u =>
        u.name.toLowerCase().includes(s) ||
        u.email.toLowerCase().includes(s)
      );
    }
    return result;
  }

  updateUserRole(id, role) {
    const user = this.users.find(u => u._id === id || u.id === id);
    if (!user) return null;
    user.role = role;
    return user;
  }

  deleteUser(id) {
    const idx = this.users.findIndex(u => u._id === id || u.id === id);
    if (idx === -1) return false;
    this.users.splice(idx, 1);
    return true;
  }
}

const demoStore = new DemoStore();
module.exports = demoStore;
