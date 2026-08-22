import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  CheckCircle2,
  XCircle,
  Mail,
  ArrowRight,
  GraduationCap,
  RotateCcw,
  Loader2
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { verifyEmail, resendVerification } = useAuth();
  const navigate = useNavigate();

  const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'error' | 'resend_sent'
  const [message, setMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided. Please click the link in your verification email.');
      return;
    }

    const verify = async () => {
      setStatus('verifying');
      const res = await verifyEmail(token);
      if (res.success) {
        setStatus('success');
        setMessage(res.message || 'Your email has been verified successfully!');
      } else {
        setStatus('error');
        setMessage(res.message || 'Invalid or expired verification token.');
      }
    };

    verify();
  }, [token]);

  const handleResend = async (e) => {
    e.preventDefault();
    if (!resendEmail.trim()) return;

    setIsResending(true);
    const res = await resendVerification(resendEmail.trim());
    setIsResending(false);

    if (res.success) {
      setStatus('resend_sent');
      setMessage(`A fresh verification link has been sent to ${resendEmail.trim()}`);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 py-16">
      <div className="w-full max-w-md space-y-6">
        {/* Logo & Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-brand-600 text-white font-bold mx-auto shadow-xs">
            <GraduationCap className="w-5 h-5" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Email Verification
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            LearnAI Student Account Activation
          </p>
        </div>

        {/* Verification Status Card */}
        <Card className="p-6 sm:p-8 text-center space-y-5">
          {status === 'verifying' && (
            <div className="py-6 space-y-4">
              <Loader2 className="w-8 h-8 text-brand-600 animate-spin mx-auto" />
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                  Verifying your email...
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Validating your secure cryptographic activation token.
                </p>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="py-4 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Your email has been verified!
                </h2>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  {message || 'Your account is now fully active. You can sign in to access your study library.'}
                </p>
              </div>

              <div className="pt-2">
                <Link to="/login">
                  <Button variant="primary" size="md" className="w-full font-semibold">
                    <span>Continue to Login</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="py-4 space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto border border-rose-200 dark:border-rose-800">
                <XCircle className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Verification Link Invalid or Expired
                </h2>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  {message}
                </p>
              </div>

              {/* Resend Verification Form */}
              <form onSubmit={handleResend} className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3 text-left">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Resend Verification Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="Enter your registered email"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-500"
                  />
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isResending}
                  className="w-full"
                >
                  Send New Verification Link
                </Button>
              </form>

              <div className="pt-2">
                <Link to="/login" className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
                  Back to Sign In
                </Link>
              </div>
            </div>
          )}

          {status === 'resend_sent' && (
            <div className="py-4 space-y-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto border border-blue-200 dark:border-blue-800">
                <Mail className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Check your inbox 📩
                </h2>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  {message}
                </p>
              </div>

              <div className="pt-2 flex justify-center gap-3">
                <Link to="/login">
                  <Button variant="secondary" size="sm">
                    Back to Login
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
