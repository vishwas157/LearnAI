import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import {
  Users,
  BookOpen,
  Award,
  ShieldCheck,
  Activity,
  ArrowRight,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const res = await adminService.getStats();
        if (res.success && res.data) {
          setStats(res.data.stats);
          setRecentUsers(res.data.recentUsers || []);
          setRecentActivities(res.data.recentActivities || []);
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading platform overview..." />;
  }

  const statCards = [
    { title: 'Total Registered Users', value: stats?.totalUsers || 0, icon: Users },
    { title: 'Active Students', value: stats?.totalStudents || 0, icon: UserCheck },
    { title: 'Study Materials', value: stats?.totalMaterials || 0, icon: BookOpen },
    { title: 'Quizzes Created', value: stats?.totalQuizzes || 0, icon: Award },
    { title: 'Quiz Submissions', value: stats?.totalAttempts || 0, icon: TrendingUp },
    { title: 'Administrators', value: stats?.totalAdmins || 1, icon: ShieldCheck },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Admin Overview & Insights
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time platform metrics, user moderation, and content management
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/admin/users">
            <Button variant="primary" size="sm">
              Manage Users
            </Button>
          </Link>
          <Link to="/admin/content">
            <Button variant="secondary" size="sm">
              Manage Content
            </Button>
          </Link>
        </div>
      </div>

      {/* 6 Platform Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {statCards.map((st) => {
          const Icon = st.icon;
          return (
            <Card key={st.title} className="p-3.5 text-center">
              <Icon className="w-5 h-5 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
              <p className="text-xl font-bold text-slate-900 dark:text-white">{st.value}</p>
              <p className="text-[10px] text-slate-500 uppercase font-semibold mt-0.5">{st.title}</p>
            </Card>
          );
        })}
      </div>

      {/* Recent Users & Platform Activities (2 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Recent Users</h3>
            <Link to="/admin/users" className="text-xs text-purple-600 hover:underline">
              View All →
            </Link>
          </div>

          <div className="space-y-2">
            {recentUsers.length > 0 ? (
              recentUsers.map((u) => (
                <div
                  key={u._id}
                  className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-md bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold flex items-center justify-center">
                      {u.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{u.name}</p>
                      <p className="text-[11px] text-slate-500">{u.email}</p>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    u.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                  }`}>
                    {u.role}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">No users registered yet.</p>
            )}
          </div>
        </Card>

        {/* Live Activity Feed */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Live Activity Feed</h3>
            <span className="text-xs text-slate-400">Past student actions</span>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {recentActivities.length > 0 ? (
              recentActivities.map((act) => (
                <div
                  key={act._id}
                  className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-brand-600" />
                    <span>
                      <strong className="text-slate-900 dark:text-white">{act.user?.name || 'Student'}</strong>{' '}
                      performed <span className="text-brand-600 font-medium">{act.activityType}</span>
                    </span>
                  </div>

                  <span className="text-[10px] text-slate-400">
                    {act.createdAt ? new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">No activities logged yet.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
