import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { aiService } from '../../services/aiService';
import { materialService } from '../../services/materialService';
import { useToast } from '../../context/ToastContext';
import { useTranslation } from 'react-i18next';
import {
  Bot,
  User,
  Send,
  Plus,
  Lightbulb,
  AlertCircle,
  BookOpen,
  Code,
  Check,
  Copy,
  Sparkles,
  Layers,
  GraduationCap,
  Briefcase,
  HelpCircle,
  FileText,
  Scale,
  Atom,
  Calculator,
  ChevronDown
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const MODES = [
  { id: 'detailed', label: 'Detailed Explanation', icon: Layers, desc: 'In-depth conceptual breakdown' },
  { id: 'simple', label: 'Simple & Intuitive', icon: Sparkles, desc: 'Beginner-friendly with analogies' },
  { id: 'exam', label: 'University Exam Answer', icon: GraduationCap, desc: 'Structured high-scoring answer' },
  { id: 'interview', label: 'Interview Prep', icon: Briefcase, desc: 'Trade-offs, complexity & edge cases' },
  { id: 'coding', label: 'Coding & Implementation', icon: Code, desc: 'Python/PyTorch logic & walkthrough' },
  { id: 'problem_solving', label: 'Step-by-Step Solving', icon: Calculator, desc: 'Mathematical derivation & solution' },
  { id: 'quiz_me', label: 'Quiz & Active Recall', icon: HelpCircle, desc: 'Interactive test on topic' },
  { id: 'revision', label: 'Revision Notes', icon: FileText, desc: 'High-yield formulas & bullet points' },
  { id: 'compare', label: 'Compare Concepts', icon: Scale, desc: 'Side-by-side comparison table' },
  { id: 'research', label: 'Research & Advanced', icon: Atom, desc: 'State-of-the-art architecture nuances' },
];

/**
 * Academic Markdown & Code Message Renderer
 */
const FormattedMessage = ({ content }) => {
  const [copiedBlockIdx, setCopiedBlockIdx] = useState(null);

  const copyToClipboard = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedBlockIdx(idx);
    setTimeout(() => setCopiedBlockIdx(null), 2000);
  };

  // Split content by code blocks ```lang ... ```
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-3 text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-slate-200">
      {parts.map((part, pIdx) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const lines = part.slice(3, -3).trim().split('\n');
          const language = lines[0].trim().toLowerCase() || 'code';
          const codeBody = lines.slice(1).join('\n') || lines[0];

          return (
            <div
              key={pIdx}
              className="my-3 rounded-lg overflow-hidden border border-slate-700 bg-slate-900 text-slate-100 font-mono text-xs shadow-xs"
            >
              <div className="flex items-center justify-between px-3 py-1.5 bg-slate-800/80 border-b border-slate-700/60 text-[11px] text-slate-400">
                <span className="font-semibold uppercase tracking-wider text-brand-400">
                  {language}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(codeBody, pIdx)}
                  className="flex items-center gap-1 hover:text-white transition px-2 py-0.5 rounded bg-slate-700/50 hover:bg-slate-700"
                >
                  {copiedBlockIdx === pIdx ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3.5 overflow-x-auto text-[12px] leading-normal font-mono scrollbar-thin">
                <code>{codeBody}</code>
              </pre>
            </div>
          );
        }

        // Render Markdown Paragraphs, Headings, Tables & Lists
        const paragraphs = part.split('\n\n');
        return (
          <div key={pIdx} className="space-y-2">
            {paragraphs.map((para, paraIdx) => {
              const trimmed = para.trim();
              if (!trimmed) return null;

              // H1 Heading
              if (trimmed.startsWith('# ')) {
                return (
                  <h1 key={paraIdx} className="text-base sm:text-lg font-bold text-slate-950 dark:text-white pt-2 border-b border-slate-200 dark:border-slate-800 pb-1">
                    {trimmed.replace('# ', '')}
                  </h1>
                );
              }
              // H2 Heading
              if (trimmed.startsWith('## ')) {
                return (
                  <h2 key={paraIdx} className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 pt-1.5 text-brand-700 dark:text-brand-300">
                    {trimmed.replace('## ', '')}
                  </h2>
                );
              }
              // H3 Heading
              if (trimmed.startsWith('### ')) {
                return (
                  <h3 key={paraIdx} className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-200 pt-1">
                    {trimmed.replace('### ', '')}
                  </h3>
                );
              }

              // Markdown Tables
              if (trimmed.includes('|') && trimmed.split('\n').every(l => l.trim().startsWith('|') && l.trim().endsWith('|'))) {
                const rows = trimmed.split('\n').filter(r => !r.includes('---'));
                return (
                  <div key={paraIdx} className="my-2.5 overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700 text-left text-xs">
                      {rows.map((row, rIdx) => {
                        const cols = row.split('|').filter((_, cIdx, arr) => cIdx !== 0 && cIdx !== arr.length - 1);
                        if (rIdx === 0) {
                          return (
                            <thead key={rIdx} className="bg-slate-100 dark:bg-slate-800/80 font-bold text-slate-900 dark:text-slate-100">
                              <tr>
                                {cols.map((col, cIdx) => (
                                  <th key={cIdx} className="px-3 py-2 border-r last:border-r-0 border-slate-200 dark:border-slate-700">
                                    {col.trim()}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                          );
                        }
                        return (
                          <tbody key={rIdx} className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                            <tr>
                              {cols.map((col, cIdx) => (
                                <td key={cIdx} className="px-3 py-1.5 border-r last:border-r-0 border-slate-200 dark:border-slate-700">
                                  {col.trim()}
                                </td>
                              ))}
                            </tr>
                          </tbody>
                        );
                      })}
                    </table>
                  </div>
                );
              }

              // Bullet List
              if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                const items = trimmed.split('\n').filter(Boolean);
                return (
                  <ul key={paraIdx} className="list-disc list-outside pl-4 space-y-1 my-1.5">
                    {items.map((it, iIdx) => (
                      <li key={iIdx} className="leading-relaxed">
                        <span dangerouslySetInnerHTML={{
                          __html: it.replace(/^[-*]\s+/, '')
                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                            .replace(/\*(.*?)\*/g, '<em>$1</em>')
                            .replace(/`([^`]+)`/g, '<code class="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-brand-600 dark:text-brand-300 font-mono text-[11px]">$1</code>')
                        }} />
                      </li>
                    ))}
                  </ul>
                );
              }

              // Numbered List
              if (/^\d+\.\s/.test(trimmed)) {
                const items = trimmed.split('\n').filter(Boolean);
                return (
                  <ol key={paraIdx} className="list-decimal list-outside pl-4 space-y-1 my-1.5">
                    {items.map((it, iIdx) => (
                      <li key={iIdx} className="leading-relaxed">
                        <span dangerouslySetInnerHTML={{
                          __html: it.replace(/^\d+\.\s+/, '')
                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                            .replace(/\*(.*?)\*/g, '<em>$1</em>')
                            .replace(/`([^`]+)`/g, '<code class="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-brand-600 dark:text-brand-300 font-mono text-[11px]">$1</code>')
                        }} />
                      </li>
                    ))}
                  </ol>
                );
              }

              // Standard Paragraph with inline bolding & code highlights
              return (
                <p
                  key={paraIdx}
                  className="leading-relaxed whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{
                    __html: trimmed
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\*(.*?)\*/g, '<em>$1</em>')
                      .replace(/`([^`]+)`/g, '<code class="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-brand-600 dark:text-brand-300 font-mono text-[11px]">$1</code>')
                  }}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

const TutorPage = () => {
  const [searchParams] = useSearchParams();
  const initialMaterialId = searchParams.get('materialId') || '';
  const { t } = useTranslation();
  const toast = useToast();

  const [materials, setMaterials] = useState([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState(initialMaterialId);
  const [selectedMode, setSelectedMode] = useState('detailed');
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I am **LearnAI**, your academic study mentor. I can teach Artificial Intelligence, Machine Learning, Deep Learning, Neural Networks, NLP, Computer Vision, Generative AI, Mathematics, Algorithms, and Computer Science.\n\nWhat concept or problem would you like to explore today?',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorStatus, setErrorStatus] = useState(null);
  const messagesEndRef = useRef(null);

  // Dynamic follow-up chips based on tutor mode
  const followUpPrompts = [
    { label: '💡 Give an everyday analogy', prompt: 'Give me a simple real-world analogy to understand this concept better.' },
    { label: '📐 Show formula & derivation', prompt: 'Show the mathematical formulation, explain every variable, and walk through a calculation.' },
    { label: '💻 Show Python code', prompt: 'Write clean Python implementation using modern libraries (NumPy/PyTorch/Scikit-learn) and explain important lines.' },
    { label: '📝 Exam answer format', prompt: 'Format this as a structured university examination answer with definitions, key points, and summary.' },
    { label: '🎯 Quiz me on this', prompt: 'Quiz me on this topic with 3 interactive questions and explanations.' },
    { label: '⚖️ Compare with related concept', prompt: 'Compare this concept side-by-side with its most common alternative in a table.' },
    { label: '🔬 Architecture & Deep Dive', prompt: 'Explain the internal architecture and technical mechanism in deep detail.' },
  ];

  useEffect(() => {
    const fetchInit = async () => {
      try {
        const [materialsRes, sessionsRes] = await Promise.all([
          materialService.getMaterials(),
          aiService.getSessions(),
        ]);

        if (materialsRes.success) setMaterials(materialsRes.data.materials || []);
        if (sessionsRes.success && sessionsRes.data.sessions?.length > 0) {
          setSessions(sessionsRes.data.sessions);
          setActiveSessionId(sessionsRes.data.sessions[0]._id);
          if (sessionsRes.data.sessions[0].messages?.length > 0) {
            setMessages(sessionsRes.data.sessions[0].messages);
          }
        }
      } catch (err) {
        console.error('Failed to initialize AI Tutor sessions:', err);
      }
    };

    fetchInit();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (customPrompt) => {
    const textToSend = customPrompt || inputMessage;
    if (!textToSend.trim()) return;

    setErrorStatus(null);
    const userMsg = { role: 'user', content: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInputMessage('');
    setLoading(true);

    try {
      const res = await aiService.chat({
        message: textToSend,
        materialId: selectedMaterialId || null,
        sessionId: activeSessionId || null,
        mode: selectedMode,
      });

      if (res.success && res.data) {
        const assistantMsg = {
          role: 'assistant',
          content: res.data.reply,
        };
        setMessages((prev) => [...prev, assistantMsg]);
        if (res.data.sessionId) {
          setActiveSessionId(res.data.sessionId);
        }
      } else {
        const errMsg = res.message || 'AI service is temporarily unavailable. Please try again.';
        setErrorStatus(errMsg);
        toast.error(errMsg);
      }
    } catch (err) {
      console.error('AI Tutor communication error:', err);
      const errMsg = err.response?.data?.message || 'AI service is temporarily unavailable. Please try again.';
      setErrorStatus(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleNewSession = () => {
    setActiveSessionId(null);
    setErrorStatus(null);
    setMessages([
      {
        role: 'assistant',
        content: `Started a fresh academic session in **${MODES.find(m => m.id === selectedMode)?.label}** mode! What subject or problem would you like to explore?`,
      },
    ]);
  };

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Academic AI Tutor
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
              AI / ML / DL / Math
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Personalized academic mentorship with multi-mode explanations, mathematics, and live code.
          </p>
        </div>

        {/* Study Context Selector & New Chat */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <select
              value={selectedMaterialId}
              onChange={(e) => setSelectedMaterialId(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500 max-w-[220px] truncate"
            >
              <option value="">No Document Context (General Discussion)</option>
              {materials.map((m) => (
                <option key={m._id} value={m._id}>
                  Context: {m.title}
                </option>
              ))}
            </select>
          </div>

          <Button
            variant="secondary"
            size="sm"
            icon={Plus}
            onClick={handleNewSession}
          >
            New Chat
          </Button>
        </div>
      </div>

      {/* Mode Selector Toolbar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 pt-0.5 scrollbar-thin">
        <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 shrink-0 uppercase tracking-wider px-1">
          Tutor Mode:
        </span>
        {MODES.map((mode) => {
          const Icon = mode.icon;
          const isSelected = selectedMode === mode.id;
          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => setSelectedMode(mode.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition border ${
                isSelected
                  ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
              title={mode.desc}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
              <span>{mode.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Conversation Container */}
      <Card className="p-0 flex flex-col h-[calc(100vh-270px)] min-h-[520px] overflow-hidden">
        {/* Messages Stream */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          {messages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={idx}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-slate-800 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0 border border-brand-200/80 dark:border-slate-700">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-3xl rounded-xl p-4 sm:p-5 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/60 shadow-xs'
                  }`}
                >
                  {isUser ? (
                    <div className="whitespace-pre-wrap font-medium">{msg.content}</div>
                  ) : (
                    <FormattedMessage content={msg.content} />
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 justify-start items-center text-xs text-slate-500">
              <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-slate-800 text-brand-600 flex items-center justify-center shrink-0 border border-brand-200 dark:border-slate-700">
                <Bot className="w-4 h-4 animate-pulse" />
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-brand-500 animate-ping" />
                <span>AI Tutor is formulating academic explanation...</span>
              </div>
            </div>
          )}

          {errorStatus && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorStatus}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Dynamic Action Chips & Input Area */}
        <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2.5">
          {/* Smart Follow-Up Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[11px] text-slate-400 font-medium shrink-0 flex items-center gap-1">
              <Lightbulb className="w-3 h-3 text-amber-500" />
              Smart Actions:
            </span>
            {followUpPrompts.map((item, pIdx) => (
              <button
                key={pIdx}
                type="button"
                onClick={() => handleSendMessage(item.prompt)}
                className="px-2.5 py-1 rounded-md bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[11px] font-medium whitespace-nowrap transition"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Form Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask anything (e.g. 'Explain backpropagation with matrix calculus', 'How does Attention work in Transformers?')..."
              className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:bg-white dark:focus:bg-slate-900"
            />
            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={Send}
              disabled={!inputMessage.trim() || loading}
            >
              Send
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default TutorPage;
