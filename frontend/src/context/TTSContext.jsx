import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

const TTSContext = createContext(null);

export const TTSProvider = ({ children }) => {
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [rate, setRate] = useState(1); // 0.5, 0.75, 1, 1.25, 1.5, 2
  const [pitch, setPitch] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [highlightWord, setHighlightWord] = useState('');

  const utteranceRef = useRef(null);

  // Load available browser voices
  const populateVoices = useCallback(() => {
    if (!('speechSynthesis' in window)) return;
    const available = window.speechSynthesis.getVoices();
    if (available.length > 0) {
      setVoices(available);
      // Auto-select a nice natural voice if available
      const preferred = available.find(
        (v) => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Premium'))
      ) || available.find((v) => v.lang.startsWith('en')) || available[0];
      
      setSelectedVoice((prev) => prev || preferred);
    }
  }, []);

  useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    populateVoices();
    window.speechSynthesis.onvoiceschanged = populateVoices;

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [populateVoices]);

  // Main speak function
  const speak = useCallback(
    (text, customVoice = null) => {
      if (!('speechSynthesis' in window) || !text || text.trim() === '') return;

      // Cancel ongoing speech
      window.speechSynthesis.cancel();

      // Clean markdown characters for clean speech
      const cleaned = text
        .replace(/[#*_`$~\[\]()]/g, ' ')
        .replace(/https?:\/\/\S+/g, '')
        .replace(/\n+/g, '. ')
        .trim();

      setCurrentText(cleaned);

      const utterance = new SpeechSynthesisUtterance(cleaned);
      utterance.rate = rate;
      utterance.pitch = pitch;

      const voiceToUse = customVoice || selectedVoice;
      if (voiceToUse) {
        utterance.voice = voiceToUse;
      }

      utterance.onstart = () => {
        setIsPlaying(true);
        setIsPaused(false);
      };

      utterance.onpause = () => {
        setIsPaused(true);
      };

      utterance.onresume = () => {
        setIsPaused(false);
      };

      utterance.onend = () => {
        setIsPlaying(false);
        setIsPaused(false);
        setHighlightWord('');
      };

      utterance.onerror = (e) => {
        console.warn('TTS Synthesis Notice:', e.error);
        setIsPlaying(false);
        setIsPaused(false);
      };

      utterance.onboundary = (event) => {
        if (event.name === 'word') {
          const charIndex = event.charIndex;
          const word = cleaned.substring(charIndex, charIndex + 20).split(/\s+/)[0];
          setHighlightWord(word);
        }
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [rate, pitch, selectedVoice]
  );

  const pause = useCallback(() => {
    if ('speechSynthesis' in window && isPlaying && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, [isPlaying, isPaused]);

  const resume = useCallback(() => {
    if ('speechSynthesis' in window && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, [isPaused]);

  const stop = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
      setHighlightWord('');
    }
  }, []);

  return (
    <TTSContext.Provider
      value={{
        voices,
        selectedVoice,
        setSelectedVoice,
        rate,
        setRate,
        pitch,
        setPitch,
        isPlaying,
        isPaused,
        currentText,
        highlightWord,
        speak,
        pause,
        resume,
        stop,
      }}
    >
      {children}
    </TTSContext.Provider>
  );
};

export const useTTS = () => {
  const context = useContext(TTSContext);
  if (!context) {
    throw new Error('useTTS must be used within a TTSProvider');
  }
  return context;
};
