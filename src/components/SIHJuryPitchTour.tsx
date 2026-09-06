import { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, X, Play, Pause, ChevronRight, ChevronLeft, 
  Zap, Volume2, Mic, CloudRain, Store, Compass, Bug, Users, Wifi
} from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';

interface SIHJuryPitchTourProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToSection: (section: string, skipScroll?: boolean) => void;
}

export default function SIHJuryPitchTour({ isOpen, onClose, onNavigateToSection }: SIHJuryPitchTourProps) {
  const { lang } = useLang();
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0); // 0 to 100%
  const [typedText, setTypedText] = useState('');

  // 1 MINUTE (60 SECONDS) TOTAL DURATION
  // 8 fast-paced, high-voltage steps * 7.5s each = 60s total
  const STEP_DURATION_MS = 7500; 
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Helper to ensure NO modal or popup ever blocks the screen during the live tour
  const closeAllPopups = () => {
    window.dispatchEvent(new CustomEvent('close-sample-scan-demo'));
    window.dispatchEvent(new CustomEvent('close-pmfby-claim'));
    window.dispatchEvent(new CustomEvent('close-crop-emergency'));
  };

  const steps = [
    {
      id: 'step_voice',
      stepNumber: 1,
      tag: 'Voice AI',
      title: lang === 'hi' ? '1. 1-क्लिक बोलकर पूछें (Voice AI)' : '1. 1-Tap Multilingual Voice AI',
      speakerNoteHi: 'ग्रामीण किसान बिना टाइप किए सिर्फ एक क्लिक में अपनी बोली में बोलकर फसल के रोग व मौसम समाधान की सलाह सीधे पूछता है।',
      speakerNoteEn: 'Rural farmers speak in their native dialect without typing to immediately resolve crop diseases and farm queries.',
      spotlightTarget: '#tour-voice-btn',
      spotlightLabel: lang === 'hi' ? '👉 🎙️ बोलकर पूछें — यहाँ क्लिक करके अपनी भाषा में बोलें' : '👉 1-Tap Voice AI — Speak query in your dialect',
      execute: () => {
        closeAllPopups();
        onNavigateToSection('home');
        window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      }
    },
    {
      id: 'step_weather',
      stepNumber: 2,
      tag: 'Weather & Spray Safety',
      title: lang === 'hi' ? '2. मौसम जोखिम व सुरक्षित स्प्रे विंडो (Weather AI)' : '2. Weather Risk & Micro-Climate Spray Safety Window',
      speakerNoteHi: 'रीयल-टाइम मौसम इंजन हवा की गति, नमी व बारिश का सटीक विश्लेषण कर किसान को आज कीटनाशक स्प्रे करने का 100% सुरक्षित समय बताता है।',
      speakerNoteEn: 'Hyperlocal weather engine analyzes wind drift, humidity & rainfall to prescribe the exact safe hourly chemical spray window.',
      spotlightTarget: '#tour-weather-spray-card',
      spotlightLabel: lang === 'hi' ? '👉 🌦️ आज का मौसम व सुरक्षित स्प्रे विंडो — हवा, बारिश व सही समय' : '👉 Weather Risk & Safe Spray Timing Window',
      execute: () => {
        closeAllPopups();
        onNavigateToSection('weather');
        window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      }
    },
    {
      id: 'step_vision_scan',
      stepNumber: 3,
      tag: 'Gemini Vision AI',
      title: lang === 'hi' ? '3. लाइव जेमिनी 1.5 विज़न AI स्कैन व ICAR पर्चा' : '3. Live Gemini Vision AI Scan & ICAR Advisory',
      speakerNoteHi: 'जज महोदय, देखिए किसान की पत्ती अपलोड होते ही जेमिनी AI तुरंत कवक घाव स्कैन करके 96% सटीकता से ICAR दवा व खुराक का पर्चा तैयार कर देता है।',
      speakerNoteEn: 'Watch Gemini AI analyze the crop leaf with live laser scanning, detecting fungal lesions with 96% accuracy and ICAR dosages.',
      spotlightTarget: '#tour-icar-prescription',
      spotlightLabel: lang === 'hi' ? '👉 ⚡ जेमिनी 1.5 विज़न AI — पत्तियों पर लाइव घाव स्कैन व ICAR पर्चा' : '👉 Gemini 1.5 Pro Vision — Real-time leaf scan & ICAR prescription',
      execute: () => {
        closeAllPopups();
        onNavigateToSection('home', true);
        window.dispatchEvent(new CustomEvent('crophealth-tour-simulate-scan'));
        const scrollTarget = () => {
          const el = document.getElementById('tour-icar-prescription') || document.getElementById('tour-diagnosis-result') || document.getElementById('scanner-section');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        };
        setTimeout(scrollTarget, 80);
        setTimeout(scrollTarget, 260);
      }
    },
    {
      id: 'step_pmfby',
      stepNumber: 4,
      tag: 'PMFBY Insurance',
      title: lang === 'hi' ? '4. PM फसल बीमा योजना (PMFBY 72h सरकारी क्लेम)' : '4. PM Fasal Bima (PMFBY) 72h Insurance Link',
      speakerNoteHi: 'पर्चे में गंभीर नुकसान पाए जाने पर यह सीधे PM फसल बीमा योजना में 72 घंटे के भीतर टोल-फ्री 14447 पर क्लेम दर्ज करने की सुविधा देता है।',
      speakerNoteEn: 'On severe crop loss (>50%), our platform directly initiates official PM Fasal Bima (PMFBY) 72-hour insurance claims via 14447.',
      spotlightTarget: '#tour-pmfby-card',
      spotlightLabel: lang === 'hi' ? '👉 🛡️ PM फसल बीमा योजना (PMFBY 72h सरकारी क्लेम — 14447)' : '👉 PM Fasal Bima (PMFBY) 72h Official Claim Card',
      execute: () => {
        closeAllPopups();
        onNavigateToSection('home', true);
        window.dispatchEvent(new CustomEvent('crophealth-tour-simulate-scan'));
        const scrollTarget = () => {
          const el = document.getElementById('tour-pmfby-card') || document.getElementById('tour-icar-prescription') || document.getElementById('scanner-section');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        };
        setTimeout(scrollTarget, 80);
        setTimeout(scrollTarget, 260);
      }
    },
    {
      id: 'step_agro_store',
      stepNumber: 5,
      tag: 'Agro Store Locator',
      title: lang === 'hi' ? '5. प्रमाणित खाद-बीज दुकानें व PMKSK केंद्र' : '5. Certified Agro Stores & PMKSK Centers',
      speakerNoteHi: 'पर्चा मिलते ही किसान को भटकना नहीं पड़ता—वह अपने नजदीकी प्रमाणित IFFCO व PM किसान समृद्धि केंद्र (PMKSK) दुकानों का नक्शा व फोन देखता है।',
      speakerNoteEn: 'Farmers immediately locate verified pesticide dealers, IFFCO outlets, and government PMKSK centers on an interactive map.',
      spotlightTarget: '#medical-map-header',
      spotlightLabel: lang === 'hi' ? '👉 🏪 प्रमाणित IFFCO व PMKSK केंद्र मैप व फोन नंबर' : '👉 Verified IFFCO & PMKSK Centers Locator Map',
      execute: () => {
        closeAllPopups();
        onNavigateToSection('medical-map');
        window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      }
    },
    {
      id: 'step_gis_heatmap',
      stepNumber: 6,
      tag: 'Satellite GIS',
      title: lang === 'hi' ? '6. सैटेलाइट GIS हीटमैप व 5km कम्युनिटी रडार' : '6. Satellite GIS Heatmap & 5km Community Radar',
      speakerNoteHi: 'हम सिर्फ बीमारी का इलाज नहीं करते, सैटेलाइट GIS हीटमैप से महामारी फैलने से पहले पूरे इलाके के पड़ोसी किसानों को 5 किमी रडार पर ऑटो-अलर्ट मिलता है।',
      speakerNoteEn: 'Satellite GIS heatmaps and 5km community radars predict regional outbreak vectors before pests spread to adjacent farm plots.',
      spotlightTarget: '#hotspots',
      spotlightLabel: lang === 'hi' ? '👉 🛰️ सैटेलाइट GIS हीटमैप व 5km कम्युनिटी आउटब्रेक रडार' : '👉 Satellite GIS Heatmap & 5km Community Outbreak Radar',
      execute: () => {
        closeAllPopups();
        onNavigateToSection('hotspots');
        window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      }
    },
    {
      id: 'step_iot_traps',
      stepNumber: 7,
      tag: 'IoT Pest Traps',
      title: lang === 'hi' ? '7. स्मार्ट IoT फेरोमोन कीट ट्रैप मॉनिटरिंग' : '7. Smart IoT Pheromone Pest Trap Telemetry',
      speakerNoteHi: 'स्मार्ट IoT फेरोमोन ट्रैप से खेत में कीटों की संख्या की ऑटोमैटिक रीयल-टाइम गिनती होती है जिससे शुरुआती अवस्था में ही रोकथाम हो जाती है।',
      speakerNoteEn: 'Smart IoT pheromone traps automatically count nocturnal insect activity, alerting agronomists at earliest economic threshold.',
      spotlightTarget: '#pest',
      spotlightLabel: lang === 'hi' ? '👉 🪤 स्मार्ट IoT फेरोमोन कीट ट्रैप — रीयल-टाइम कीट गिनती' : '👉 Smart IoT Pheromone Pest Traps — Real-Time Insect Telemetry',
      execute: () => {
        closeAllPopups();
        onNavigateToSection('pest');
        window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      }
    },
    {
      id: 'step_expert_offline',
      stepNumber: 8,
      tag: 'KVK Portal & Offline',
      title: lang === 'hi' ? '8. KVK वैज्ञानिक सत्यापन पोर्टल व 100% ऑफलाइन' : '8. KVK Agronomist Validation & 100% Offline',
      speakerNoteHi: 'संदेहास्पद केस सीधे KVK वैज्ञानिकों के पास जाते हैं, और सबसे खास बात—यह खेत में बिना इंटरनेट के भी 100% ऑफलाइन काम करता है!',
      speakerNoteEn: 'Low confidence scans auto-escalate to human KVK agronomists. Best of all, it works 100% offline in rural zero-connectivity fields!',
      spotlightTarget: '#expert',
      spotlightLabel: lang === 'hi' ? '👉 🔬 KVK कृषि वैज्ञानिक सत्यापन पोर्टल व 100% ऑफलाइन' : '👉 KVK Agronomist Verification Portal & 100% Offline Mode',
      execute: () => {
        closeAllPopups();
        onNavigateToSection('expert');
        window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      }
    }
  ];

  const currentData = steps[currentStep];

  // Dynamic Spotlight Rectangle Tracking & Highlight Active Class
  const [spotlightRect, setSpotlightRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setSpotlightRect(null);
      document.querySelectorAll('.tour-spotlight-active').forEach((el) => {
        el.classList.remove('tour-spotlight-active');
      });
      return;
    }

    const updateSpotlight = () => {
      document.querySelectorAll('.tour-spotlight-active').forEach((el) => {
        el.classList.remove('tour-spotlight-active');
      });

      const selector = currentData.spotlightTarget;
      if (!selector) {
        setSpotlightRect(null);
        return;
      }

      const el = document.querySelector(selector);
      if (el) {
        el.classList.add('tour-spotlight-active');
        const r = el.getBoundingClientRect();
        setSpotlightRect({
          top: r.top,
          left: r.left,
          width: r.width,
          height: r.height,
        });
      } else {
        setSpotlightRect(null);
      }
    };

    updateSpotlight();
    const t = setTimeout(updateSpotlight, 200);

    window.addEventListener('scroll', updateSpotlight, { passive: true });
    window.addEventListener('resize', updateSpotlight);

    // Track position during animations/transitions for pixel-perfect lock
    let frameCount = 0;
    let rafId: number;
    const pollPosition = () => {
      updateSpotlight();
      frameCount++;
      if (frameCount < 50) {
        rafId = requestAnimationFrame(pollPosition);
      }
    };
    rafId = requestAnimationFrame(pollPosition);

    return () => {
      clearTimeout(t);
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', updateSpotlight);
      window.removeEventListener('resize', updateSpotlight);
      document.querySelectorAll('.tour-spotlight-active').forEach((el) => {
        el.classList.remove('tour-spotlight-active');
      });
    };
  }, [isOpen, currentStep, currentData.spotlightTarget]);

  // Execute the physical website movement on step change
  useEffect(() => {
    if (!isOpen) return;
    currentData.execute();
  }, [isOpen, currentStep]);

  // Clean popups on mount and unmount
  useEffect(() => {
    if (isOpen) {
      closeAllPopups();
    }
    return () => {
      closeAllPopups();
    };
  }, [isOpen]);

  // Typewriter Effect for the speaker prompt
  useEffect(() => {
    if (!isOpen) return;
    setTypedText('');
    const fullText = lang === 'hi' ? currentData.speakerNoteHi : currentData.speakerNoteEn;
    let charIdx = 0;
    const speedMs = 18; // smooth, rapid typing (18ms per character)

    const typeTimer = setInterval(() => {
      if (charIdx <= fullText.length) {
        setTypedText(fullText.slice(0, charIdx));
        charIdx++;
      } else {
        clearInterval(typeTimer);
      }
    }, speedMs);

    return () => clearInterval(typeTimer);
  }, [isOpen, currentStep, lang]);

  // Master 60-Second Timer (7.5s per step * 8 steps = 60s)
  useEffect(() => {
    if (!isOpen || !isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const intervalMs = 100;
    const increment = (intervalMs / STEP_DURATION_MS) * 100;

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev + increment >= 100) {
          setCurrentStep((s) => {
            if (s + 1 >= steps.length) {
              setIsPlaying(false);
              return s;
            }
            return s + 1;
          });
          return 0;
        }
        return prev + increment;
      });
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, isPlaying, currentStep]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === 'ArrowLeft') {
        goToPrev();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      } else if (e.key === 'Escape') {
        handleEndTour();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStep]);

  const goToNext = () => {
    setProgress(0);
    if (currentStep + 1 < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsPlaying(false);
    }
  };

  const goToPrev = () => {
    setProgress(0);
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleEndTour = () => {
    closeAllPopups();
    onClose();
  };

  if (!isOpen) return null;

  const totalSecondsElapsed = Math.min(60, Math.round((currentStep * 7.5) + ((progress / 100) * 7.5)));

  return (
    <>
      {/* 0. DYNAMIC CRISP RUBY RED ROUNDED BORDER HIGHLIGHTER */}
      {spotlightRect && (
        <div 
          className="fixed pointer-events-none z-40 transition-all duration-300 ease-out"
          style={{
            top: spotlightRect.top - 6,
            left: spotlightRect.left - 6,
            width: spotlightRect.width + 12,
            height: spotlightRect.height + 12,
            borderRadius: spotlightRect.height < 60 ? '9999px' : '1.5rem',
            border: '3.5px solid #dc2626',
            boxShadow: '0 0 0 3px rgba(220, 38, 38, 0.35), 0 0 30px rgba(220, 38, 38, 0.6), inset 0 0 15px rgba(220, 38, 38, 0.08)',
          }}
        >
          {/* Subtle elegant pulsing aura */}
          <div 
            className="absolute inset-0 rounded-[inherit] border-2 border-rose-400 opacity-60 animate-ping pointer-events-none"
            style={{ animationDuration: '3s' }}
          />
        </div>
      )}

      {/* 1. DYNAMIC ANIMATED POINTER BEACON (Points Directly to Current Feature) */}
      {spotlightRect && (
        <div 
          className="fixed z-50 pointer-events-none transition-all duration-300 ease-out animate-in fade-in"
          style={{
            top: Math.max(68, Math.min(window.innerHeight - 130, spotlightRect.top - 42)),
            left: Math.max(160, Math.min(window.innerWidth - 160, spotlightRect.left + (spotlightRect.width / 2))),
            transform: 'translateX(-50%)',
          }}
        >
          <div className="bg-rose-600 text-white px-3.5 py-1.5 rounded-full text-xs font-black shadow-[0_4px_25px_rgba(225,29,72,0.85)] flex items-center gap-2 border-2 border-white animate-bounce whitespace-nowrap">
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping flex-shrink-0" />
            <span>{currentData.spotlightLabel}</span>
          </div>
        </div>
      )}

      {/* 2. COMPACT FLOATING TOUR DIRECTOR HUD */}
      <div className="fixed bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 z-50 w-[96%] max-w-5xl animate-in slide-in-from-bottom-3 duration-200 pointer-events-auto select-none">
      
      <div className="bg-stone-950/95 backdrop-blur-2xl text-white rounded-2xl sm:rounded-3xl border border-emerald-500/50 shadow-[0_8px_32px_rgba(0,0,0,0.7),0_0_25px_rgba(16,185,129,0.25)] overflow-hidden">
        
        {/* ROW 1: COMPACT COMMAND BAR (Height ~40px only) */}
        <div className="px-3 sm:px-4 py-2 flex items-center justify-between gap-2 sm:gap-4 border-b border-white/10 bg-stone-900/60">
          
          {/* Badge & Timer */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] font-black uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>SIH 1-Min Tour</span>
            </div>
            
            <div className="font-mono text-xs font-black text-amber-300 bg-black/60 px-2 py-0.5 rounded-md border border-white/10">
              ⏱️ 00:{totalSecondsElapsed < 10 ? `0${totalSecondsElapsed}` : totalSecondsElapsed} / 01:00m
            </div>
          </div>

          {/* Current Active Feature Badge (Only 1 dynamic badge shown at any time!) */}
          <div className="flex-1 min-w-0 flex items-center justify-center px-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-xs font-black shadow-inner truncate max-w-lg">
              <span className="text-[9px] bg-emerald-500 text-stone-950 font-black px-1.5 py-0.2 rounded uppercase flex-shrink-0">
                स्टेप {currentStep + 1}/8
              </span>
              <span className="truncate">{currentData.title}</span>
            </div>
          </div>

          {/* Player Controls (Play, Prev, Next, Exit) */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1.5 px-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all text-xs font-bold flex items-center gap-1 cursor-pointer"
              title="Spacebar to Pause/Play"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 text-amber-300" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
              <span className="hidden sm:inline text-[11px]">{isPlaying ? 'Pause' : 'Play'}</span>
            </button>

            <button
              type="button"
              onClick={goToPrev}
              disabled={currentStep === 0}
              className="p-1.5 px-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:pointer-events-none text-white transition-all cursor-pointer"
              title="Previous (Left Arrow)"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={goToNext}
              disabled={currentStep === steps.length - 1}
              className="p-1.5 px-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:pointer-events-none text-white transition-all cursor-pointer"
              title="Next (Right Arrow)"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleEndTour}
              className="p-1.5 px-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 transition-all text-xs font-bold flex items-center gap-1 ml-0.5 cursor-pointer"
              title="Exit Tour (Escape)"
            >
              <X className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Exit</span>
            </button>
          </div>

        </div>

        {/* 1-PIXEL CONTINUOUS PROGRESS TRACKER */}
        <div className="w-full bg-white/10 h-1 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 transition-all duration-100 shadow-[0_0_8px_#34d399]"
            style={{ width: `${((currentStep + (progress / 100)) / steps.length) * 100}%` }}
          />
        </div>

        {/* ROW 2: SLIM INLINE TYPEWRITER SPEECH PROMPTER (Minimal Height) */}
        <div className="px-3 sm:px-4 py-2 flex items-center gap-2.5 text-xs">
          <div className="w-5 h-5 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
            <Volume2 className="w-3.5 h-3.5 animate-pulse" />
          </div>

          <div className="min-w-0 flex-1 flex items-baseline gap-1.5 overflow-hidden">
            <span className="text-[10px] font-black uppercase text-amber-300 flex-shrink-0">
              🎤 बोलें:
            </span>
            
            {/* Live Typewriter Output */}
            <div className="text-white font-semibold text-xs sm:text-[13px] leading-snug line-clamp-2 sm:line-clamp-1">
              <span>{typedText}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
);
}
