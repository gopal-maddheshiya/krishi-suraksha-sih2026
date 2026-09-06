import React, { useState, useRef, useCallback } from 'react';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';

interface SpeakerButtonProps {
  text: string;
  className?: string;
  iconSize?: number;
}

// Strip markdown bold (**text**) and emoji for cleaner speech
function cleanTextForSpeech(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')   // **bold** → bold
    .replace(/\*(.*?)\*/g, '$1')        // *italic* → italic
    .replace(/#{1,6}\s/g, '')           // ## heading → heading
    .replace(/🌾|🌱|⚠️|✓|📍|💊|🛡️|🧪|🏢|⚗️|🔔|🎙️|📞|🌧️|💨|☀️|🌡️/g, '') // emojis
    .replace(/\n{3,}/g, '\n\n')         // Reduce excess newlines
    .trim();
}

// Map app language to BCP 47 for SpeechSynthesis
function getSpeechLang(lang: string): string {
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

export default function SpeakerButton({ text, className = '', iconSize = 14 }: SpeakerButtonProps) {
  const { lang } = useLang();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const handleSpeak = useCallback(() => {
    if (!isSupported) return;

    // If currently speaking — stop
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsLoading(false);
      return;
    }

    // Cancel any previous speech
    window.speechSynthesis.cancel();

    const cleanText = cleanTextForSpeech(text);
    if (!cleanText) return;

    setIsLoading(true);

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = getSpeechLang(lang);
    utterance.rate = 0.92;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Try to pick a voice matching the language
    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find(
      (v) => v.lang.startsWith(utterance.lang.split('-')[0]) && v.localService
    ) || voices.find(
      (v) => v.lang.startsWith(utterance.lang.split('-')[0])
    );
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onstart = () => {
      setIsLoading(false);
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsLoading(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsLoading(false);
    };

    utteranceRef.current = utterance;

    // Chrome bug workaround: voices may not load immediately
    const trySpeak = () => {
      window.speechSynthesis.speak(utterance);
    };

    if (voices.length === 0) {
      window.speechSynthesis.addEventListener('voiceschanged', trySpeak, { once: true });
    } else {
      trySpeak();
    }
  }, [text, lang, isSpeaking, isSupported]);

  if (!isSupported) return null;

  const label = isSpeaking
    ? (lang === 'hi' ? 'बंद करें' : lang === 'mr' ? 'थांबवा' : 'Stop')
    : (lang === 'hi' ? 'सुनें' : lang === 'mr' ? 'ऐका' : 'Listen');

  return (
    <button
      type="button"
      onClick={handleSpeak}
      title={label}
      aria-label={label}
      className={`inline-flex items-center justify-center gap-1 p-1.5 rounded-lg border transition-all duration-150 active:scale-90 select-none ${
        isSpeaking
          ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm animate-pulse'
          : 'bg-white/80 hover:bg-emerald-50 text-stone-400 hover:text-emerald-700 border-stone-200 hover:border-emerald-300'
      } ${className}`}
    >
      {isLoading ? (
        <Loader2 style={{ width: iconSize, height: iconSize }} className="animate-spin" />
      ) : isSpeaking ? (
        <VolumeX style={{ width: iconSize, height: iconSize }} className="stroke-[2.2]" />
      ) : (
        <Volume2 style={{ width: iconSize, height: iconSize }} className="stroke-[2.2]" />
      )}
    </button>
  );
}
