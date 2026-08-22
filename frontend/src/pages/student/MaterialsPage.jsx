import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { materialService } from '../../services/materialService';
import { bookmarkService } from '../../services/bookmarkService';
import { useToast } from '../../context/ToastContext';
import { useTranslation } from 'react-i18next';
import {
  BookOpen,
  Plus,
  Search,
  FileText,
  Bookmark,
  Trash2,
  ExternalLink,
  UploadCloud,
  Layers,
  ArrowRight,
  Filter,
  CheckCircle2
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const MaterialsPage = () => {
  const { t } = useTranslation();
  const toast = useToast();

  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Modal Form State
  const [uploadType, setUploadType] = useState('file'); // 'file' | 'manual'
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Computer Science');
  const [description, setDescription] = useState('');
  const [textContent, setTextContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchMaterials = async () => {
    try {
      const res = await materialService.getMaterials({
        subject: selectedSubject,
        search: searchQuery,
      });
      if (res.success) {
        setMaterials(res.data.materials || []);
      }
    } catch (err) {
      console.error('Failed to fetch materials:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, [selectedSubject, searchQuery]);

  const handleUploadSubmit = async (e) => {
    e.preventDefault();

    if (uploadType === 'file' && !file) {
      toast.error('Please select a PDF or TXT file to upload');
      return;
    }
    if (uploadType === 'manual' && (!title.trim() || !textContent.trim())) {
      toast.error('Please enter a title and text content');
      return;
    }

    setIsSubmitting(true);
    try {
      let res;
      if (uploadType === 'file') {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', title || file.name.replace(/\.[^/.]+$/, ''));
        formData.append('subject', subject);
        formData.append('description', description);
        res = await materialService.uploadPDF(formData);
      } else {
        res = await materialService.createManualMaterial({
          title,
          subject,
          description,
          textContent,
        });
      }

      if (res.success) {
        toast.success('Study material added to your library!');
        setIsUploadModalOpen(false);
        setFile(null);
        setTitle('');
        setDescription('');
        setTextContent('');
        fetchMaterials();
      } else {
        toast.error(res.message || 'Failed to add material');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving study material');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBookmarkToggle = async (materialId, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await materialService.toggleBookmark(materialId);
      if (res.success) {
        toast.success(res.message || 'Bookmark updated');
        setMaterials((prev) =>
          prev.map((m) =>
            m._id === materialId ? { ...m, isBookmarked: !m.isBookmarked } : m
          )
        );
      }
    } catch (err) {
      toast.error('Failed to update bookmark');
    }
  };

  const subjects = ['all', 'Computer Science', 'Artificial Intelligence', 'Biology', 'Physics', 'Mathematics'];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {t('materials.title', 'Study Library')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {t('materials.subtitle', 'Access, read, and listen to your course materials')}
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Plus}
          onClick={() => setIsUploadModalOpen(true)}
          className="self-start sm:self-auto"
        >
          {t('materials.uploadBtn', 'Upload Material')}
        </Button>
      </div>

      {/* Search & Subject Filter Library Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Subject Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 scrollbar-none">
          {subjects.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                selectedSubject === sub
                  ? 'bg-brand-600 text-white font-semibold shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
              }`}
            >
              {sub === 'all' ? t('materials.allSubjects', 'All Subjects') : sub}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={t('materials.searchPlaceholder', 'Search study materials...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>

      {/* Materials Library Grid */}
      {loading ? (
        <LoadingSpinner message="Loading your study library..." />
      ) : materials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {materials.map((mat) => {
            const progress = mat.readingProgress || 0;
            return (
              <Card
                key={mat._id}
                hoverEffect
                className="flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Subject Tag & Bookmark */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-brand-700 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40 px-2 py-0.5 rounded uppercase">
                      {mat.subject}
                    </span>

                    <button
                      onClick={(e) => handleBookmarkToggle(mat._id, e)}
                      className={`p-1 rounded-md transition ${
                        mat.isBookmarked
                          ? 'text-amber-500 hover:text-amber-600'
                          : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                      }`}
                      title={mat.isBookmarked ? 'Remove bookmark' : 'Bookmark material'}
                    >
                      <Bookmark className={`w-4 h-4 ${mat.isBookmarked ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-2">
                      {mat.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                      {mat.description || 'Comprehensive lecture notes and study content.'}
                    </p>
                  </div>

                  {/* Progress Bar & Word Count */}
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>{mat.wordCount || 500} words</span>
                      <span className="font-medium">{progress}% read</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-600 rounded-full"
                        style={{ width: `${Math.max(5, progress)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-3 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    {mat.fileType ? mat.fileType.toUpperCase() : 'DOCUMENT'}
                  </span>

                  <Link
                    to={`/materials/${mat._id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700"
                  >
                    <span>Read Material</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={BookOpen}
          title={t('materials.noMaterials', 'No study materials found')}
          description="Upload your lecture notes, syllabi, or textbook chapters to read and listen."
          actionText={t('materials.uploadBtn', 'Upload Material')}
          onAction={() => setIsUploadModalOpen(true)}
        />
      )}

      {/* Upload Material Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title={t('materials.uploadModalTitle', 'Add Study Material')}
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          {/* Dual Mode Switch */}
          <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setUploadType('file')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition ${
                uploadType === 'file'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Upload PDF / TXT
            </button>
            <button
              type="button"
              onClick={() => setUploadType('manual')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition ${
                uploadType === 'manual'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Paste Text
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Title
            </label>
            <input
              type="text"
              required={uploadType === 'manual'}
              placeholder="e.g. Operating Systems - Process Scheduling"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Subject
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-500"
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Artificial Intelligence">Artificial Intelligence</option>
                <option value="Biology">Biology</option>
                <option value="Physics">Physics</option>
                <option value="Mathematics">Mathematics</option>
                <option value="General Studies">General Studies</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Brief Description (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Lecture 4 on scheduling algorithms"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {uploadType === 'file' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Document File (.pdf or .txt)
              </label>
              <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg p-6 text-center hover:border-brand-500 transition cursor-pointer">
                <input
                  type="file"
                  id="pdfFileInput"
                  accept=".pdf,.txt"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="hidden"
                />
                <label htmlFor="pdfFileInput" className="cursor-pointer space-y-2 block">
                  <UploadCloud className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    {file ? (
                      <span className="text-brand-600 dark:text-brand-400 font-semibold">{file.name}</span>
                    ) : (
                      'Click to browse PDF or TXT file'
                    )}
                  </p>
                  <p className="text-[11px] text-slate-400">PDF text will be extracted automatically</p>
                </label>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Document Text Content
              </label>
              <textarea
                required
                rows={6}
                placeholder="Paste your study content or lecture notes here..."
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-500"
              />
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsUploadModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
            >
              Save to Library
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MaterialsPage;
