import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { searchService } from '../../services/searchService';
import { useTranslation } from 'react-i18next';
import {
  Search,
  BookOpen,
  Award,
  Bookmark,
  ArrowRight,
  FileText
} from 'lucide-react';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const { t } = useTranslation();

  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState('all');
  const [results, setResults] = useState({ materials: [], quizzes: [], bookmarks: [] });
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        performSearch(query, category);
      } else {
        setResults({ materials: [], quizzes: [], bookmarks: [] });
        setTotalCount(0);
      }
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [query, category]);

  const performSearch = async (searchTerm, cat) => {
    setLoading(true);
    try {
      const res = await searchService.search(searchTerm, cat);
      if (res.success && res.data) {
        setResults(res.data.results || { materials: [], quizzes: [], bookmarks: [] });
        setTotalCount(res.data.totalCount || 0);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', label: 'All Results' },
    { id: 'materials', label: 'Materials', icon: BookOpen },
    { id: 'quizzes', label: 'Quizzes', icon: Award },
    { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          {t('search.title', 'Search')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          {t('search.subtitle', 'Search across your materials, quizzes, and bookmarks')}
        </p>
      </div>

      {/* Main Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          autoFocus
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSearchParams({ q: e.target.value });
          }}
          placeholder={t('search.placeholder', 'Search materials, quizzes, bookmarks...')}
          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-brand-500 shadow-xs"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
              category === cat.id
                ? 'bg-brand-600 text-white font-semibold shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Results Display */}
      {loading ? (
        <LoadingSpinner message="Searching your learning resources..." />
      ) : query.trim() && totalCount === 0 ? (
        <EmptyState
          icon={Search}
          title={t('search.noResults', 'No matching items found')}
          description="Try refining your search terms or exploring all categories."
        />
      ) : query.trim() ? (
        <div className="space-y-6">
          {/* Materials Section */}
          {(category === 'all' || category === 'materials') && results.materials?.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-brand-600" />
                <span>Materials ({results.materials.length})</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {results.materials.map((mat) => (
                  <Link
                    key={mat._id}
                    to={`/materials/${mat._id}`}
                    className="p-4 rounded-xl academic-card hover:border-brand-300 dark:hover:border-slate-700 flex items-center justify-between group"
                  >
                    <div className="min-w-0 pr-3">
                      <span className="text-[10px] font-semibold text-brand-600 dark:text-brand-400 uppercase">
                        {mat.subject}
                      </span>
                      <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white group-hover:text-brand-600 truncate">
                        {mat.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 truncate">{mat.description || 'View document'}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Quizzes Section */}
          {(category === 'all' || category === 'quizzes') && results.quizzes?.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-emerald-600" />
                <span>Quizzes ({results.quizzes.length})</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {results.quizzes.map((quiz) => (
                  <Link
                    key={quiz._id}
                    to={`/quiz/${quiz._id}/attempt`}
                    className="p-4 rounded-xl academic-card hover:border-emerald-300 dark:hover:border-slate-700 flex items-center justify-between group"
                  >
                    <div className="min-w-0 pr-3">
                      <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase">
                        {quiz.subject} • {quiz.difficulty}
                      </span>
                      <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 truncate">
                        {quiz.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 truncate">{quiz.description || 'Take practice test'}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Bookmarks Section */}
          {(category === 'all' || category === 'bookmarks') && results.bookmarks?.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5 text-amber-600" />
                <span>Bookmarks ({results.bookmarks.length})</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {results.bookmarks.map((bm) => (
                  <div
                    key={bm._id}
                    className="p-4 rounded-xl academic-card"
                  >
                    <span className="text-[10px] font-semibold text-amber-600 uppercase">{bm.type}</span>
                    <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate">{bm.title}</h3>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{bm.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-8 text-center text-slate-400 text-xs">
          Type keywords above to find study materials, quizzes, and bookmarks.
        </div>
      )}
    </div>
  );
};

export default SearchPage;
