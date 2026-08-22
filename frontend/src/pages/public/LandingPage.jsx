import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  GraduationCap,
  BookOpen,
  Headphones,
  Bot,
  Sparkles,
  Award,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Zap,
  ShieldCheck
} from 'lucide-react';
import Button from '../../components/common/Button';

const LandingPage = () => {
  const { t } = useTranslation();

  const cycleSteps = [
    { num: '01', title: 'Read', desc: 'Read your course materials and lecture notes with built-in search and milestone progress tracking.', icon: BookOpen },
    { num: '02', title: 'Listen', desc: 'Listen on the go with Web Speech Text-to-Speech synthesis and speed adjustment.', icon: Headphones },
    { num: '03', title: 'Understand', desc: 'Break down complex derivations and difficult topics with AI concept explanations.', icon: Sparkles },
    { num: '04', title: 'Ask AI', desc: 'Ask questions to your AI Academic Tutor with complete context from your course materials.', icon: Bot },
    { num: '05', title: 'Summarize', desc: 'Generate revision notes in 5 distinct modes: Quick, Medium, Detailed, Bullets, or Exam Notes.', icon: Sparkles },
    { num: '06', title: 'Practice', desc: 'Test your knowledge retention with AI-generated and custom practice quizzes.', icon: Award },
    { num: '07', title: 'Analyze', desc: 'Measure your study time, score trends, and subject mastery over time.', icon: BarChart3 },
  ];

  return (
    <div className="flex flex-col space-y-16 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {/* 1. Hero Section */}
      <section className="text-center space-y-6 max-w-3xl mx-auto pt-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-slate-800 text-brand-700 dark:text-brand-300 text-xs font-semibold">
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Interactive Student Learning Platform</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
          Learn smarter. <span className="text-brand-600 dark:text-brand-400">Understand better.</span>
        </h1>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          An AI-powered academic workspace designed for college students. Read documents, listen with text-to-speech, ask your AI tutor questions, generate revision notes, and take practice quizzes.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link to="/register">
            <Button size="lg" variant="primary" icon={ArrowRight}>
              Get Started Free
            </Button>
          </Link>
          <Link to="/login">
            <Button size="lg" variant="secondary">
              Sign In to Account
            </Button>
          </Link>
        </div>
      </section>

      {/* 2. Clean Product Interface Preview Card */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-[10px] font-bold text-brand-600 uppercase">Interactive Workspace</span>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Operating Systems — Process Scheduling & Virtual Memory</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              Listen (1.0x)
            </span>
            <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300">
              68% Read
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <div className="md:col-span-2 space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            <p className="font-semibold text-slate-900 dark:text-white">Chapter 3: Preemptive vs Non-Preemptive Scheduling</p>
            <p className="text-slate-600 dark:text-slate-400">
              CPU scheduling algorithms decide which process in the ready queue is allocated CPU cycles. In preemptive scheduling (e.g. Round Robin), running tasks can be interrupted when their time quantum expires or a higher priority task enters the queue.
            </p>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
              <strong>Tutor Summary:</strong> Preemptive algorithms prevent CPU hogging and guarantee fairness for interactive time-sharing systems.
            </div>
          </div>

          <div className="space-y-2 border-l border-slate-100 dark:border-slate-800 pl-0 md:pl-6">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Study Tools</p>
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
              <span>AI Document Summary</span>
              <span className="text-brand-600 font-semibold">5 Modes</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
              <span>Practice Quiz</span>
              <span className="text-emerald-600 font-semibold">10 Qs</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
              <span>Text-to-Speech</span>
              <span className="text-amber-600 font-semibold">Enabled</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. The 7-Step Academic Learning Cycle */}
      <section className="space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            The Complete Learning Cycle
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            A proven methodology designed to take students from first read to mastery.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cycleSteps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400">
                    STEP {step.num}
                  </span>
                  <Icon className="w-4 h-4 text-slate-400" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{step.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Bottom CTA Section */}
      <section className="p-8 sm:p-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          Ready to study smarter?
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          Join students using LearnAI to read, summarize, practice, and excel in their courses.
        </p>
        <div className="pt-2">
          <Link to="/register">
            <Button size="lg" variant="primary">
              Create Your Free Account
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
