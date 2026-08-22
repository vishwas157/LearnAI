import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookmarkService } from '../../services/bookmarkService';
import { useToast } from '../../context/ToastContext';
import { useTranslation } from 'react-i18next';
import {
  Bookmark,
  Search,
  BookOpen,
  Sparkles,
  Bot,
  Award,
  Trash2,
  ExternalLink,
  Copy,
  CheckCircle2
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const BookmarksPage = () => {
  const { t } = useTranslation();
  const toast = useToast();

  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchBookmarks = async () => {
    try {
      const res = await bookmarkService.getBookmarks({
        type: selectedType,
        search: searchQuery,
      });
      if (res.success) {
        setBookmarks(res.data.bookmarks || []);
      }
    } catch (err) {
      console.error('Failed to load bookmarks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, [selectedType, searchQuery]);

  const handleDelete = async (id) => {
    try {
      const res = await bookmarkService.deleteBookmark(id);
      if (res.success) {
        toast.success('Bookmark removed');
        setBookmarks((prev) => prev.filter((b) => b._id !== id));
      }
    } catch (err) {
      toast.error('Failed to delete bookmark');
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Content copied to clipboard');
  };

  const bookmarkTypes = [
    { id: 'all', label: 'All Items' },
    { id: 'material', label: 'Materials', icon: BookOpen },
    { id: 'summary', label: 'Summaries', icon: Sparkles },
    { id: 'explanation', label: 'AI Notes', icon: Bot },
    { id: 'quiz_question', label: 'Questions', icon: Award },
  ];

  const getTypeBadge = (type) => {
    switch (type) {
      case 'material':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400">Material</span>;
      case 'summary':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400">Summary</span>;
      case 'explanation':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400">AI Note</span>;
      case 'quiz_question':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400">Question</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">Saved</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          {t('bookmarks.title', 'My Bookmarks')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          {t('bookmarks.subtitle', 'Saved study materials, difficult questions, and AI notes')}
        </p>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 scrollbar-none">
          {bookmarkTypes.map((bt) => (
            <button
              key={bt.id}
              onClick={() => setSelectedType(bt.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                selectedType === bt.id
                  ? 'bg-brand-600 text-white font-semibold shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
              }`}
            >
              {bt.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search saved bookmarks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>

      {/* Bookmarks Grid */}
      {loading ? (
        <LoadingSpinner message="Loading saved bookmarks..." />
      ) : bookmarks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bookmarks.map((bm) => (
            <Card
              key={bm._id}
              hoverEffect
              className="flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  {getTypeBadge(bm.type)}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopy(bm.content)}
                      className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
                      title="Copy content"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(bm._id)}
                      className="p-1 rounded-md text-slate-400 hover:text-rose-600 transition"
                      title="Delete bookmark"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-2">
                  {bm.title}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-4 leading-relaxed whitespace-pre-wrap">
                  {bm.content}
                </p>
              </div>

              {bm.referenceId && bm.type === 'material' && (
                <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
                  <Link
                    to={`/materials/${bm.referenceId}`}
                    className="flex items-center justify-center gap-1.5 py-1 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 transition"
                  >
                    <span>Open in Material Reader</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Bookmark}
          title={t('bookmarks.noBookmarks', 'No bookmarks saved yet')}
          description="Bookmark tricky questions, AI summaries, or essential study materials to review them here."
        />
      )}
    </div>
  );
};

export default BookmarksPage;
