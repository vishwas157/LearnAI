import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { analyticsService } from '../../services/analyticsService';
import { materialService } from '../../services/materialService';
import { quizService } from '../../services/quizService';

import {
  BookOpen,
  Award,
  TrendingUp,
  Flame,
  ArrowRight,
  Bot,
  Bookmark,
  Plus,
} from 'lucide-react';

import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const DashboardPage = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

  const [analytics, setAnalytics] = useState({
    totalMaterials: 0,
    totalQuizzesAttempted: 0,
    averageScore: 0,
    studyStreakDays: 1,
    recentActivities: [],
  });

  const [materials, setMaterials] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  /*
  |--------------------------------------------------------------------------
  | Load dashboard data (Backend API with local fallback)
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let isMounted = true;

    const loadDashboardData = async () => {
      try {
        const [analyticsRes, materialsRes, quizzesRes] = await Promise.allSettled([
          analyticsService.getAnalytics(),
          materialService.getMaterials(),
          quizService.getQuizzes(),
        ]);

        if (!isMounted) return;

        let loadedMaterials = [];
        let loadedQuizzes = [];
        let loadedAnalytics = null;

        if (materialsRes.status === 'fulfilled' && materialsRes.value?.data?.materials) {
          loadedMaterials = materialsRes.value.data.materials;
          setMaterials(loadedMaterials);
        }

        if (quizzesRes.status === 'fulfilled' && quizzesRes.value?.data?.quizzes) {
          loadedQuizzes = quizzesRes.value.data.quizzes;
          setQuizzes(loadedQuizzes);
        }

        if (analyticsRes.status === 'fulfilled' && analyticsRes.value?.data?.analytics) {
          loadedAnalytics = analyticsRes.value.data.analytics;
          setAnalytics(loadedAnalytics);
        }

        // If backend returned empty or was unreachable, fallback to localStorage
        if (loadedMaterials.length === 0) {
          const savedMaterials = localStorage.getItem('learnai_materials');
          if (savedMaterials) {
            try { setMaterials(JSON.parse(savedMaterials)); } catch {}
          }
        }

        if (loadedQuizzes.length === 0) {
          const savedQuizzes = localStorage.getItem('learnai_quizzes');
          if (savedQuizzes) {
            try { setQuizzes(JSON.parse(savedQuizzes)); } catch {}
          }
        }

        if (!loadedAnalytics) {
          const savedAnalytics = localStorage.getItem('learnai_analytics');
          if (savedAnalytics) {
            try { setAnalytics(JSON.parse(savedAnalytics)); } catch {}
          }
        }
      } catch (error) {
        console.warn('Dashboard data fetch fallback:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, [user]);


  /*
  |--------------------------------------------------------------------------
  | Greeting
  |--------------------------------------------------------------------------
  */

  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) {
      return 'Good morning';
    }

    if (hour < 18) {
      return 'Good afternoon';
    }

    return 'Good evening';
  };

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <LoadingSpinner
        message="Loading your student dashboard..."
      />
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Dashboard sections
  |--------------------------------------------------------------------------
  */

  const inProgressMaterials =
    materials.slice(0, 3);

  const recommendedQuizzes =
    quizzes.slice(0, 2);

  const recentActivities =
    analytics.recentActivities || [];

  return (
    <div className="space-y-8">

      {/* ============================================================
          HEADER
      ============================================================ */}

      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          {getGreeting()},{' '}
          {user?.name?.split(' ')[0] || 'Student'} 👋
        </h1>

        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          {t(
            'dashboard.subtitle',
            'Continue your learning journey.'
          )}
        </p>
      </div>

      {/* ============================================================
          CONTINUE LEARNING
      ============================================================ */}

      <section className="space-y-3">

        <div className="flex items-center justify-between">

          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t(
              'dashboard.continueLearning',
              'Continue Learning'
            )}
          </h2>

          <Link
            to="/materials"
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 flex items-center gap-1"
          >
            <span>
              {t(
                'dashboard.viewAll',
                'View All Materials'
              )}
            </span>

            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

        </div>

        {inProgressMaterials.length > 0 ? (

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {inProgressMaterials.map(
              (mat, index) => {

                const progress =
                  mat.readingProgress || 0;

                const materialId =
                  mat._id ||
                  mat.id ||
                  `material-${index}`;

                return (
                  <Card
                    key={materialId}
                    hoverEffect
                    className="flex flex-col justify-between"
                  >

                    <div className="space-y-2">

                      <div className="flex items-center justify-between">

                        <span className="text-[10px] font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40 px-2 py-0.5 rounded uppercase">
                          {mat.subject ||
                            'General'}
                        </span>

                        <span className="text-[11px] text-slate-400">
                          {mat.createdAt
                            ? new Date(
                              mat.createdAt
                            ).toLocaleDateString()
                            : 'Recent'}
                        </span>

                      </div>

                      <div>

                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">
                          {mat.title ||
                            'Study Material'}
                        </h3>

                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                          {mat.description ||
                            'Study document'}
                        </p>

                      </div>

                      {/* Progress */}

                      <div className="pt-2">

                        <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1 font-medium">

                          <span>
                            Progress
                          </span>

                          <span>
                            {progress}% completed
                          </span>

                        </div>

                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">

                          <div
                            className="h-full bg-brand-600 rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.max(
                                5,
                                progress
                              )}%`,
                            }}
                          />

                        </div>

                      </div>

                    </div>

                    <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800">

                      <Link
                        to={`/materials/${materialId}`}
                        className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 flex items-center justify-between group"
                      >
                        <span>
                          Continue Reading
                        </span>

                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </Link>

                    </div>

                  </Card>
                );
              }
            )}

          </div>

        ) : (

          <Card className="p-6 text-center">

            <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />

            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              No materials uploaded yet
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-3">
              Upload your lecture notes, PDFs,
              or study guides to start reading
              and listening.
            </p>

            <Link to="/materials">

              <Button
                size="sm"
                variant="primary"
                icon={Plus}
              >
                Upload Study Material
              </Button>

            </Link>

          </Card>
        )}

      </section>

      {/* ============================================================
          YOUR PROGRESS
      ============================================================ */}

      <section className="space-y-3">

        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {t(
            'dashboard.yourProgress',
            'Your Progress'
          )}
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">

          {/* Materials */}

          <Card className="p-3.5 flex items-center gap-3">

            <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>

            <div>

              <p className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                {analytics.totalMaterials}
              </p>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {t(
                  'dashboard.materialsStudied',
                  'Materials Studied'
                )}
              </p>

            </div>

          </Card>

          {/* Quizzes */}

          <Card className="p-3.5 flex items-center gap-3">

            <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Award className="w-4 h-4" />
            </div>

            <div>

              <p className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                {analytics.totalQuizzesAttempted}
              </p>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {t(
                  'dashboard.quizzesAttempted',
                  'Quizzes Completed'
                )}
              </p>

            </div>

          </Card>

          {/* Average Score */}

          <Card className="p-3.5 flex items-center gap-3">

            <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>

            <div>

              <p className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                {analytics.averageScore}%
              </p>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {t(
                  'dashboard.averageScore',
                  'Average Score'
                )}
              </p>

            </div>

          </Card>

          {/* Streak */}

          <Card className="p-3.5 flex items-center gap-3">

            <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Flame className="w-4 h-4" />
            </div>

            <div>

              <p className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                {analytics.studyStreakDays}{' '}
                {t(
                  'dashboard.days',
                  'Days'
                )}
              </p>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {t(
                  'dashboard.studyStreak',
                  'Study Streak'
                )}
              </p>

            </div>

          </Card>

        </div>

      </section>

      {/* ============================================================
          RECENT ACTIVITY + RECOMMENDED
      ============================================================ */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ========================================================
            RECENT ACTIVITY
        ======================================================== */}

        <div className="lg:col-span-2 space-y-3">

          <div className="flex items-center justify-between">

            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t(
                'dashboard.recentActivity',
                'Recent Activity'
              )}
            </h2>

            <Link
              to="/analytics"
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              View Analytics →
            </Link>

          </div>

          <Card className="p-0 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">

            {recentActivities.length > 0 ? (

              recentActivities
                .slice(0, 5)
                .map((act, index) => (

                  <div
                    key={index}
                    className="p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition text-xs"
                  >

                    <div className="flex items-center gap-3">

                      <div className="w-7 h-7 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">

                        {act.activityType ===
                          'quiz_attempt' ? (

                          <Award className="w-3.5 h-3.5 text-emerald-600" />

                        ) : act.activityType ===
                          'read_material' ? (

                          <BookOpen className="w-3.5 h-3.5 text-blue-600" />

                        ) : act.activityType ===
                          'ai_chat' ? (

                          <Bot className="w-3.5 h-3.5 text-indigo-600" />

                        ) : (

                          <Bookmark className="w-3.5 h-3.5 text-amber-600" />

                        )}

                      </div>

                      <div>

                        <p className="font-medium text-slate-800 dark:text-slate-200">

                          {act.activityType ===
                            'quiz_attempt'
                            ? 'Completed a practice quiz'
                            : act.activityType ===
                              'read_material'
                              ? 'Read course material'
                              : act.activityType ===
                                'ai_chat'
                                ? 'Asked AI Tutor a question'
                                : 'Bookmarked a study note'}

                        </p>

                        <p className="text-[11px] text-slate-400">
                          {act.durationSeconds
                            ? `${Math.round(
                              act.durationSeconds /
                              60
                            )} min session`
                            : 'Study activity'}
                        </p>

                      </div>

                    </div>

                    <span className="text-[11px] text-slate-400">
                      {act.createdAt
                        ? new Date(
                          act.createdAt
                        ).toLocaleDateString()
                        : 'Recent'}
                    </span>

                  </div>

                ))

            ) : (

              <div className="p-6 text-center text-xs text-slate-400">
                No recent study activity
                logged yet. Start reading a
                material or take a quiz!
              </div>

            )}

          </Card>

        </div>

        {/* ========================================================
            RECOMMENDED
        ======================================================== */}

        <div className="space-y-3">

          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t(
              'dashboard.recommended',
              'Recommended for You'
            )}
          </h2>

          <div className="space-y-3">

            {recommendedQuizzes.map(
              (q, index) => {

                const quizId =
                  q._id ||
                  q.id ||
                  `quiz-${index}`;

                return (
                  <Card
                    key={quizId}
                    className="p-4 flex flex-col justify-between"
                  >

                    <div>

                      <div className="flex items-center justify-between mb-1.5">

                        <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded uppercase">
                          {q.subject ||
                            'General'}
                        </span>

                        <span className="text-[10px] text-slate-400 uppercase font-medium">
                          {q.difficulty ||
                            'Medium'}
                        </span>

                      </div>

                      <h4 className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-1">
                        {q.title ||
                          'Practice Quiz'}
                      </h4>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                        {q.questions
                          ?.length ||
                          5}{' '}
                        questions to
                        test your knowledge
                      </p>

                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">

                      <Link
                        to={`/quiz/${quizId}/attempt`}
                        className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 flex items-center justify-between"
                      >

                        <span>
                          Take Practice Test
                        </span>

                        <ArrowRight className="w-3.5 h-3.5" />

                      </Link>

                    </div>

                  </Card>
                );
              }
            )}

            {/* AI Tutor */}

            <Card className="p-4 bg-gradient-to-br from-brand-50/50 to-indigo-50/30 dark:from-slate-900 dark:to-slate-900 border-brand-200/60 dark:border-slate-800">

              <div className="flex items-center gap-2 mb-2">

                <Bot className="w-4 h-4 text-brand-600" />

                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Need help
                  understanding?
                </h4>

              </div>

              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                Ask your AI Tutor to
                explain complex topics,
                summarize papers, or
                generate revision notes.
              </p>

              <Link to="/tutor">

                <Button
                  size="sm"
                  variant="primary"
                  className="w-full text-xs"
                >
                  Ask AI Tutor
                </Button>

              </Link>

            </Card>

          </div>

        </div>

      </div>

    </div>
  );
};

export default DashboardPage;