import React, { useState, useEffect } from 'react';
import { analyticsService } from '../../services/analyticsService';
import { useTranslation } from 'react-i18next';
import {
  BarChart3,
  TrendingUp,
  Award,
  BookOpen,
  Clock,
  Flame,
  CheckCircle,
  Activity
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AnalyticsPage = () => {
  const { t } = useTranslation();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await analyticsService.getAnalytics();
        if (res.success && res.data.analytics) {
          setAnalytics(res.data.analytics);
        }
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Calculating your learning analytics..." />;
  }

  const accuracyData = [
    { name: 'Correct', value: analytics?.totalCorrectAnswers || 1, color: '#10b981' },
    { name: 'Incorrect', value: analytics?.totalIncorrectAnswers || 0, color: '#f43f5e' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          {t('analytics.title', 'Learning Analytics')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          {t('analytics.subtitle', 'Track your study time, score trends, and subject performance')}
        </p>
      </div>

      {/* 4 Compact Overview KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
              {analytics?.averageScore || 0}%
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Average Score</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
              {analytics?.overallAccuracy || 0}%
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Overall Accuracy</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
              {analytics?.totalStudyTimeMinutes || 0}m
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Study Time</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
              {analytics?.totalQuizzesAttempted || 0}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Quizzes Completed</p>
          </div>
        </Card>
      </div>

      {/* Primary Analytics Charts (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Trend Over Time */}
        <Card className="p-5 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              {t('analytics.scoreTrend', 'Score Progress Over Time')}
            </h3>
            <p className="text-xs text-slate-400">Score percentage on recent quiz attempts</p>
          </div>

          <div className="h-56 w-full">
            {analytics?.scoreTrends && analytics.scoreTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.scoreTrends} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                  <XAxis dataKey="quizTitle" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '0.5rem', fontSize: '11px' }} />
                  <Area type="monotone" dataKey="percentage" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#scoreColor)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Attempt quizzes to visualize your learning curve.
              </div>
            )}
          </div>
        </Card>

        {/* Subject Performance Breakdown */}
        <Card className="p-5 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              {t('analytics.subjectMastery', 'Subject Performance')}
            </h3>
            <p className="text-xs text-slate-400">Mastery and accuracy rate per academic subject</p>
          </div>

          <div className="h-56 w-full">
            {analytics?.subjectPerformance && analytics.subjectPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.subjectPerformance} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                  <XAxis dataKey="subject" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '0.5rem', fontSize: '11px' }} />
                  <Bar dataKey="masteryRate" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No subject records available yet.
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Secondary Analytics Charts: Accuracy & Study Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Correct vs Incorrect Answers Pie */}
        <Card className="p-5 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              {t('analytics.correctVsIncorrect', 'Accuracy Breakdown')}
            </h3>
            <p className="text-xs text-slate-400">Ratio of correct to incorrect responses</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            {analytics?.totalCorrectAnswers || analytics?.totalIncorrectAnswers ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={accuracyData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {accuracyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '0.5rem', fontSize: '11px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-400">No question response data available.</div>
            )}
          </div>
        </Card>

        {/* Weekly Study Time Activity */}
        <Card className="p-5 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              {t('analytics.weeklyActivity', 'Study Activity (Minutes)')}
            </h3>
            <p className="text-xs text-slate-400">Daily study engagement across the past week</p>
          </div>

          <div className="h-56 w-full">
            {analytics?.last7DaysActivity ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.last7DaysActivity} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                  <XAxis dataKey="day" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '0.5rem', fontSize: '11px' }} />
                  <Bar dataKey="studyMinutes" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No activity data logged yet.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsPage;
