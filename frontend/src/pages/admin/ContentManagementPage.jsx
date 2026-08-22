import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { materialService } from '../../services/materialService';
import { quizService } from '../../services/quizService';
import { useToast } from '../../context/ToastContext';
import {
  FileText,
  Award,
  BookOpen,
  Trash2,
  Search
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ContentManagementPage = () => {
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('materials');
  const [materials, setMaterials] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchContent = async () => {
    try {
      const res = await adminService.getContent();
      if (res.success && res.data) {
        setMaterials(res.data.materials || []);
        setQuizzes(res.data.quizzes || []);
      }
    } catch (err) {
      console.error('Failed to load content:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const handleDeleteMaterial = async (id, title) => {
    if (!window.confirm(`Delete study material: "${title}"?`)) return;
    try {
      const res = await materialService.deleteMaterial(id);
      if (res.success) {
        toast.success('Study material removed');
        setMaterials((prev) => prev.filter((m) => m._id !== id));
      }
    } catch (err) {
      toast.error('Failed to delete material');
    }
  };

  const handleDeleteQuiz = async (id, title) => {
    if (!window.confirm(`Delete quiz: "${title}"?`)) return;
    try {
      const res = await quizService.deleteQuiz(id);
      if (res.success) {
        toast.success('Quiz removed');
        setQuizzes((prev) => prev.filter((q) => q._id !== id));
      }
    } catch (err) {
      toast.error('Failed to delete quiz');
    }
  };

  const filteredMaterials = materials.filter(
    (m) =>
      m.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.subject?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredQuizzes = quizzes.filter(
    (q) =>
      q.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.subject?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Platform Content Moderation
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Review and moderate all study materials and quizzes across LearnAI
        </p>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('materials')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              activeTab === 'materials'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Materials ({materials.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('quizzes')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              activeTab === 'quizzes'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Quizzes ({quizzes.length})</span>
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Content Table Card */}
      <Card className="overflow-x-auto p-0">
        {loading ? (
          <div className="p-8">
            <LoadingSpinner message="Loading content directory..." />
          </div>
        ) : activeTab === 'materials' ? (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="px-5 py-3">Title</th>
                <th className="px-5 py-3">Subject</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Uploaded By</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredMaterials.map((m) => (
                <tr key={m._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <td className="px-5 py-3">
                    <p className="font-semibold text-slate-900 dark:text-white max-w-xs truncate">{m.title}</p>
                    <p className="text-[11px] text-slate-400 max-w-xs truncate">{m.description || 'No description'}</p>
                  </td>
                  <td className="px-5 py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                      {m.subject}
                    </span>
                  </td>
                  <td className="px-5 py-3 uppercase font-medium text-slate-500">
                    {m.fileType || 'manual'}
                  </td>
                  <td className="px-5 py-3 text-slate-600 dark:text-slate-400">
                    {m.uploadedBy?.name || 'Student'}
                  </td>
                  <td className="px-5 py-3 text-slate-400">
                    {m.createdAt ? new Date(m.createdAt).toLocaleDateString() : 'Recent'}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => handleDeleteMaterial(m._id, m.title)}
                      className="p-1 rounded-md text-slate-400 hover:text-rose-600 transition"
                      title="Delete Material"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="px-5 py-3">Quiz Title</th>
                <th className="px-5 py-3">Subject</th>
                <th className="px-5 py-3">Difficulty</th>
                <th className="px-5 py-3">Questions</th>
                <th className="px-5 py-3">Creator</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredQuizzes.map((q) => (
                <tr key={q._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <td className="px-5 py-3">
                    <p className="font-semibold text-slate-900 dark:text-white max-w-xs truncate">{q.title}</p>
                    <p className="text-[11px] text-slate-400 max-w-xs truncate">{q.description || 'Test'}</p>
                  </td>
                  <td className="px-5 py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      {q.subject}
                    </span>
                  </td>
                  <td className="px-5 py-3 uppercase font-medium text-slate-600 dark:text-slate-400">
                    {q.difficulty}
                  </td>
                  <td className="px-5 py-3 font-semibold text-slate-900 dark:text-white">
                    {q.questions?.length || 0} Qs
                  </td>
                  <td className="px-5 py-3 text-slate-600 dark:text-slate-400">
                    {q.createdBy?.name || (q.generatedByAI ? 'AI Engine' : 'User')}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => handleDeleteQuiz(q._id, q.title)}
                      className="p-1 rounded-md text-slate-400 hover:text-rose-600 transition"
                      title="Delete Quiz"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
};

export default ContentManagementPage;
