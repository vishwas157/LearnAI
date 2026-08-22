import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { quizService } from '../../services/quizService';
import { materialService } from '../../services/materialService';
import { aiService } from '../../services/aiService';
import { useToast } from '../../context/ToastContext';
import { useTranslation } from 'react-i18next';
import {
  Award,
  Sparkles,
  Plus,
  Play,
  Clock,
  BookOpen,
  ArrowRight,
  BrainCircuit,
  Filter,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const QuizCraftPage = () => {
  const [searchParams] = useSearchParams();
  const initialMaterialId = searchParams.get('materialId') || '';
  const navigate = useNavigate();
  const toast = useToast();
  const { t } = useTranslation();

  const [quizzes, setQuizzes] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  // Step-based AI Generator Modal State
  const [isGeneratorModalOpen, setIsGeneratorModalOpen] = useState(!!initialMaterialId);
  const [step, setStep] = useState(1);
  const [subject, setSubject] = useState('Computer Science');
  const [topic, setTopic] = useState('');
  const [selectedMaterialId, setSelectedMaterialId] = useState(initialMaterialId);
  const [difficulty, setDifficulty] = useState('medium');
  const [numQuestions, setNumQuestions] = useState(5);
  const [questionType, setQuestionType] = useState('mcq');
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchQuizzes = async () => {
    try {
      const [quizRes, matRes] = await Promise.all([
        quizService.getQuizzes({ difficulty: selectedDifficulty }),
        materialService.getMaterials(),
      ]);

      if (quizRes.success) setQuizzes(quizRes.data.quizzes || []);
      if (matRes.success) setMaterials(matRes.data.materials || []);
    } catch (err) {
      console.error('Failed to load quizzes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, [selectedDifficulty]);

  const handleGenerateQuiz = async (e) => {
    e.preventDefault();
    if (!topic.trim() && !selectedMaterialId) {
      toast.error('Please specify a topic or select a study material');
      return;
    }

    setIsGenerating(true);
    try {
      const res = await aiService.generateQuiz({
        subject,
        topic: topic || 'Key Concepts and Principles',
        materialId: selectedMaterialId || null,
        difficulty,
        numQuestions: parseInt(numQuestions, 10),
        questionType,
      });

      if (res.success && res.data.quiz) {
        toast.success('Practice quiz created successfully!');
        setIsGeneratorModalOpen(false);
        setStep(1);
        navigate(`/quiz/${res.data.quiz._id}/attempt`);
      } else {
        toast.error(res.message || 'Failed to generate quiz');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error generating practice quiz');
    } finally {
      setIsGenerating(false);
    }
  };

  const getDifficultyBadge = (diff) => {
    switch (diff) {
      case 'easy':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 uppercase">Easy</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 uppercase">Medium</span>;
      case 'hard':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 uppercase">Hard</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 uppercase">{diff}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {t('quizCraft.title', 'Quiz-Craft')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {t('quizCraft.subtitle', 'Create practice tests to measure retention and prepare for exams')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/quiz-craft/create">
            <Button variant="secondary" size="md">
              Manual Builder
            </Button>
          </Link>

          <Button
            variant="primary"
            size="md"
            icon={Sparkles}
            onClick={() => {
              setStep(1);
              setIsGeneratorModalOpen(true);
            }}
          >
            Create with AI
          </Button>
        </div>
      </div>

      {/* Difficulty Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['all', 'easy', 'medium', 'hard'].map((d) => (
          <button
            key={d}
            onClick={() => setSelectedDifficulty(d)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium uppercase tracking-wider transition ${
              selectedDifficulty === d
                ? 'bg-brand-600 text-white font-semibold shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
            }`}
          >
            {d === 'all' ? 'All Difficulties' : d}
          </button>
        ))}
      </div>

      {/* Quizzes Grid */}
      {loading ? (
        <LoadingSpinner message="Loading quiz catalog..." />
      ) : quizzes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quizzes.map((quiz) => (
            <Card
              key={quiz._id}
              hoverEffect
              className="flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40 px-2 py-0.5 rounded uppercase">
                    {quiz.subject}
                  </span>
                  {getDifficultyBadge(quiz.difficulty)}
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">
                    {quiz.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                    {quiz.description || 'Interactive conceptual evaluation test.'}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
                  <span>{quiz.questions?.length || 5} Questions</span>
                  <span>•</span>
                  <span>{quiz.timeLimitMinutes || 10} Mins</span>
                </div>
              </div>

              <div className="pt-3 mt-4 border-t border-slate-100 dark:border-slate-800">
                <Link
                  to={`/quiz/${quiz._id}/attempt`}
                  className="flex items-center justify-between text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 group"
                >
                  <span>Start Practice Test</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Award}
          title="No quizzes found"
          description="Create your first AI-generated or custom practice quiz."
          actionText="Create with AI"
          onAction={() => setIsGeneratorModalOpen(true)}
        />
      )}

      {/* Step-Based AI Quiz Generator Modal */}
      <Modal
        isOpen={isGeneratorModalOpen}
        onClose={() => setIsGeneratorModalOpen(false)}
        title="Generate Practice Quiz with AI"
      >
        <form onSubmit={handleGenerateQuiz} className="space-y-4">
          {/* Step Progress Indicator */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Step {step} of 2: {step === 1 ? 'Subject & Topic' : 'Difficulty & Questions'}
            </span>
            <div className="flex items-center gap-1">
              <div className={`w-6 h-1 rounded-full ${step >= 1 ? 'bg-brand-600' : 'bg-slate-200'}`} />
              <div className={`w-6 h-1 rounded-full ${step >= 2 ? 'bg-brand-600' : 'bg-slate-200'}`} />
            </div>
          </div>

          {step === 1 ? (
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  1. Academic Subject
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
                  <option value="Chemistry">Chemistry</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  2. Specific Topic
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Graph Traversal Algorithms (BFS & DFS)"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Optional: Base on Study Material
                </label>
                <select
                  value={selectedMaterialId}
                  onChange={(e) => setSelectedMaterialId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-500"
                >
                  <option value="">None (Generate from topic general knowledge)</option>
                  {materials.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  disabled={!topic.trim() && !selectedMaterialId}
                  onClick={() => setStep(2)}
                >
                  Next Step →
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  3. Difficulty Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['easy', 'medium', 'hard'].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDifficulty(d)}
                      className={`py-2 text-xs font-semibold rounded-lg uppercase tracking-wider border transition ${
                        difficulty === d
                          ? 'bg-brand-50 dark:bg-brand-950/40 border-brand-500 text-brand-700 dark:text-brand-300'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    4. Question Count
                  </label>
                  <select
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-500"
                  >
                    <option value="3">3 Questions</option>
                    <option value="5">5 Questions</option>
                    <option value="10">10 Questions</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    5. Format
                  </label>
                  <select
                    value={questionType}
                    onChange={(e) => setQuestionType(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-500"
                  >
                    <option value="mcq">Multiple Choice (4 Options)</option>
                    <option value="true_false">True / False</option>
                  </select>
                </div>
              </div>

              {/* Preview Box */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                <p className="font-semibold text-slate-900 dark:text-white">Summary of Configuration:</p>
                <p>• Subject: <strong>{subject}</strong></p>
                <p>• Topic: <strong>{topic || 'Key Concepts'}</strong></p>
                <p>• {numQuestions} {difficulty} questions with explanations</p>
              </div>

              <div className="pt-2 flex justify-between">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setStep(1)}
                >
                  ← Back
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isGenerating}
                >
                  Generate Practice Test
                </Button>
              </div>
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
};

export default QuizCraftPage;
