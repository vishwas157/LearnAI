import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { quizService } from '../../services/quizService';
import { useToast } from '../../context/ToastContext';
import { useTranslation } from 'react-i18next';
import {
  Clock,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Award
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const QuizAttemptPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { t } = useTranslation();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [questionIndex]: selectedOptionIndex }
  const [secondsRemaining, setSecondsRemaining] = useState(600);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await quizService.getQuizById(id);
        if (res.success && res.data.quiz) {
          setQuiz(res.data.quiz);
          const timeLimit = (res.data.quiz.timeLimitMinutes || 10) * 60;
          setSecondsRemaining(timeLimit);
        } else {
          toast.error('Quiz not found');
          navigate('/quiz-craft');
        }
      } catch (err) {
        toast.error('Failed to load practice quiz');
        navigate('/quiz-craft');
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [id, navigate, toast]);

  // Timer countdown
  useEffect(() => {
    if (loading || !quiz) return;

    const timerId = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerId);
          handleSubmitTest(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [loading, quiz]);

  const handleSelectAnswer = (optionIdx) => {
    setAnswers((prev) => ({
      ...prev,
      [currentIndex]: optionIdx,
    }));
  };

  const handleSubmitTest = async (autoSubmit = false) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const formattedAnswers = Object.entries(answers).map(([qIdx, selAns]) => ({
      questionIndex: parseInt(qIdx, 10),
      selectedAnswer: selAns,
    }));

    const totalTime = (quiz?.timeLimitMinutes || 10) * 60;
    const timeTaken = Math.max(1, totalTime - secondsRemaining);

    try {
      const res = await quizService.submitQuizAttempt(id, {
        answers: formattedAnswers,
        timeTakenSeconds: timeTaken,
      });

      if (res.success && res.data.attempt) {
        if (autoSubmit) {
          toast.info('Time expired! Your answers were automatically submitted.');
        } else {
          toast.success('Test submitted successfully!');
        }
        navigate(`/quiz/results/${res.data.attempt._id}`);
      } else {
        toast.error(res.message || 'Error submitting test');
        setIsSubmitting(false);
      }
    } catch (err) {
      toast.error('Failed to submit quiz attempt');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Preparing test room..." />;
  }

  if (!quiz || !quiz.questions || quiz.questions.length === 0) return null;

  const currentQ = quiz.questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const totalCount = quiz.questions.length;
  const progressPercent = Math.round((answeredCount / totalCount) * 100);

  const formatTimer = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Test Room Subheader */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            to="/quiz-craft"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
              {quiz.title}
            </h1>
            <p className="text-[11px] text-slate-400">
              {quiz.subject} • Question {currentIndex + 1} of {totalCount}
            </p>
          </div>
        </div>

        {/* Live Timer Pill */}
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono font-bold ${
          secondsRemaining < 120
            ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-600 animate-pulse'
            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
        }`}>
          <Clock className="w-3.5 h-3.5" />
          <span>{formatTimer(secondsRemaining)}</span>
        </div>
      </div>

      {/* Question Bubbles Navigator */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {quiz.questions.map((_, qIdx) => {
          const isAnswered = answers[qIdx] !== undefined;
          const isCurrent = currentIndex === qIdx;

          return (
            <button
              key={qIdx}
              onClick={() => setCurrentIndex(qIdx)}
              className={`w-8 h-8 rounded-lg text-xs font-semibold transition shrink-0 ${
                isCurrent
                  ? 'bg-brand-600 text-white shadow-xs'
                  : isAnswered
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300 border border-brand-200 dark:border-slate-700'
                  : 'bg-white dark:bg-slate-900 text-slate-500 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
              }`}
            >
              {qIdx + 1}
            </button>
          );
        })}
      </div>

      {/* Main Question Card */}
      <Card className="p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Question #{currentIndex + 1}
          </span>
          <span className="text-xs font-medium text-slate-500">
            {answeredCount} of {totalCount} answered ({progressPercent}%)
          </span>
        </div>

        {/* Question Text */}
        <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white leading-relaxed">
          {currentQ.questionText}
        </h2>

        {/* 4 Clean Selectable Answer Options */}
        <div className="space-y-2.5">
          {currentQ.options && currentQ.options.map((optText, optIdx) => {
            const isSelected = answers[currentIndex] === optIdx;

            return (
              <div
                key={optIdx}
                onClick={() => handleSelectAnswer(optIdx)}
                className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                  isSelected
                    ? 'border-brand-600 bg-brand-50/60 dark:bg-brand-950/30 text-slate-900 dark:text-white font-medium ring-1 ring-brand-500'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${
                    isSelected
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}>
                    {String.fromCharCode(65 + optIdx)}
                  </span>
                  <span className="text-xs sm:text-sm">{optText}</span>
                </div>

                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  isSelected ? 'border-brand-600 bg-brand-600' : 'border-slate-300 dark:border-slate-700'
                }`}>
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button
            variant="secondary"
            size="sm"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((prev) => prev - 1)}
          >
            ← Previous
          </Button>

          <div className="flex items-center gap-2">
            {currentIndex < totalCount - 1 ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setCurrentIndex((prev) => prev + 1)}
              >
                <span>Next</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                icon={CheckCircle2}
                onClick={() => setIsSubmitModalOpen(true)}
              >
                Finish & Submit
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        title="Submit Practice Test"
      >
        <div className="space-y-4">
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            You have answered <strong>{answeredCount}</strong> out of <strong>{totalCount}</strong> questions.
            Are you sure you want to finalize and grade this test?
          </p>

          {answeredCount < totalCount && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg text-xs text-amber-700 dark:text-amber-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>You have {totalCount - answeredCount} unanswered questions remaining.</span>
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsSubmitModalOpen(false)}
            >
              Return to Test
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              onClick={() => handleSubmitTest(false)}
            >
              Confirm Submission
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default QuizAttemptPage;
