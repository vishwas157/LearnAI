import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { quizService } from '../../services/quizService';
import { useToast } from '../../context/ToastContext';
import {
  ArrowLeft,
  Plus,
  Trash2,
  CheckCircle2,
  HelpCircle,
  Award
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const QuizCreationPage = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Computer Science');
  const [difficulty, setDifficulty] = useState('medium');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([
    {
      questionText: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
    },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        questionText: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        explanation: '',
      },
    ]);
  };

  const handleRemoveQuestion = (idx) => {
    if (questions.length <= 1) {
      toast.error('Quiz must contain at least 1 question');
      return;
    }
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleQuestionTextChange = (idx, text) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === idx ? { ...q, questionText: text } : q))
    );
  };

  const handleOptionChange = (qIdx, optIdx, val) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIdx) return q;
        const newOptions = [...q.options];
        newOptions[optIdx] = val;
        return { ...q, options: newOptions };
      })
    );
  };

  const handleCorrectAnswerChange = (qIdx, optIdx) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === qIdx ? { ...q, correctAnswer: optIdx } : q))
    );
  };

  const handleExplanationChange = (qIdx, exp) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === qIdx ? { ...q, explanation: exp } : q))
    );
  };

  const handleSubmitQuiz = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Please enter a quiz title');
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) {
        toast.error(`Please provide the question prompt for Question #${i + 1}`);
        return;
      }
      for (let j = 0; j < 4; j++) {
        if (!q.options[j].trim()) {
          toast.error(`Please fill all 4 options for Question #${i + 1}`);
          return;
        }
      }
    }

    setIsSubmitting(true);
    try {
      const res = await quizService.createQuiz({
        title,
        subject,
        difficulty,
        description,
        questions,
      });

      if (res.success && res.data.quiz) {
        toast.success('Custom quiz created successfully!');
        navigate('/quiz-craft');
      } else {
        toast.error(res.message || 'Failed to save quiz');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving custom quiz');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            to="/quiz-craft"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Manual Quiz Builder
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Create custom practice questions and detailed pedagogical explanations
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmitQuiz} className="space-y-6">
        {/* Basic Information Card */}
        <Card className="p-6 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Quiz Metadata
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Quiz Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Midterm 1: Operating Systems & Synchronization"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Subject
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-500"
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Artificial Intelligence">Artificial Intelligence</option>
                <option value="Biology">Biology</option>
                <option value="Physics">Physics</option>
                <option value="Mathematics">Mathematics</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-500"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Questions List */}
        <div className="space-y-4">
          {questions.map((q, qIdx) => (
            <Card key={qIdx} className="p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Question #{qIdx + 1}
                </span>

                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(qIdx)}
                    className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition text-xs flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Question Prompt
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. What is the main cause of thrashing in virtual memory systems?"
                  value={q.questionText}
                  onChange={(e) => handleQuestionTextChange(qIdx, e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-500"
                />
              </div>

              {/* 4 Options */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Answer Options (Select the correct radio button)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {q.options.map((opt, optIdx) => (
                    <div
                      key={optIdx}
                      className={`flex items-center gap-2 p-2.5 rounded-lg border transition ${
                        q.correctAnswer === optIdx
                          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`correctAnswer_${qIdx}`}
                        checked={q.correctAnswer === optIdx}
                        onChange={() => handleCorrectAnswerChange(qIdx, optIdx)}
                        className="text-emerald-600 focus:ring-emerald-500 shrink-0"
                      />
                      <span className="text-xs font-bold text-slate-500 shrink-0">
                        {String.fromCharCode(65 + optIdx)}:
                      </span>
                      <input
                        type="text"
                        required
                        placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                        value={opt}
                        onChange={(e) => handleOptionChange(qIdx, optIdx, e.target.value)}
                        className="w-full bg-transparent text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Pedagogical Explanation */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tutor Explanation (Shown to students after answering)
                </label>
                <textarea
                  rows={2}
                  placeholder="Explain why the chosen option is correct..."
                  value={q.explanation}
                  onChange={(e) => handleExplanationChange(qIdx, e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-500"
                />
              </div>
            </Card>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <Button
            type="button"
            variant="secondary"
            size="md"
            icon={Plus}
            onClick={handleAddQuestion}
          >
            Add Another Question
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="md"
            icon={Award}
            isLoading={isSubmitting}
          >
            Save & Publish Quiz
          </Button>
        </div>
      </form>
    </div>
  );
};

export default QuizCreationPage;
