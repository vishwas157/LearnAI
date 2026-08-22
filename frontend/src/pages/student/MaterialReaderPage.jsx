import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { materialService } from '../../services/materialService';
import { bookmarkService } from '../../services/bookmarkService';
import { useToast } from '../../context/ToastContext';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  BookOpen,
  Sparkles,
  Bot,
  Award,
  Bookmark,
  Search,
  CheckCircle2,
  Share2,
  FileText,
  Clock
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import TextToSpeechPlayer from '../../components/tts/TextToSpeechPlayer';

const MaterialReaderPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { t } = useTranslation();

  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [readingProgress, setReadingProgress] = useState(0);
  const [searchInDoc, setSearchInDoc] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const fetchMaterial = async () => {
      try {
        const res = await materialService.getMaterialById(id);
        if (res.success && res.data.material) {
          setMaterial(res.data.material);
          setReadingProgress(res.data.material.readingProgress || 0);
          setIsBookmarked(res.data.material.isBookmarked || false);
        } else {
          toast.error('Study material not found');
          navigate('/materials');
        }
      } catch (err) {
        toast.error('Failed to load study document');
        navigate('/materials');
      } finally {
        setLoading(false);
      }
    };

    fetchMaterial();
  }, [id, navigate, toast]);

  const handleUpdateProgress = async (progress) => {
    try {
      setReadingProgress(progress);
      await materialService.updateProgress(id, {
        progress,
        durationSeconds: 180,
      });
      if (progress === 100) {
        toast.success('Document marked as completed!');
      }
    } catch (err) {
      console.error('Progress sync error:', err);
    }
  };

  const handleBookmarkToggle = async () => {
    try {
      const res = await materialService.toggleBookmark(id);
      if (res.success) {
        setIsBookmarked(!isBookmarked);
        toast.success(res.message || 'Bookmark updated');
      }
    } catch (err) {
      toast.error('Failed to update bookmark');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Opening study workspace..." />;
  }

  if (!material) return null;

  return (
    <div className="space-y-4">
      {/* Reader Top Subheader */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            to="/materials"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Back to Study Library"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40 px-2 py-0.5 rounded uppercase">
                {material.subject}
              </span>
              <span className="text-xs text-slate-400">
                {material.wordCount || 500} words • ~{Math.ceil((material.wordCount || 500) / 200)} min read
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              {material.title}
            </h1>
          </div>
        </div>

        {/* Top Actions: Bookmark + Mark Completed */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={handleBookmarkToggle}
            className={`p-2 rounded-lg border transition ${
              isBookmarked
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-600'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
            title={isBookmarked ? 'Bookmarked' : 'Bookmark this material'}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>

          <Button
            variant={readingProgress >= 100 ? 'secondary' : 'primary'}
            size="sm"
            icon={CheckCircle2}
            onClick={() => handleUpdateProgress(100)}
          >
            {readingProgress >= 100 ? 'Completed' : 'Mark as Read'}
          </Button>
        </div>
      </div>

      {/* Embedded Text-to-Speech Player */}
      <TextToSpeechPlayer
        text={material.extractedText || material.textContent || ''}
        title={material.title}
      />

      {/* Main 2-Column Study Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* LEFT (2 Cols): Document Reader */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-6 sm:p-8">
            {/* Search in document */}
            <div className="relative mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Find in this document..."
                value={searchInDoc}
                onChange={(e) => setSearchInDoc(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-brand-500"
              />
            </div>

            {/* Document Content View */}
            <div className="markdown-content text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-slate-200">
              {material.extractedText || material.textContent ? (
                (material.extractedText || material.textContent)
                  .split('\n\n')
                  .map((paragraph, pIdx) => {
                    if (paragraph.startsWith('### ')) {
                      return <h3 key={pIdx}>{paragraph.replace('### ', '')}</h3>;
                    }
                    if (paragraph.startsWith('## ')) {
                      return <h2 key={pIdx}>{paragraph.replace('## ', '')}</h2>;
                    }
                    if (paragraph.startsWith('# ')) {
                      return <h1 key={pIdx}>{paragraph.replace('# ', '')}</h1>;
                    }

                    if (searchInDoc.trim()) {
                      const regex = new RegExp(`(${searchInDoc})`, 'gi');
                      const parts = paragraph.split(regex);
                      return (
                        <p key={pIdx} className="mb-4">
                          {parts.map((part, i) =>
                            part.toLowerCase() === searchInDoc.toLowerCase() ? (
                              <mark key={i} className="bg-amber-200 dark:bg-amber-900/60 dark:text-amber-100 px-0.5 rounded">
                                {part}
                              </mark>
                            ) : (
                              part
                            )
                          )}
                        </p>
                      );
                    }

                    return (
                      <p key={pIdx} className="mb-4">
                        {paragraph}
                      </p>
                    );
                  })
              ) : (
                <p className="text-slate-400 italic">No text content available.</p>
              )}
            </div>

            {/* Reading Milestones Footer */}
            <div className="pt-6 mt-8 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Reading Progress</span>
              <div className="flex items-center gap-2">
                {[25, 50, 75, 100].map((step) => (
                  <button
                    key={step}
                    onClick={() => handleUpdateProgress(step)}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                      readingProgress >= step
                        ? 'bg-brand-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {step}%
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* RIGHT (1 Col): Study Tools Panel */}
        <div className="space-y-4">
          <Card className="p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Study Tools
            </h3>

            <div className="space-y-2">
              {/* 1. AI Summary */}
              <Link
                to={`/summarizer?materialId=${material._id}`}
                className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-brand-300 dark:hover:border-brand-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition group"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400">
                    AI Summary
                  </h4>
                  <p className="text-[11px] text-slate-500">Generate revision notes in 5 modes</p>
                </div>
              </Link>

              {/* 2. Ask AI Tutor */}
              <Link
                to={`/tutor?materialId=${material._id}`}
                className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-brand-300 dark:hover:border-brand-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition group"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400">
                    Ask AI Tutor
                  </h4>
                  <p className="text-[11px] text-slate-500">Ask questions with document context</p>
                </div>
              </Link>

              {/* 3. Generate Practice Quiz */}
              <Link
                to={`/quiz-craft?materialId=${material._id}`}
                className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-brand-300 dark:hover:border-brand-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition group"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400">
                    Generate Quiz
                  </h4>
                  <p className="text-[11px] text-slate-500">Test comprehension with AI questions</p>
                </div>
              </Link>
            </div>
          </Card>

          {/* Quick Info Card */}
          <Card className="p-4 space-y-2 text-xs">
            <h4 className="font-semibold text-slate-800 dark:text-slate-200">Study Tips</h4>
            <ul className="text-slate-500 dark:text-slate-400 space-y-1.5 list-disc list-inside">
              <li>Listen with Text-to-Speech while reading along.</li>
              <li>Ask the AI Tutor to clarify tough derivations.</li>
              <li>Take a practice quiz to reinforce memory retention.</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MaterialReaderPage;
