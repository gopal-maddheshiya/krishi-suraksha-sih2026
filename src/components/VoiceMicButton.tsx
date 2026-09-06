import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';

interface VoiceMicButtonProps {
  /** Callback when speech is recognized */
  onTranscript: (transcript: string) => void;
  /** Current text in input (for seamless appending) */
  currentValue?: string;
  /** Custom class overrides for sizing/styling */
  className?: string;
  /** Custom icon size */
  iconSize?: number;
  /** Title / tooltip */
  title?: string;
}

export default function VoiceMicButton({
  onTranscript,
  currentValue = '',
  className = '',
  iconSize = 16,
  title,
}: VoiceMicButtonProps) {
  const { lang } = useLang();
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const feedbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Map app language to BCP 47 speech recognition language code
  const getSpeechLang = useCallback((): string => {
    switch (lang) {
      case 'hi':
        return 'hi-IN'; // Hindi (India)
      case 'mr':
        return 'mr-IN'; // Marathi (India)
      case 'te':
        return 'te-IN'; // Telugu
      case 'ta':
        return 'ta-IN'; // Tamil
      case 'gu':
        return 'gu-IN'; // Gujarati
      case 'pa':
        return 'pa-IN'; // Punjabi
      case 'bn':
        return 'bn-IN'; // Bengali
      case 'en':
        return 'en-IN'; // Indian English
      default:
        return 'hi-IN';
    }
  }, [lang]);

  // Show temporary feedback toast/pill
  const showFeedback = useCallback((msg: string, durationMs = 3500) => {
    setFeedback(msg);
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current = setTimeout(() => setFeedback(null), durationMs);
  }, []);

  // Check Web Speech API support on mount
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current);
      }
    };
  }, []);

  const toggleListening = () => {
    if (!isSupported) {
      showFeedback(
        lang === 'hi'
          ? 'आपके ब्राउज़र में आवाज़ पहचान (Speech) समर्थित नहीं है। Chrome या Edge का उपयोग करें।'
          : 'Speech recognition is not supported in this browser. Please use Chrome or Edge.'
      );
      return;
    }

    // If currently listening, stop
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      setIsListening(false);
      return;
    }

    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = getSpeechLang();

      let finalSpeech = '';
      const baseValue = currentValue.trim();

      recognition.onstart = () => {
        setIsListening(true);
        showFeedback(
          lang === 'hi'
            ? '🎙️ सुन रहे हैं... अपनी फसल की समस्या बोलें'
            : lang === 'mr'
            ? '🎙️ ऐकत आहोत... बोला'
            : '🎙️ Listening... speak now',
          5000
        );
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const trans = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalSpeech += trans;
          } else {
            interim += trans;
          }
        }

        const fullSpoken = (finalSpeech || interim).trim();
        if (fullSpoken) {
          const updated = baseValue ? `${baseValue} ${fullSpoken}` : fullSpoken;
          onTranscript(updated);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);

        if (event.error === 'not-allowed') {
          showFeedback(
            lang === 'hi'
              ? 'कृपया माइक्रोफ़ोन की अनुमति (Microphone Permission) दें।'
              : 'Please allow microphone permission to use voice typing.'
          );
        } else if (event.error === 'no-speech') {
          showFeedback(
            lang === 'hi'
              ? 'कोई आवाज़ नहीं सुनाई दी। कृपया दोबारा बोलें।'
              : 'No voice detected. Please try speaking again.'
          );
        } else if (event.error === 'network') {
          showFeedback(
            lang === 'hi'
              ? 'आवाज़ पहचान के लिए इंटरनेट आवश्यक है।'
              : 'Internet required for speech recognition.'
          );
        } else {
          showFeedback(
            lang === 'hi'
              ? 'आवाज़ पहचान में त्रुटि हुई। कृपया पुनः प्रयास करें।'
              : 'Speech recognition error. Please try again.'
          );
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsListening(false);
      showFeedback(
        lang === 'hi'
          ? 'माइक शुरू नहीं हो सका। कृपया अनुमति जांचें।'
          : 'Could not activate microphone. Check browser permissions.'
      );
    }
  };

  const defaultTitle =
    title ||
    (isListening
      ? lang === 'hi'
        ? 'बोलना बंद करने के लिए क्लिक करें'
        : 'Click to stop listening'
      : lang === 'hi'
      ? 'बोलकर टाइप करें (Voice Typing)'
      : 'Voice typing (Speak to type)');

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={toggleListening}
        className={`p-2.5 rounded-xl border transition-all duration-200 flex items-center justify-center select-none active:scale-95 ${
          isListening
            ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-600/30 animate-pulse ring-2 ring-rose-400/50'
            : 'bg-white hover:bg-emerald-50 text-stone-600 hover:text-emerald-800 border-stone-200 hover:border-emerald-300'
        } ${className}`}
        title={defaultTitle}
        aria-label={defaultTitle}
      >
        {isListening ? (
          <MicOff style={{ width: iconSize, height: iconSize }} className="animate-spin duration-1000" />
        ) : (
          <Mic style={{ width: iconSize, height: iconSize }} className="stroke-[2.2]" />
        )}
      </button>

      {/* Floating Status Notification Pill */}
      {feedback && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50 whitespace-nowrap px-3 py-1.5 rounded-xl bg-stone-900/95 backdrop-blur-md text-white text-[11px] font-bold shadow-xl border border-stone-700/60 flex items-center gap-1.5 animate-in fade-in slide-in-from-bottom-2 duration-150 pointer-events-none">
          {isListening ? (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          )}
          <span>{feedback}</span>
        </div>
      )}
    </div>
  );
}
