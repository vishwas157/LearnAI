import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  Search,
  Trash2,
  Flame,
  ShieldCheck
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const UserManagementPage = () => {
  const { user: currentAdmin } = useAuth();
  const toast = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await adminService.getUsers({
        role: roleFilter,
        search: searchQuery,
      });
      if (res.success) {
        setUsers(res.data.users || []);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, searchQuery]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await adminService.updateUserRole(userId, newRole);
      if (res.success) {
        toast.success(`Role updated to ${newRole}`);
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
        );
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update role');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user: ${userName}?`)) return;

    try {
      const res = await adminService.deleteUser(userId);
      if (res.success) {
        toast.success('User deleted successfully');
        setUsers((prev) => prev.filter((u) => u._id !== userId));
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          User Management & Moderation
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          View all registered student and admin accounts and adjust access roles
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-2">
          {['all', 'student', 'admin'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
                roleFilter === r
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Users Table Card */}
      <Card className="overflow-x-auto p-0">
        {loading ? (
          <div className="p-8">
            <LoadingSpinner message="Loading user directory..." />
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Language</th>
                <th className="px-5 py-3">Streak</th>
                <th className="px-5 py-3">Joined Date</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.map((u) => {
                const isSelf = currentAdmin?._id === u._id;
                return (
                  <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-md bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold flex items-center justify-center">
                          {u.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>{u.name}</span>
                            {isSelf && (
                              <span className="text-[10px] bg-brand-50 text-brand-700 px-1.5 py-0.2 rounded font-medium">
                                You
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3">
                      <select
                        disabled={isSelf}
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        className={`bg-white dark:bg-slate-900 border rounded-md px-2 py-1 text-xs font-semibold uppercase ${
                          u.role === 'admin'
                            ? 'border-purple-300 text-purple-700 dark:border-purple-700 dark:text-purple-300'
                            : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <option value="student">STUDENT</option>
                        <option value="admin">ADMIN</option>
                      </select>
                    </td>

                    <td className="px-5 py-3 uppercase font-medium text-slate-600 dark:text-slate-400">
                      {u.preferredLanguage || 'en'}
                    </td>

                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1 text-amber-600 font-semibold">
                        <Flame className="w-3.5 h-3.5 fill-current" />
                        <span>{u.studyStreak || 1}d</span>
                      </span>
                    </td>

                    <td className="px-5 py-3 text-slate-400">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Recent'}
                    </td>

                    <td className="px-5 py-3 text-right">
                      <button
                        disabled={isSelf}
                        onClick={() => handleDeleteUser(u._id, u.name)}
                        className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition disabled:opacity-20 disabled:cursor-not-allowed"
                        title="Delete User"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
};

export default UserManagementPage;
