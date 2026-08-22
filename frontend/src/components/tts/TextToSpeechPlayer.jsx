import React, { useState } from 'react';
import { useTTS } from '../../context/TTSContext';
import { Play, Pause, Square, Volume2, Settings2 } from 'lucide-react';

const TextToSpeechPlayer = ({ text, title = '', compact = false }) => {
  const {
    isPlaying,
    isPaused,
    speak,
    pause,
    resume,
    stop,
    rate,
    setRate,
    voices,
    selectedVoice,
    setSelectedVoice,
    highlightWord,
  } = useTTS();

  const [showSettings, setShowSettings] = useState(false);

  const speedOptions = [0.75, 1, 1.25, 1.5, 2];

  const handlePlayToggle = () => {
    if (isPlaying && !isPaused) {
      pause();
    } else if (isPlaying && isPaused) {
      resume();
    } else {
      speak(text);
    }
  };

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-3 shadow-xs ${compact ? 'max-w-md' : 'w-full'}`}>
      <div className="flex items-center justify-between gap-3">
        {/* Play/Pause/Stop Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePlayToggle}
            className={`p-2 rounded-lg font-medium text-white transition shadow-xs ${
              isPlaying && !isPaused
                ? 'bg-amber-600 hover:bg-amber-700'
                : 'bg-brand-600 hover:bg-brand-700'
            }`}
            title={isPlaying && !isPaused ? 'Pause' : isPaused ? 'Resume' : 'Play audio'}
          >
            {isPlaying && !isPaused ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>

          {(isPlaying || isPaused) && (
            <button
              onClick={stop}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-950/40 text-slate-600 dark:text-slate-400 hover:text-rose-600 transition"
              title="Stop audio"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
            </button>
          )}

          {/* Title & Live Status */}
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <Volume2 className={`w-3.5 h-3.5 ${isPlaying && !isPaused ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}`} />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {title || 'Listen with Text-to-Speech'}
              </span>
            </div>
            {isPlaying && highlightWord && (
              <span className="text-[11px] text-slate-500 truncate max-w-[220px]">
                Reading: <span className="font-semibold text-brand-600 dark:text-brand-400">{highlightWord}</span>
              </span>
            )}
          </div>
        </div>

        {/* Speed Controls & Voice Settings */}
        <div className="flex items-center gap-1.5">
          {/* Quick Speed Pills */}
          <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700">
            {speedOptions.map((s) => (
              <button
                key={s}
                onClick={() => setRate(s)}
                className={`px-2 py-0.5 text-[11px] font-medium rounded-md transition ${
                  rate === s
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition ${
              showSettings ? 'text-brand-600 bg-slate-100 dark:bg-slate-800' : ''
            }`}
            title="Voice Settings"
          >
            <Settings2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Voice Dropdown Drawer */}
      {showSettings && (
        <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-2.5 items-center justify-between text-xs">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-slate-500 text-xs shrink-0">Voice:</span>
            <select
              value={selectedVoice?.name || ''}
              onChange={(e) => {
                const found = voices.find((v) => v.name === e.target.value);
                if (found) setSelectedVoice(found);
              }}
              className="w-full sm:w-60 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500 text-xs"
            >
              {voices.map((v) => (
                <option key={v.name} value={v.name}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>

          <div className="flex sm:hidden items-center gap-1 w-full justify-between">
            <span className="text-slate-500">Speed:</span>
            <div className="flex items-center gap-1">
              {speedOptions.map((s) => (
                <button
                  key={s}
                  onClick={() => setRate(s)}
                  className={`px-1.5 py-0.5 text-[10px] rounded font-medium ${
                    rate === s ? 'bg-brand-600 text-white' : 'text-slate-500'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TextToSpeechPlayer;
