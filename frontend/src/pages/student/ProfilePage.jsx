import React, {
  useState,
  useEffect,
} from 'react';

import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

import {
  Flame,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const ProfilePage = () => {
  const {
    user,
    updateProfile,
  } = useAuth();

  const toast = useToast();

  /*
  |--------------------------------------------------------------------------
  | Local profile analytics
  |--------------------------------------------------------------------------
  |
  | We intentionally don't call the analytics API here.
  | This allows Profile to work even when MongoDB is unavailable.
  |
  */

  const [analytics, setAnalytics] =
    useState({
      totalMaterials: 0,
      totalQuizzesAttempted: 0,
      averageScore: 0,
      studyStreakDays: 1,
    });

  const [name, setName] =
    useState(user?.name || '');

  const [
    preferredLanguage,
    setPreferredLanguage,
  ] = useState(
    user?.preferredLanguage || 'en'
  );

  const [
    currentPassword,
    setCurrentPassword,
  ] = useState('');

  const [
    newPassword,
    setNewPassword,
  ] = useState('');

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState('');

  const [loading, setLoading] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | Sync profile fields when user changes
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (user) {
      setName(user.name || '');

      setPreferredLanguage(
        user.preferredLanguage || 'en'
      );

      setAnalytics({
        totalMaterials: 0,
        totalQuizzesAttempted: 0,
        averageScore: 0,
        studyStreakDays:
          user.studyStreak || 1,
      });
    }
  }, [user]);

  /*
  |--------------------------------------------------------------------------
  | Update Profile
  |--------------------------------------------------------------------------
  */

  const handleUpdateProfile = async (
    e
  ) => {
    e.preventDefault();

    /*
    |--------------------------------------------------------------------------
    | Password validation
    |--------------------------------------------------------------------------
    */

    if (
      newPassword &&
      newPassword !== confirmPassword
    ) {
      toast.error(
        'New passwords do not match'
      );

      return;
    }

    if (
      newPassword &&
      newPassword.length < 6
    ) {
      toast.error(
        'New password must be at least 6 characters long'
      );

      return;
    }

    if (
      newPassword &&
      !currentPassword
    ) {
      toast.error(
        'Please enter your current password'
      );

      return;
    }

    setLoading(true);

    const payload = {
      name: name.trim(),
      preferredLanguage,
    };

    /*
    |--------------------------------------------------------------------------
    | Password payload
    |--------------------------------------------------------------------------
    */

    if (newPassword) {
      payload.currentPassword =
        currentPassword;

      payload.newPassword =
        newPassword;
    }

    const res =
      await updateProfile(payload);

    setLoading(false);

    if (res.success) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Loading state
  |--------------------------------------------------------------------------
  */

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-sm text-slate-500">
          Loading profile...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">

      {/* ============================================================
          HEADER
      ============================================================ */}

      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Student Profile
        </h1>

        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Manage your student account, learning preferences, and credentials
        </p>
      </div>

      {/* ============================================================
          MAIN GRID
      ============================================================ */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* ========================================================
            LEFT COLUMN
        ======================================================== */}

        <div className="space-y-4">

          {/* ======================================================
              PROFILE CARD
          ====================================================== */}

          <Card className="p-6 text-center space-y-3">

            <div className="w-16 h-16 rounded-full bg-brand-600 flex items-center justify-center text-white text-2xl font-bold mx-auto shadow-xs">
              {user.name
                ? user.name
                  .charAt(0)
                  .toUpperCase()
                : 'U'}
            </div>

            <div>

              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {user.name}
              </h2>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                {user.email}
              </p>

              {/* Role + Verification */}

              <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2">

                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300">
                  {user.role || 'student'}
                </span>

                {user.emailVerified !==
                  false ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">

                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />

                    <span>
                      Verified Email
                    </span>

                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">

                    <AlertCircle className="w-3 h-3 text-amber-600" />

                    <span>
                      Unverified
                    </span>

                  </span>
                )}

              </div>
            </div>
          </Card>

          {/* ======================================================
              LEARNING SUMMARY
          ====================================================== */}

          <Card className="p-4 space-y-3">

            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Learning Summary
            </h3>

            <div className="space-y-2 text-xs">

              {/* Materials */}

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800">

                <span className="text-slate-600 dark:text-slate-400">
                  Materials Studied
                </span>

                <span className="font-bold text-slate-900 dark:text-white">
                  {analytics.totalMaterials}
                </span>

              </div>

              {/* Quizzes */}

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800">

                <span className="text-slate-600 dark:text-slate-400">
                  Quizzes Completed
                </span>

                <span className="font-bold text-slate-900 dark:text-white">
                  {analytics.totalQuizzesAttempted}
                </span>

              </div>

              {/* Average */}

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800">

                <span className="text-slate-600 dark:text-slate-400">
                  Average Score
                </span>

                <span className="font-bold text-brand-600 dark:text-brand-400">
                  {analytics.averageScore}%
                </span>

              </div>

              {/* Streak */}

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800">

                <span className="text-slate-600 dark:text-slate-400">
                  Current Streak
                </span>

                <span className="font-bold text-amber-600 flex items-center gap-1">

                  <Flame className="w-3.5 h-3.5 fill-current" />

                  {analytics.studyStreakDays} Days

                </span>

              </div>

            </div>
          </Card>
        </div>

        {/* ========================================================
            RIGHT COLUMN
        ======================================================== */}

        <div className="md:col-span-2">

          <Card className="p-6 space-y-4">

            <form
              onSubmit={
                handleUpdateProfile
              }
              className="space-y-4"
            >

              {/* ==================================================
                  ACCOUNT INFORMATION
              ================================================== */}

              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Account Information
              </h3>

              {/* Full Name */}

              <div>

                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>

                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-500"
                />

              </div>

              {/* Email */}

              <div>

                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address (Read-only)
                </label>

                <input
                  type="email"
                  disabled
                  value={user.email || ''}
                  className="w-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-500 cursor-not-allowed"
                />

              </div>

              {/* Language */}

              <div>

                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Preferred Learning Language
                </label>

                <select
                  value={
                    preferredLanguage
                  }
                  onChange={(e) =>
                    setPreferredLanguage(
                      e.target.value
                    )
                  }
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-500"
                >

                  <option value="en">
                    English
                  </option>

                  <option value="hi">
                    Hindi (हिंदी)
                  </option>

                  <option value="gu">
                    Gujarati (ગુજરાતી)
                  </option>

                </select>

              </div>

              {/* ==================================================
                  PASSWORD SECTION
              ================================================== */}

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">

                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Update Password (Optional)
                </h3>

                {/* Current Password */}

                <div>

                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Current Password
                  </label>

                  <input
                    type="password"
                    placeholder="Leave empty if unchanged"
                    value={
                      currentPassword
                    }
                    onChange={(e) =>
                      setCurrentPassword(
                        e.target.value
                      )
                    }
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-500"
                  />

                </div>

                {/* New + Confirm */}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                  {/* New Password */}

                  <div>

                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      New Password
                    </label>

                    <input
                      type="password"
                      placeholder="••••••••"
                      value={
                        newPassword
                      }
                      onChange={(e) =>
                        setNewPassword(
                          e.target.value
                        )
                      }
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-500"
                    />

                  </div>

                  {/* Confirm */}

                  <div>

                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Confirm New Password
                    </label>

                    <input
                      type="password"
                      placeholder="••••••••"
                      value={
                        confirmPassword
                      }
                      onChange={(e) =>
                        setConfirmPassword(
                          e.target.value
                        )
                      }
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-500"
                    />

                  </div>

                </div>
              </div>

              {/* ==================================================
                  SAVE BUTTON
              ================================================== */}

              <div className="pt-2 flex justify-end">

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={loading}
                >
                  Save Profile Changes
                </Button>

              </div>

            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;