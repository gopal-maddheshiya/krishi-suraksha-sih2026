import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';

export interface SpeakerButtonProps {
  text?: string;
  className?: string;
  iconSize?: number;
  showLabel?: boolean;
}

// Strip markdown bold, headings, bullets, and emojis for clean, natural speech
export function cleanTextForSpeech(text?: string): string {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
    .replace(/#{1,6}\s+/g, '')                // headers
    .replace(/\*\*([^*]+)\*\*/g, '$1')        // **bold**
    .replace(/\*([^*]+)\*/g, '$1')           // *italic*
    .replace(/_([^_]+)_/g, '$1')             // _italic_
    .replace(/`([^`]+)`/g, '$1')             // code
    .replace(/^\s*[-•*]\s+/gm, '')           // bullet points
    .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '') // all emojis
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Map app language to BCP 47 for SpeechSynthesis
export function getSpeechLang(lang: string): string {
  const map: Record<string, string> = {
    hi: 'hi-IN',
    mr: 'mr-IN',
    te: 'te-IN',
    ta: 'ta-IN',
    gu: 'gu-IN',
    pa: 'pa-IN',
    bn: 'bn-IN',
    en: 'en-IN',
  };
  return map[lang] || 'hi-IN';
}

/**
 * Global cancel speech
 */
export function stopSpeech(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
    window.dispatchEvent(new CustomEvent('crophealth-speaking-change', { detail: { text: '', isSpeaking: false } }));
  }
}

/**
 * Universal Speak Message function
 */
export function speakMessage(
  text: string,
  lang: string,
  onStart?: () => void,
  onEnd?: () => void
): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false;

  stopSpeech();

  const clean = cleanTextForSpeech(text);
  if (!clean) return false;

  const utterance = new SpeechSynthesisUtterance(clean);
  const speechLang = getSpeechLang(lang);
  utterance.lang = speechLang;
  utterance.rate = 0.94;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  const voices = window.speechSynthesis.getVoices();
  const baseLang = speechLang.split('-')[0];
  const matchingVoice = voices.find(
    (v) => v.lang.startsWith(baseLang) && (v as any).localService
  ) || voices.find(
    (v) => v.lang.startsWith(baseLang)
  );
  if (matchingVoice) {
    utterance.voice = matchingVoice;
  }

  utterance.onstart = () => {
    window.dispatchEvent(new CustomEvent('crophealth-speaking-change', { detail: { text, isSpeaking: true } }));
    onStart?.();
  };

  const finish = () => {
    window.dispatchEvent(new CustomEvent('crophealth-speaking-change', { detail: { text, isSpeaking: false } }));
    onEnd?.();
  };

  utterance.onend = finish;
  utterance.onerror = finish;

  const trySpeak = () => {
    try {
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('SpeechSynthesis failed to speak:', e);
      finish();
    }
  };

  if (voices.length === 0) {
    window.speechSynthesis.addEventListener('voiceschanged', trySpeak, { once: true });
  } else {
    trySpeak();
  }

  return true;
}

export default function SpeakerButton({ 
  text, 
  className = '', 
  iconSize = 14,
  showLabel = false,
}: SpeakerButtonProps) {
  const { lang } = useLang();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // Listen to global speech state
  useEffect(() => {
    const handleSpeakingChange = (e: any) => {
      const detail = e.detail;
      if (detail && detail.text === text) {
        setIsSpeaking(detail.isSpeaking);
      } else if (detail && detail.isSpeaking) {
        setIsSpeaking(false);
      } else if (detail && !detail.isSpeaking) {
        setIsSpeaking(false);
      }
    };
    window.addEventListener('crophealth-speaking-change', handleSpeakingChange);
    return () => window.removeEventListener('crophealth-speaking-change', handleSpeakingChange);
  }, [text]);

  const handleSpeak = useCallback(() => {
    if (!isSupported) return;

    // If currently speaking — stop
    if (isSpeaking || (window.speechSynthesis && window.speechSynthesis.speaking)) {
      stopSpeech();
      setIsSpeaking(false);
      return;
    }

    speakMessage(text, lang, () => setIsSpeaking(true), () => setIsSpeaking(false));
  }, [text, lang, isSpeaking, isSupported]);

  if (!text || !isSupported) return null;

  const buttonLabel = isSpeaking
    ? (lang === 'hi' ? 'आवाज़ रोकें' : lang === 'mr' ? 'थांबवा' : 'Stop')
    : (lang === 'hi' ? 'बोलकर सुनें' : lang === 'mr' ? 'ऐका' : 'Listen');

  return (
    <button
      type="button"
      onClick={handleSpeak}
      title={buttonLabel}
      aria-label={buttonLabel}
      className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all duration-150 active:scale-95 select-none font-bold text-[11px] ${
        isSpeaking
          ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm animate-pulse ring-2 ring-emerald-400/40'
          : 'bg-stone-50 hover:bg-emerald-50 text-stone-600 hover:text-emerald-800 border-stone-200 hover:border-emerald-300 shadow-2xs'
      } ${className}`}
    >
      {isSpeaking ? (
        <VolumeX style={{ width: iconSize, height: iconSize }} className="stroke-[2.2]" />
      ) : (
        <Volume2 style={{ width: iconSize, height: iconSize }} className="stroke-[2.2] text-emerald-700" />
      )}
      {showLabel && <span>{buttonLabel}</span>}
    </button>
  );
}
