import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, GraduationCap, ArrowRight, UserCheck, ShieldCheck, AlertCircle, RotateCcw } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const LoginPage = () => {
  const { login, resendVerification } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Unverified Email Warning State
  const [unverifiedEmail, setUnverifiedEmail] = useState(null);
  const [isResending, setIsResending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUnverifiedEmail(null);
    setLoading(true);

    const res = await login({ email, password });
    setLoading(false);

    if (res.success) {
      if (res.data?.user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } else if (res.code === 'EMAIL_NOT_VERIFIED') {
      setUnverifiedEmail(res.email || email);
    }
  };

  const handleResend = async () => {
    if (!unverifiedEmail) return;
    setIsResending(true);
    await resendVerification(unverifiedEmail);
    setIsResending(false);
  };

  const handleDemoStudent = () => {
    setUnverifiedEmail(null);
    setEmail('student@learnai.com');
    setPassword('password123');
  };

  const handleDemoAdmin = () => {
    setUnverifiedEmail(null);
    setEmail('admin@learnai.com');
    setPassword('adminpassword123');
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Logo & Subtitle */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-brand-600 text-white font-bold mx-auto shadow-xs">
            <GraduationCap className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Welcome back to LearnAI
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Sign in to access your study library and AI tools
          </p>
        </div>

        {/* Unverified Email Warning Banner */}
        {unverifiedEmail && (
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 space-y-2.5">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h2 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                  Email Verification Required
                </h2>
                <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                  Please verify your email address (<strong>{unverifiedEmail}</strong>) before signing in.
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={RotateCcw}
              isLoading={isResending}
              onClick={handleResend}
              className="w-full text-xs font-semibold border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/40"
            >
              Resend verification email
            </Button>
          </div>
        )}

        {/* Login Card */}
        <Card className="p-6 sm:p-8 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="student@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={loading}
              className="w-full text-xs sm:text-sm font-semibold"
            >
              Sign In
            </Button>
          </form>

          {/* Quick 1-Click Demo Buttons */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block text-center">
              One-Click Demo Access
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleDemoStudent}
                className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 transition flex items-center justify-center gap-1.5"
              >
                <UserCheck className="w-3.5 h-3.5 text-brand-600" />
                <span>Demo Student</span>
              </button>

              <button
                type="button"
                onClick={handleDemoAdmin}
                className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 transition flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                <span>Demo Admin</span>
              </button>
            </div>
          </div>
        </Card>

        {/* Register Prompt */}
        <p className="text-center text-xs text-slate-500">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-semibold text-brand-600 hover:underline">
            Get started free
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
