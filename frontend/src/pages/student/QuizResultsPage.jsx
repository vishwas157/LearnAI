import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { quizService } from '../../services/quizService';
import { bookmarkService } from '../../services/bookmarkService';
import { useToast } from '../../context/ToastContext';
import { useTranslation } from 'react-i18next';
import confetti from 'canvas-confetti';
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  RotateCcw,
  Bookmark,
  Sparkles,
  BarChart3,
  Lightbulb
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const QuizResultsPage = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { t } = useTranslation();

  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await quizService.getAttemptResultById(attemptId);
        if (res.success && res.data.attempt) {
          setAttempt(res.data.attempt);
          if ((res.data.attempt.percentage || 0) >= 70) {
            confetti({
              particleCount: 60,
              spread: 50,
              origin: { y: 0.6 },
            });
          }
        } else {
          toast.error('Quiz attempt results not found');
          navigate('/quiz-craft');
        }
      } catch (err) {
        toast.error('Failed to load quiz results');
        navigate('/quiz-craft');
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [attemptId, navigate, toast]);

  const handleBookmarkQuestion = async (qItem) => {
    try {
      const res = await bookmarkService.createBookmark({
        type: 'quiz_question',
        referenceId: attempt.quiz?._id || null,
        title: `Question: ${qItem.questionText?.slice(0, 50)}...`,
        content: `Question: ${qItem.questionText}\n\nCorrect Answer: ${qItem.options ? qItem.options[qItem.correctAnswer] : 'Option ' + qItem.correctAnswer}\n\nExplanation: ${qItem.explanation}`,
        tags: [attempt.quiz?.subject || 'Quiz'],
      });

      if (res.success) {
        toast.success('Question saved to bookmarks!');
      }
    } catch (err) {
      toast.error('Failed to bookmark question');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Calculating your final score and explanations..." />;
  }

  if (!attempt) return null;

  const percentage = attempt.percentage || 0;
  const isExcellent = percentage >= 80;
  const isGood = percentage >= 60 && percentage < 80;

  const formatSeconds = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Result Score Banner */}
      <Card className="p-6 sm:p-8 text-center space-y-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 font-bold text-2xl mx-auto border border-brand-200/60 dark:border-slate-800">
          {isExcellent ? '🏆' : isGood ? '👏' : '📚'}
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {isExcellent ? 'Excellent Work!' : isGood ? 'Good Effort!' : 'Keep Practicing!'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {attempt.quiz?.title || 'Practice Test'} • {attempt.quiz?.subject || 'Subject'}
          </p>
        </div>

        {/* Score & Percentage */}
        <div className="flex items-center justify-center gap-6 pt-2">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Score</span>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {attempt.score} <span className="text-sm font-normal text-slate-400">/ {attempt.totalQuestions}</span>
            </p>
          </div>

          <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />

          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Accuracy</span>
            <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">
              {percentage}%
            </p>
          </div>

          <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />

          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Time</span>
            <p className="text-2xl font-bold text-slate-700 dark:text-slate-300">
              {formatSeconds(attempt.timeTakenSeconds || 0)}
            </p>
          </div>
        </div>

        {/* Quick Action Navigation */}
        <div className="flex items-center justify-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Link to="/quiz-craft">
            <Button variant="secondary" size="sm" icon={ArrowLeft}>
              Back to Quizzes
            </Button>
          </Link>

          {attempt.quiz?._id && (
            <Link to={`/quiz/${attempt.quiz._id}/attempt`}>
              <Button variant="primary" size="sm" icon={RotateCcw}>
                Retake Quiz
              </Button>
            </Link>
          )}
        </div>
      </Card>

      {/* Question Review Section */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Detailed Question Review & Explanations
        </h2>

        <div className="space-y-4">
          {(attempt.detailedReview || []).map((qItem, idx) => {
            const isCorrect = qItem.isCorrect;
            return (
              <Card
                key={idx}
                className={`p-5 sm:p-6 space-y-3.5 border ${
                  isCorrect
                    ? 'border-emerald-200 dark:border-emerald-950/60 bg-emerald-50/20 dark:bg-emerald-950/10'
                    : 'border-rose-200 dark:border-rose-950/60 bg-rose-50/20 dark:bg-rose-950/10'
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    {isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Question #{idx + 1}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      isCorrect ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                    }`}>
                      {isCorrect ? 'Correct (+1)' : 'Incorrect (0)'}
                    </span>

                    <button
                      onClick={() => handleBookmarkQuestion(qItem)}
                      className="p-1 rounded-md text-slate-400 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="Bookmark this question"
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Question Prompt */}
                <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white leading-relaxed">
                  {qItem.questionText}
                </h3>

                {/* Options List */}
                {qItem.options && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {qItem.options.map((optText, optIdx) => {
                      const wasSelected = qItem.selectedAnswer === optIdx;
                      const isTargetCorrect = qItem.correctAnswer === optIdx;

                      return (
                        <div
                          key={optIdx}
                          className={`p-2.5 rounded-lg border flex items-center justify-between ${
                            isTargetCorrect
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 font-semibold'
                              : wasSelected && !isCorrect
                              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-700 text-rose-900 dark:text-rose-200 line-through'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          <span>{String.fromCharCode(65 + optIdx)}: {optText}</span>
                          {isTargetCorrect && (
                            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold uppercase">
                              Correct
                            </span>
                          )}
                          {wasSelected && !isCorrect && (
                            <span className="text-[10px] text-rose-700 dark:text-rose-400 font-bold uppercase">
                              Your Pick
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Pedagogical Explanation */}
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                    <span>Explanation:</span>
                  </div>
                  <p>{qItem.explanation || 'Refer to the textbook material for foundational theory.'}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuizResultsPage;
