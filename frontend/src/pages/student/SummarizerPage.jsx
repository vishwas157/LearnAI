import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { aiService } from '../../services/aiService';
import { materialService } from '../../services/materialService';
import { bookmarkService } from '../../services/bookmarkService';
import { useToast } from '../../context/ToastContext';
import { useTranslation } from 'react-i18next';
import {
  Sparkles,
  BookOpen,
  FileText,
  Copy,
  Bookmark,
  Volume2,
  CheckCircle2,
  RefreshCw,
  Zap,
  GraduationCap
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import TextToSpeechPlayer from '../../components/tts/TextToSpeechPlayer';

const SummarizerPage = () => {
  const [searchParams] = useSearchParams();
  const initialMaterialId = searchParams.get('materialId') || '';
  const { t } = useTranslation();
  const toast = useToast();

  const [materials, setMaterials] = useState([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState(initialMaterialId);
  const [customText, setCustomText] = useState('');
  const [inputMode, setInputMode] = useState(initialMaterialId ? 'material' : 'material');
  const [summaryMode, setSummaryMode] = useState('quick');
  const [language, setLanguage] = useState('en');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const res = await materialService.getMaterials();
        if (res.success) {
          setMaterials(res.data.materials || []);
          if (!selectedMaterialId && res.data.materials?.length > 0) {
            setSelectedMaterialId(res.data.materials[0]._id);
          }
        }
      } catch (err) {
        console.error('Failed to load materials:', err);
      }
    };

    fetchMaterials();
  }, []);

  const handleGenerateSummary = async () => {
    if (inputMode === 'material' && !selectedMaterialId) {
      toast.error('Please select a study material');
      return;
    }
    if (inputMode === 'custom' && !customText.trim()) {
      toast.error('Please paste text to summarize');
      return;
    }

    setLoading(true);
    setSummary('');

    try {
      const payload = {
        mode: summaryMode,
        language,
        ...(inputMode === 'material'
          ? { materialId: selectedMaterialId }
          : { text: customText }),
      };

      const res = await aiService.summarize(payload);
      if (res.success && res.data.summary) {
        setSummary(res.data.summary);
        toast.success('Summary generated successfully!');
      } else {
        toast.error(res.message || 'Failed to generate summary');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error generating summary');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary);
    setIsCopied(true);
    toast.success('Summary copied to clipboard');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleBookmarkSummary = async () => {
    if (!summary) return;
    try {
      const selectedMat = materials.find((m) => m._id === selectedMaterialId);
      const res = await bookmarkService.createBookmark({
        type: 'summary',
        referenceId: inputMode === 'material' ? selectedMaterialId : null,
        title: `Summary: ${selectedMat?.title || 'Custom Notes'}`,
        content: summary,
        tags: [selectedMat?.subject || 'Summary', summaryMode],
      });

      if (res.success) {
        toast.success('Summary saved to bookmarks!');
      }
    } catch (err) {
      toast.error('Failed to bookmark summary');
    }
  };

  const summaryModes = [
    { id: 'quick', label: 'Quick Takeaways', desc: 'Core points & key takeaways' },
    { id: 'medium', label: 'Balanced Overview', desc: 'Structured conceptual overview' },
    { id: 'detailed', label: 'Detailed Breakdown', desc: 'Comprehensive section-by-section breakdown' },
    { id: 'bullet_points', label: 'Bullet Points', desc: 'Concise, high-yield bullet list' },
    { id: 'exam_revision', label: 'Exam Revision Notes', desc: 'Formulas, definitions & exam tips' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          {t('summarizer.title', 'AI Document Summarizer')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          {t('summarizer.subtitle', 'Synthesize long study materials into structured revision notes')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (5 Cols): Controls & Inputs */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-5 space-y-4">
            {/* Input Selection Mode */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Source Content
              </label>
              <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setInputMode('material')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition ${
                    inputMode === 'material'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  From Library
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('custom')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition ${
                    inputMode === 'custom'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Paste Text
                </button>
              </div>
            </div>

            {/* Source Input */}
            {inputMode === 'material' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Select Study Material
                </label>
                <select
                  value={selectedMaterialId}
                  onChange={(e) => setSelectedMaterialId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-500"
                >
                  {materials.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.title} ({m.subject})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Paste Study Text
                </label>
                <textarea
                  rows={4}
                  placeholder="Paste lecture notes or chapter text..."
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-500"
                />
              </div>
            )}

            {/* Summary Format Options */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Summary Format
              </label>
              <div className="space-y-1.5">
                {summaryModes.map((sm) => (
                  <label
                    key={sm.id}
                    onClick={() => setSummaryMode(sm.id)}
                    className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition ${
                      summaryMode === sm.id
                        ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/30'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="summaryMode"
                      checked={summaryMode === sm.id}
                      onChange={() => setSummaryMode(sm.id)}
                      className="mt-0.5 text-brand-600 focus:ring-brand-500"
                    />
                    <div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                        {sm.label}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {sm.desc}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Language Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Output Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-500"
              >
                <option value="en">English</option>
                <option value="hi">Hindi (हिंदी)</option>
                <option value="gu">Gujarati (ગુજરાતી)</option>
              </select>
            </div>

            <Button
              variant="primary"
              size="md"
              icon={Sparkles}
              isLoading={loading}
              onClick={handleGenerateSummary}
              className="w-full text-xs font-semibold"
            >
              {loading ? 'Generating Summary...' : 'Generate Summary'}
            </Button>
          </Card>
        </div>

        {/* Right Column (7 Cols): Summary Output Workspace */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="p-6 min-h-[420px] flex flex-col justify-between">
            {summary ? (
              <div className="space-y-4">
                {/* Header & Output Actions */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 uppercase">
                      {summaryModes.find((m) => m.id === summaryMode)?.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleCopy}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition text-xs flex items-center gap-1"
                      title="Copy text"
                    >
                      {isCopied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span className="hidden sm:inline text-xs">{isCopied ? 'Copied' : 'Copy'}</span>
                    </button>

                    <button
                      onClick={handleBookmarkSummary}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-xs flex items-center gap-1"
                      title="Bookmark summary"
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline text-xs">Bookmark</span>
                    </button>
                  </div>
                </div>

                {/* Text-to-Speech Player for the Summary */}
                <TextToSpeechPlayer text={summary} title="Listen to Summary" compact />

                {/* Formatted Markdown Summary */}
                <div className="markdown-content text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed max-h-[500px] overflow-y-auto pr-1">
                  {summary.split('\n\n').map((para, idx) => {
                    if (para.startsWith('### ')) {
                      return <h3 key={idx}>{para.replace('### ', '')}</h3>;
                    }
                    if (para.startsWith('## ')) {
                      return <h2 key={idx}>{para.replace('## ', '')}</h2>;
                    }
                    if (para.startsWith('# ')) {
                      return <h1 key={idx}>{para.replace('# ', '')}</h1>;
                    }
                    if (para.startsWith('- ') || para.startsWith('* ')) {
                      return (
                        <ul key={idx}>
                          {para.split('\n').map((item, i) => (
                            <li key={i}>{item.replace(/^[-*]\s+/, '')}</li>
                          ))}
                        </ul>
                      );
                    }
                    return <p key={idx}>{para}</p>;
                  })}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 mb-3">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Ready to Summarize
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mt-1">
                  Choose a study material or paste your text on the left, then click "Generate Summary".
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SummarizerPage;
