import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useTTS } from '../../context/TTSContext';
import { useToast } from '../../context/ToastContext';
import {
  Settings,
  Globe,
  Headphones,
  Moon,
  Sun,
  Bell,
  Play,
  CheckCircle2
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const SettingsPage = () => {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { voices, selectedVoice, setSelectedVoice, rate, setRate, speak } = useTTS();
  const toast = useToast();

  const [currentLang, setCurrentLang] = useState(i18n.language || 'en');
  const [enableReminders, setEnableReminders] = useState(true);
  const [enableSound, setEnableSound] = useState(true);

  const speedOptions = [0.75, 1, 1.25, 1.5, 2];

  const handleLanguageChange = (lang) => {
    setCurrentLang(lang);
    i18n.changeLanguage(lang);
    localStorage.setItem('learnai_lang', lang);
    toast.success(`Language set to ${lang === 'hi' ? 'Hindi (हिंदी)' : lang === 'gu' ? 'Gujarati (ગુજરાતી)' : 'English'}`);
  };

  const handleTestSpeech = () => {
    let testMsg = 'Hello! This is a preview of your LearnAI text to speech voice setting.';
    if (currentLang === 'hi') {
      testMsg = 'नमस्ते! यह आपकी LearnAI आवाज़ सेटिंग का पूर्वावलोकन है।';
    } else if (currentLang === 'gu') {
      testMsg = 'નમસ્તે! આ તમારા LearnAI અવાજ સેટિંગનું પૂર્વાવલોકન છે.';
    }
    speak(testMsg);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Application Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Customize your study language, text-to-speech audio, and visual appearance
        </p>
      </div>

      <div className="space-y-4">
        {/* 1. Language Preferences */}
        <Card className="p-5 space-y-3">
          <div className="flex items-center gap-2.5">
            <Globe className="w-4 h-4 text-brand-600" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Platform Language</h2>
          </div>
          <p className="text-xs text-slate-500">Choose the language for UI, summaries, and tutoring</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            {[
              { code: 'en', label: 'English', sub: 'Standard English' },
              { code: 'hi', label: 'हिंदी (Hindi)', sub: 'Devanagari script' },
              { code: 'gu', label: 'ગુજરાતી (Gujarati)', sub: 'Gujarati script' },
            ].map((item) => (
              <div
                key={item.code}
                onClick={() => handleLanguageChange(item.code)}
                className={`p-3 rounded-lg border cursor-pointer transition flex items-center justify-between ${
                  currentLang === item.code
                    ? 'border-brand-600 bg-brand-50/50 dark:bg-brand-950/30'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div>
                  <span className="text-xs font-semibold text-slate-900 dark:text-white">{item.label}</span>
                  <p className="text-[11px] text-slate-400">{item.sub}</p>
                </div>
                {currentLang === item.code && <CheckCircle2 className="w-4 h-4 text-brand-600" />}
              </div>
            ))}
          </div>
        </Card>

        {/* 2. Text-to-Speech (TTS) Settings */}
        <Card className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Headphones className="w-4 h-4 text-brand-600" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Text-to-Speech Audio</h2>
            </div>

            <Button
              variant="secondary"
              size="sm"
              icon={Play}
              onClick={handleTestSpeech}
            >
              Test Voice
            </Button>
          </div>
          <p className="text-xs text-slate-500">Configure Web Speech API synthesizer voice and default speed</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Voice Synthesizer
              </label>
              <select
                value={selectedVoice?.name || ''}
                onChange={(e) => {
                  const found = voices.find((v) => v.name === e.target.value);
                  if (found) setSelectedVoice(found);
                }}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-500"
              >
                {voices.map((v) => (
                  <option key={v.name} value={v.name}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Default Reading Speed
              </label>
              <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                {speedOptions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setRate(s)}
                    className={`flex-1 py-1 text-xs font-semibold rounded-md transition ${
                      rate === s
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* 3. Visual Theme & Notifications (2 Cols) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="p-5 space-y-3">
            <div className="flex items-center gap-2.5">
              {theme === 'dark' ? <Moon className="w-4 h-4 text-brand-600" /> : <Sun className="w-4 h-4 text-brand-600" />}
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Appearance</h2>
            </div>
            <p className="text-xs text-slate-500">Toggle light or dark visual theme</p>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Theme: <strong className="capitalize">{theme}</strong>
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={toggleTheme}
              >
                Switch to {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </Button>
            </div>
          </Card>

          <Card className="p-5 space-y-3">
            <div className="flex items-center gap-2.5">
              <Bell className="w-4 h-4 text-brand-600" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Reminders</h2>
            </div>
            <p className="text-xs text-slate-500">Study notifications and habit retention</p>

            <div className="space-y-2">
              <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
                <span className="text-xs text-slate-700 dark:text-slate-300">Daily Study Reminders</span>
                <input
                  type="checkbox"
                  checked={enableReminders}
                  onChange={(e) => setEnableReminders(e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500"
                />
              </label>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
