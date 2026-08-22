import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 px-4 sm:px-8 text-xs text-slate-500 dark:text-slate-400">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-brand-600 flex items-center justify-center text-white font-bold">
            <GraduationCap className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-slate-800 dark:text-slate-200">LearnAI</span>
          <span className="text-slate-400">— Learn smarter. Understand better.</span>
        </div>

        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="hover:text-slate-900 dark:hover:text-white transition">Dashboard</Link>
          <Link to="/materials" className="hover:text-slate-900 dark:hover:text-white transition">Materials</Link>
          <Link to="/quiz-craft" className="hover:text-slate-900 dark:hover:text-white transition">Quiz-Craft</Link>
          <Link to="/settings" className="hover:text-slate-900 dark:hover:text-white transition">Settings</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
