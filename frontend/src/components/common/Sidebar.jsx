import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  BookOpen,
  Bot,
  Award,
  BarChart3,
  Bookmark,
  User,
  Settings,
  Shield,
  X,
  GraduationCap,
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { isAdmin } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();

  const mainNavItems = [
    { to: '/dashboard', label: t('nav.dashboard', 'Dashboard'), icon: LayoutDashboard },
    { to: '/materials', label: t('nav.materials', 'My Materials'), icon: BookOpen },
    { to: '/tutor', label: t('nav.tutor', 'AI Tutor'), icon: Bot },
    { to: '/quiz-craft', label: t('nav.quizCraft', 'Quiz-Craft'), icon: Award },
    { to: '/analytics', label: t('nav.analytics', 'Analytics'), icon: BarChart3 },
    { to: '/bookmarks', label: t('nav.bookmarks', 'Bookmarks'), icon: Bookmark },
  ];

  const accountNavItems = [
    { to: '/profile', label: t('nav.profile', 'Profile'), icon: User },
    { to: '/settings', label: t('nav.settings', 'Settings'), icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-60 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold shadow-xs">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                LearnAI
              </span>
            </div>

            <button
              onClick={onClose}
              className="lg:hidden p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Main Navigation */}
          <div className="p-3 space-y-4">
            <div>
              <div className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Learning
              </div>
              <nav className="space-y-0.5">
                {mainNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.to || (item.to !== '/dashboard' && location.pathname.startsWith(item.to));

                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => {
                        if (window.innerWidth < 1024) onClose();
                      }}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300 font-semibold'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            {/* Account Section */}
            <div>
              <div className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Account
              </div>
              <nav className="space-y-0.5">
                {accountNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.to;

                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => {
                        if (window.innerWidth < 1024) onClose();
                      }}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300 font-semibold'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}

                {isAdmin && (
                  <NavLink
                    to="/admin"
                    onClick={() => {
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      location.pathname.startsWith('/admin')
                        ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 font-semibold'
                        : 'text-purple-600 dark:text-purple-400 hover:bg-purple-50/50 dark:hover:bg-purple-950/20'
                    }`}
                  >
                    <Shield className="w-4 h-4 shrink-0 text-purple-600 dark:text-purple-400" />
                    <span>Admin Portal</span>
                  </NavLink>
                )}
              </nav>
            </div>
          </div>
        </div>

        {/* Sidebar Footer Tagline */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800">
          <p className="text-[11px] text-slate-400 text-center font-medium">
            Learn smarter. Understand better.
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
