import { useState, useEffect, useRef } from 'react';
import {
  Camera, Droplets, CloudRain, Wind, Thermometer,
  ShieldCheck, ShieldAlert, AlertTriangle, Sprout,
  ChevronRight, MapPin, Sparkles, Sun, CheckCircle2,
  Calendar, Layers, ArrowDown, Activity, Leaf, Eye,
  Mic, Tractor, Plus, Check, ChevronDown, Clock, Shield,
  Volume2
} from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';
import { useFarmContext } from '@/contexts/FarmContext';
import { getLocalizedCropName, getLocalizedStageName, getCommonLabel } from '@/lib/agriLocalization';

type HeroProps = {
  onNavigate: (section: string) => void;
  onOpenOnboarding?: () => void;
};

export default function Hero({ onNavigate, onOpenOnboarding }: HeroProps) {
  const { t, lang } = useLang();
  const { activeFarm, setActiveFarm, weather, risk, latestObservation, currentUser } = useFarmContext();
  const [recentScan, setRecentScan] = useState<any>(null);
  const [farmDropdownOpen, setFarmDropdownOpen] = useState(false);
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState<string | null>(null);

  const farmDropdownRef = useRef<HTMLDivElement>(null);
  const heroCameraInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const feedbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  const loadRecentScan = () => {
    try {
      const cached = localStorage.getItem('crophealth_observations_cache');
      if (cached) {
        const list = JSON.parse(cached);
        if (list && list.length > 0) {
          setRecentScan(list[0]);
          return;
        }
      }
    } catch {}
  };

  useEffect(() => {
    loadRecentScan();

    const handleScanSaved = (e: any) => {
      if (e.detail) {
        setRecentScan(e.detail);
      } else {
        loadRecentScan();
      }
    };

    window.addEventListener('crophealth-scan-saved', handleScanSaved);
    window.addEventListener('storage', loadRecentScan);
    return () => {
      window.removeEventListener('crophealth-scan-saved', handleScanSaved);
      window.removeEventListener('storage', loadRecentScan);
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    };
  }, []);

  // Close farm switcher on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (farmDropdownRef.current && !farmDropdownRef.current.contains(e.target as Node)) {
        setFarmDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Extract Crop Name & Data
  const extractCropName = () => {
    if (recentScan) {
      const text = `${recentScan.diagnoses?.[0]?.disease_id || ''} ${recentScan.description || ''} ${recentScan.farm_crop?.crop?.name || ''}`.toLowerCase();
      if (text.includes('guava') || text.includes('अमरूद') || text.includes('पेरू')) return 'Guava';
      if (text.includes('tomato') || text.includes('टमाटर') || text.includes('टोमॅटो')) return 'Tomato';
      if (text.includes('rice') || text.includes('धान') || text.includes('भात') || text.includes('paddy')) return 'Rice';
      if (text.includes('soybean') || text.includes('सोयाबीन')) return 'Soybean';
      if (text.includes('chilli') || text.includes('मिर्च') || text.includes('मिरची')) return 'Chilli';
      if (text.includes('potato') || text.includes('आलू') || text.includes('बटाटा')) return 'Potato';
      if (text.includes('wheat') || text.includes('गेहूं') || text.includes('गहू')) return 'Wheat';
      if (text.includes('onion') || text.includes('प्याज') || text.includes('कांदा')) return 'Onion';
      if (text.includes('mango') || text.includes('आम')) return 'Mango';
      if (text.includes('cotton') || text.includes('कपास') || text.includes('कापूस')) return 'Cotton';
      if (recentScan.farm_crop?.crop?.name && recentScan.farm_crop.crop.name !== 'Auto-Detect') {
        return recentScan.farm_crop.crop.name;
      }
    }
    return activeFarm?.crop?.name || 'Cotton';
  };

  const rawCropName = extractCropName();
  const cropName = getLocalizedCropName(rawCropName, lang);
  const rawCropStage = recentScan?.farm_crop?.current_stage || activeFarm?.crop?.stage || 'Flowering Stage';
  const cropStage = getLocalizedStageName(rawCropStage, lang);
  const cropVariety = recentScan?.farm_crop?.variety || activeFarm?.crop?.variety || 'Bt Cotton II';
  const farmerName = currentUser?.fullName || (activeFarm as any)?.farmer?.full_name || '';
  const farmName = activeFarm?.farm_name || (lang === 'hi' ? 'मुख्य खेत (प्लॉट 1)' : 'Main Farm (Plot 1)');
  const farmArea = activeFarm?.area_acres || 2.5;
  const district = activeFarm?.district || 'Pune';
  const state = activeFarm?.state || 'Maharashtra';

  // Standard registered farms for fast 1-click switcher
  const defaultFarms = [
    {
      id: 'default_farm',
      farm_name: lang === 'hi' ? 'मुख्य खेत (कपास प्लॉट)' : 'Main Field (Cotton Plot)',
      district: 'Pune',
      state: 'Maharashtra',
      latitude: 18.5204,
      longitude: 73.8567,
      area_acres: 2.5,
      crop: { 
        name: 'Cotton', 
        stage: 'Flowering Stage', 
        variety: 'Bt Cotton II', 
        sowing_date: '2026-06-15' 
      },
    },
    {
      id: 'farm_2',
      farm_name: lang === 'hi' ? 'उत्तर प्लॉट (टमाटर)' : 'North Plot (Tomato)',
      district: 'Nashik',
      state: 'Maharashtra',
      latitude: 19.9975,
      longitude: 73.7898,
      area_acres: 1.5,
      crop: { 
        name: 'Tomato', 
        stage: 'Fruiting Stage', 
        variety: 'Abhinav Hybrid', 
        sowing_date: '2026-07-01' 
      },
    },
    {
      id: 'farm_3',
      farm_name: lang === 'hi' ? 'दक्षिण प्लॉट (सोयाबीन)' : 'South Plot (Soybean)',
      district: 'Nagpur',
      state: 'Maharashtra',
      latitude: 21.1458,
      longitude: 79.0882,
      area_acres: 3.0,
      crop: { 
        name: 'Soybean', 
        stage: 'Pod Formation', 
        variety: 'JS-335', 
        sowing_date: '2026-06-25' 
      },
    },
  ];

  const getCustomFarms = () => {
    try {
      const stored = localStorage.getItem('crophealth_farms_list');
      if (stored) {
        const list = JSON.parse(stored);
        if (Array.isArray(list) && list.length > 0) return list;
      }
    } catch {}
    return [];
  };

  const allFarms = [...getCustomFarms(), ...defaultFarms.filter(df => !getCustomFarms().some((cf: any) => cf.id === df.id))];

  // Resolve Real Photo from Latest Scan or Active Crop
  const getRecentCropImage = () => {
    if (recentScan?.images?.[0]?.storage_path) {
      return recentScan.images[0].storage_path;
    }
    if (latestObservation?.images?.[0]?.storage_path) {
      return latestObservation.images[0].storage_path;
    }
    const cLower = rawCropName.toLowerCase();
    if (cLower.includes('tomato') || cLower.includes('टमाटर') || cLower.includes('टोमॅटो')) return '/images/sample-tomato.jpg';
    if (cLower.includes('rice') || cLower.includes('धान') || cLower.includes('भात')) return '/images/sample-rice.jpg';
    if (cLower.includes('soybean') || cLower.includes('सोयाबीन')) return '/images/sample-soybean.jpg';
    if (cLower.includes('cotton') || cLower.includes('कपास') || cLower.includes('कापूस')) return '/images/sample-cotton.jpg';
    return '/images/sample-cotton.jpg';
  };

  const cropImageUrl = getRecentCropImage();
  const recentDiseaseName = recentScan?.diagnoses?.[0]?.disease_id || recentScan?.description?.split('-')?.[0]?.trim() || getCommonLabel('healthyCrop', lang);

  const hour = new Date().getHours();
  const greeting = hour < 12 
    ? (lang === 'hi' ? 'शुभ प्रभात' : 'Good Morning')
    : hour < 17 
    ? (lang === 'hi' ? 'शुभ दोपहर' : 'Good Afternoon')
    : (lang === 'hi' ? 'शुभ संध्या' : 'Good Evening');

  const temp = weather?.current?.temperatureC != null ? Math.round(weather.current.temperatureC) : 28;
  const humidity = weather?.current?.relativeHumidityPct != null ? Math.round(weather.current.relativeHumidityPct) : 76;
  const rainMm = weather?.current?.precipitationMm != null ? weather.current.precipitationMm : 0;
  const windKph = weather?.current?.windSpeedKmh != null ? Math.round(weather.current.windSpeedKmh) : 11;

  const rainLabel = rainMm === 0 
    ? (lang === 'hi' ? 'वर्षा नहीं (0mm)' : 'No Rain') 
    : rainMm < 2.5 
    ? (lang === 'hi' ? 'हल्की बारिश' : 'Light Rain') 
    : (lang === 'hi' ? 'मध्यम बारिश' : 'Rain Predicted');

  // Health assessment determination
  let healthScore = 94;
  let statusKey = lang === 'hi' ? 'फसल पूर्ण स्वस्थ व सुरक्षित' : 'Crop Healthy & Optimal';
  let statusDetail = lang === 'hi' 
    ? 'वर्तमान में कोई कीट या फफूंद प्रकोप नहीं है। पत्तियां पूर्ण स्वस्थ हैं।' 
    : 'No active fungal or pest stress detected. Photosynthetic vigor is high.';
  let statusTone: 'healthy' | 'attention' | 'urgent' = 'healthy';
  let StatusIcon = ShieldCheck;

  if (recentScan?.status === 'flagged' || recentScan?.priority === 'high' || risk?.riskLevel === 'high') {
    healthScore = 58;
    statusKey = recentScan?.diagnoses?.[0]?.disease_id || (lang === 'hi' ? 'त्वरित उपचार आवश्यक' : 'Action Required');
    statusDetail = lang === 'hi' 
      ? 'फसल में रोग के लक्षण पाए गए हैं। तुरंत सुझाई गई खुराक का छिड़काव करें।' 
      : 'Symptoms observed on leaves. Review IPM advisory & recommended treatment.';
    statusTone = 'urgent';
    StatusIcon = ShieldAlert;
  } else if (risk?.riskLevel === 'moderate') {
    healthScore = 78;
    statusKey = lang === 'hi' ? 'सावधानी बरतें (मध्यम जोखिम)' : 'Moderate Outbreak Risk';
    statusDetail = lang === 'hi' 
      ? 'आसपास के खेतों में मौसम अनुकूल होने से कीट प्रकोप का अंदेशा है।' 
      : 'Humid microclimate favorable for early blight/pest migration.';
    statusTone = 'attention';
    StatusIcon = AlertTriangle;
  }

  // 1-Tap Camera Scan Flow
  const handleTriggerCameraScan = () => {
    // Scroll down to the scanner section
    const el = document.getElementById('scanner-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      onNavigate('report');
    }
    // Directly trigger file / camera input dialog
    heroCameraInputRef.current?.click();
  };

  const handleHeroFileCaptured = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const scanEvent = new CustomEvent<File>('crophealth-direct-scan', { detail: file });
      window.dispatchEvent(scanEvent);

      const el = document.getElementById('scanner-section');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (heroCameraInputRef.current) heroCameraInputRef.current.value = '';
  };

  // 1-TAP DIRECT VOICE MIC ACTIVATION (सीधा माइक शुरू हो)
  const getSpeechLang = () => {
    switch (lang) {
      case 'hi': return 'hi-IN';
      case 'mr': return 'mr-IN';
      case 'te': return 'te-IN';
      case 'ta': return 'ta-IN';
      case 'gu': return 'gu-IN';
      case 'pa': return 'pa-IN';
      case 'bn': return 'bn-IN';
      default: return 'en-IN';
    }
  };

  const handleDirectMicQuery = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Browser doesn't support Web Speech API -> fallback to opening AI assistant
      window.dispatchEvent(new CustomEvent('open-ai-crop-doctor', {
        detail: { voice: true }
      }));
      return;
    }

    // Toggle off if already listening
    if (isVoiceListening) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
      setIsVoiceListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = getSpeechLang();

      let finalTranscript = '';

      recognition.onstart = () => {
        setIsVoiceListening(true);
        setVoiceFeedback(
          lang === 'hi' 
            ? '🎙️ सुन रहे हैं... अपनी फसल की समस्या बोलें' 
            : lang === 'mr' 
            ? '🎙️ ऐकत आहोत... बोला' 
            : '🎙️ Listening... Speak your crop problem'
        );
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const trans = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += trans;
          } else {
            interim += trans;
          }
        }
        const spoken = (finalTranscript || interim).trim();
        if (spoken) {
          setVoiceFeedback(`🗣️ "${spoken}"`);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsVoiceListening(false);
        if (event.error === 'not-allowed') {
          setVoiceFeedback(lang === 'hi' ? 'माइक अनुमति दें' : 'Please allow mic permission');
        } else {
          setVoiceFeedback(lang === 'hi' ? 'आवाज़ पहचान में त्रुटि, पुनः प्रयास करें' : 'Could not hear, please retry');
        }
        if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
        feedbackTimerRef.current = setTimeout(() => setVoiceFeedback(null), 3000);
      };

      recognition.onend = () => {
        setIsVoiceListening(false);
        const spoken = finalTranscript.trim();
        if (spoken) {
          setVoiceFeedback(lang === 'hi' ? '✓ प्रश्न भेजा जा रहा है...' : '✓ Sending query to AI...');
          setTimeout(() => {
            setVoiceFeedback(null);
            // Open AICropDoctor and automatically ask Gemini!
            window.dispatchEvent(new CustomEvent('open-ai-crop-doctor', {
              detail: { query: spoken, autoSend: true, voice: true }
            }));
          }, 500);
        } else {
          if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
          feedbackTimerRef.current = setTimeout(() => setVoiceFeedback(null), 2000);
        }
      };

      recognition.start();
    } catch (err) {
      console.error('Failed to start microphone speech:', err);
      setIsVoiceListening(false);
      window.dispatchEvent(new CustomEvent('open-ai-crop-doctor', {
        detail: { voice: true }
      }));
    }
  };

  const isSafeSpray = humidity < 85 && windKph < 15 && rainMm < 1.0;

  // Dynamic Lifecycle Stages depending on crop
  const getCropStages = (cName: string) => {
    const c = cName.toLowerCase();
    if (c.includes('tomato') || c.includes('टमाटर')) {
      return [
        { label: lang === 'hi' ? '1. पौध/रोपणी' : '1. Transplant', done: true },
        { label: lang === 'hi' ? '2. वानस्पतिक' : '2. Vegetative', done: true },
        { label: lang === 'hi' ? '3. फल विकास' : '3. Fruiting', active: true },
        { label: lang === 'hi' ? '4. तुड़ाई' : '4. Harvest', future: true },
      ];
    }
    if (c.includes('rice') || c.includes('धान') || c.includes('भात')) {
      return [
        { label: lang === 'hi' ? '1. रोपाई' : '1. Nursery', done: true },
        { label: lang === 'hi' ? '2. कल्ले फूटना' : '2. Tillering', done: true },
        { label: lang === 'hi' ? '3. बाली निकलना' : '3. Panicle', active: true },
        { label: lang === 'hi' ? '4. कटाई' : '4. Harvest', future: true },
      ];
    }
    if (c.includes('soybean') || c.includes('सोयाबीन')) {
      return [
        { label: lang === 'hi' ? '1. अंकुरण' : '1. Emergence', done: true },
        { label: lang === 'hi' ? '2. वानस्पतिक' : '2. Vegetative', done: true },
        { label: lang === 'hi' ? '3. फली विकास' : '3. Pod Stage', active: true },
        { label: lang === 'hi' ? '4. कटाई' : '4. Harvest', future: true },
      ];
    }
    // Default / Cotton
    return [
      { label: lang === 'hi' ? '1. बुवाई' : '1. Sowing', done: true },
      { label: lang === 'hi' ? '2. वानस्पतिक' : '2. Vegetative', done: true },
      { label: lang === 'hi' ? '3. फूल व गूलर' : '3. Flowering & Boll', active: true },
      { label: lang === 'hi' ? '4. चुनाई' : '4. Harvest', future: true },
    ];
  };

  const stages = getCropStages(rawCropName);

  return (
    <section 
      aria-label="Farm Overview & Hero Command Center"
      className="relative bg-white/95 backdrop-blur-md rounded-3xl border border-stone-200/90 shadow-sm overflow-hidden"
    >
      {/* Hidden Camera / File Input for 1-Tap Direct Scan */}
      <input
        ref={heroCameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleHeroFileCaptured}
      />

      {/* Organic lighting decorative glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-radial from-emerald-100/40 via-teal-50/20 to-transparent pointer-events-none rounded-full blur-2xl -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-radial from-amber-100/20 via-transparent to-transparent pointer-events-none rounded-full blur-xl -ml-16 -mb-16" />

      <div className="relative p-4 sm:p-6 lg:p-7 space-y-5 sm:space-y-6">

        {/* ============================================================= */}
        {/* 1. TOP UNIFIED COMMAND BAR: GREETING + PLOT SWITCHER          */}
        {/* ============================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
          
          {/* Greeting & Farmer Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-700 to-teal-800 text-white flex items-center justify-center font-bold flex-shrink-0 shadow-2xs">
              <Sprout className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="text-xs font-bold text-stone-500 flex items-center gap-1.5">
                <span>{greeting}, {farmerName || (lang === 'hi' ? 'किसान मित्र' : 'Farmer Friend')}</span>
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="text-sm font-black text-stone-900 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
                <span className="truncate">{district}, {state} • {farmArea} {t('home_acres') || 'Acres'}</span>
              </div>
            </div>
          </div>

          {/* Interactive Plot Switcher Pill */}
          <div className="relative flex-shrink-0" ref={farmDropdownRef}>
            <button
              type="button"
              onClick={() => setFarmDropdownOpen(!farmDropdownOpen)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200/90 text-stone-800 text-xs font-bold transition-all shadow-2xs group"
              aria-haspopup="menu"
              aria-expanded={farmDropdownOpen}
              title="Click to Switch Farm Plot"
            >
              <Tractor className="w-3.5 h-3.5 text-emerald-700" />
              <span className="truncate max-w-[140px] font-black">{farmName}</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                {cropName}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-stone-400 transition-transform duration-200 ${farmDropdownOpen ? 'rotate-180 text-emerald-700' : ''}`} />
            </button>

            {farmDropdownOpen && (
              <div className="absolute right-0 sm:left-auto top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-stone-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-stone-400 border-b border-stone-100 flex items-center justify-between">
                  <span>{lang === 'hi' ? 'पंजीकृत खेत (Plots)' : 'Registered Farm Plots'}</span>
                  <span className="text-emerald-700 font-bold">{allFarms.length}</span>
                </div>
                <div className="py-1 space-y-1 max-h-60 overflow-y-auto">
                  {allFarms.map((farm) => {
                    const isSelected = activeFarm?.id === farm.id;
                    const fCropName = getLocalizedCropName(farm.crop?.name, lang);
                    return (
                      <button
                        key={farm.id}
                        type="button"
                        onClick={() => {
                          setActiveFarm(farm as any);
                          setFarmDropdownOpen(false);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between text-xs ${
                          isSelected 
                            ? 'bg-emerald-50 text-emerald-950 font-bold border border-emerald-200/80' 
                            : 'hover:bg-stone-50 text-stone-800'
                        }`}
                      >
                        <div className="truncate">
                          <div className="font-black truncate">{farm.farm_name}</div>
                          <div className="text-[10.5px] text-stone-500 mt-0.5">🌾 {fCropName} • {farm.area_acres} {t('home_acres') || 'Acres'} ({farm.district})</div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-emerald-700 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {onOpenOnboarding && (
                  <div className="pt-1.5 border-t border-stone-100 mt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setFarmDropdownOpen(false);
                        onOpenOnboarding();
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 text-emerald-900 font-black text-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>{lang === 'hi' ? 'नया खेत जोड़ें' : 'Add New Farm Plot'}</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

        {/* ============================================================= */}
        {/* 2. MAIN GRID: CROP PASSPORT (LEFT) + REAL DIAGNOSTIC (RIGHT)  */}
        {/* ============================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-7 items-center">

          {/* LEFT: Live Health Passport & Actions */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-5">
            
            {/* National AI Shield Header */}
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-900 bg-emerald-100/80 px-3 py-1 rounded-full border border-emerald-200/80 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                <span>{lang === 'hi' ? 'लाइव फसल स्वास्थ्य पासपोर्ट' : 'Live Crop Health Passport'}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
              </div>
              
              <div className="flex items-baseline gap-3 flex-wrap">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-stone-900 tracking-tight leading-none">
                  {cropName}
                </h1>
                <span className="px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 text-xs font-bold border border-stone-200">
                  {cropVariety}
                </span>
              </div>
            </div>

            {/* Phenological Stage Progress Bar (फसल विकास चक्र) */}
            <div className="p-3 rounded-2xl bg-stone-50/90 border border-stone-200/80 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-stone-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-emerald-700" />
                  <span>{lang === 'hi' ? 'विकास अवस्था (Growth Stage)' : 'Growth Stage'}</span>
                </span>
                <span className="text-emerald-800 font-extrabold">{cropStage}</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {stages.map((st, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className={`h-1.5 rounded-full transition-all ${
                      st.done 
                        ? 'bg-emerald-600' 
                        : st.active 
                        ? 'bg-emerald-500 animate-pulse' 
                        : 'bg-stone-200'
                    }`} />
                    <div className={`text-[9.5px] truncate font-bold ${
                      st.active ? 'text-emerald-800 font-black' : 'text-stone-400'
                    }`}>
                      {st.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Crop Health Condition Card */}
            <div 
              role="status" 
              className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
                statusTone === 'urgent' 
                  ? 'bg-rose-50/90 border-rose-200/90 text-rose-950' 
                  : statusTone === 'attention' 
                  ? 'bg-amber-50/90 border-amber-200/90 text-amber-950' 
                  : 'bg-emerald-50/90 border-emerald-200/90 text-emerald-950'
              }`}
            >
              <div className="flex items-start gap-3">
                
                {/* Health Score Ring Badge */}
                <div className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center flex-shrink-0 shadow-2xs font-black text-white ${
                  statusTone === 'urgent' 
                    ? 'bg-rose-600' 
                    : statusTone === 'attention' 
                    ? 'bg-amber-500' 
                    : 'bg-emerald-700'
                }`}>
                  <span className="text-base leading-none">{healthScore}%</span>
                  <span className="text-[8px] uppercase tracking-tighter opacity-90">Health</span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="font-black text-sm sm:text-base flex items-center gap-2">
                    <span className="truncate">{statusKey}</span>
                    <span className="inline-block w-2 h-2 rounded-full bg-current opacity-70 flex-shrink-0" />
                  </div>
                  <p className="text-xs mt-0.5 opacity-90 font-medium leading-relaxed">
                    {statusDetail}
                  </p>
                  <div className="text-[11px] text-stone-500 font-bold mt-1.5 flex items-center gap-2 pt-1.5 border-t border-black/5 flex-wrap">
                    <span>🌱 NDVI: 0.74 (सशक्त बायोमास)</span>
                    <span>•</span>
                    <span>💧 नमी: 34% (संतोषजनक)</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Interactive Primary Action Buttons */}
            <div className="relative flex items-center gap-3 flex-wrap pt-1">
              
              {/* Primary: Direct Camera / Scanner Scan */}
              <button
                type="button"
                onClick={handleTriggerCameraScan}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-800 via-emerald-800 to-teal-900 hover:from-emerald-900 hover:to-teal-950 text-white font-black text-sm sm:text-base shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2.5 active:scale-[0.98] ring-4 ring-emerald-600/20 group"
              >
                <Camera className="w-5 h-5 stroke-[2.4] group-hover:scale-110 transition-transform" />
                <span>{lang === 'hi' ? 'फसल जांचें (AI Doctor)' : 'Scan Crop (AI Doctor)'}</span>
                <ArrowDown className="w-4 h-4 opacity-70 group-hover:translate-y-0.5 transition-transform" />
              </button>

              {/* Secondary: 1-Tap DIRECT Mic Speech-to-Text Button (सीधा माइक ओपन) */}
              <div className="relative">
                <button
                  type="button"
                  onClick={handleDirectMicQuery}
                  className={`px-4 py-3.5 rounded-2xl border font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2.5 active:scale-[0.98] select-none ${
                    isVoiceListening
                      ? 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-600/30 ring-4 ring-rose-400/40 animate-pulse'
                      : 'bg-stone-50 hover:bg-stone-100 border-stone-200/90 text-stone-800 shadow-2xs hover:shadow-xs'
                  }`}
                  title={isVoiceListening ? 'बोलना बंद करें (Stop listening)' : 'माइक से बोलकर पूछें (Voice Query)'}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    isVoiceListening ? 'bg-white text-rose-600 animate-bounce' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    <Mic className="w-3.5 h-3.5" />
                  </div>
                  <span>
                    {isVoiceListening
                      ? (lang === 'hi' ? 'सुन रहे हैं... बोलिए' : 'Listening... Speak now')
                      : (lang === 'hi' ? 'बोलकर पूछें' : 'Voice Query')}
                  </span>
                </button>

                {/* Floating Live Speech Feedback Toast */}
                {voiceFeedback && (
                  <div className="absolute bottom-full mb-2 left-0 z-50 px-3 py-1.5 rounded-xl bg-stone-900/95 backdrop-blur-md text-white text-xs font-bold shadow-xl border border-stone-700/60 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150 pointer-events-none whitespace-nowrap">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
                    <span>{voiceFeedback}</span>
                  </div>
                )}
              </div>

              {/* Tertiary: Agro Stores & Centers */}
              <button
                type="button"
                onClick={() => onNavigate('medical-map')}
                className="px-4 py-3.5 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200/90 text-stone-700 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 active:scale-[0.98] shadow-2xs hover:shadow-xs"
              >
                <MapPin className="w-4 h-4 text-emerald-700" />
                <span>{lang === 'hi' ? 'कृषि केंद्र' : 'Agro Stores'}</span>
              </button>

            </div>

          </div>

          {/* RIGHT: High-Tech Diagnostic Preview & Precision Spray Advisory */}
          <div className="lg:col-span-5">
            <div className="rounded-[28px] border border-stone-200/90 shadow-md hover:shadow-lg transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[320px] group bg-stone-950">
              
              {/* Actual Background Photo of Recent Crop Leaf */}
              <img 
                src={cropImageUrl} 
                alt={cropName} 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90" 
              />

              {/* Natural Gradient Layer for High Contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/95 via-stone-950/30 to-stone-950/50 pointer-events-none" />

              {/* Top Meta Badges (Floating Pills) */}
              <div className="flex items-center justify-between p-3.5 z-10">
                <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5 bg-emerald-900/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-emerald-400/30 shadow-md">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                  <span>{getCommonLabel('recentScan', lang)}</span>
                </span>
                <span className="text-[11px] font-black text-emerald-200 bg-stone-950/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 shadow-md">
                  ICAR Verified
                </span>
              </div>

              {/* Bottom Integrated Glassmorphism Advisory Card */}
              <div className="p-3.5 z-10">
                <div className="p-3.5 rounded-2xl bg-stone-950/80 backdrop-blur-xl border border-white/15 shadow-xl space-y-2.5">
                  
                  {/* Crop Title & Disease Indicator */}
                  <div>
                    <h3 className="text-base font-black text-white tracking-tight leading-snug">
                      {cropName} • {cropVariety}
                    </h3>
                    <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                      <span className="line-clamp-1">{recentDiseaseName}</span>
                    </div>
                  </div>

                  {/* Precision Spray Window */}
                  <div className="pt-2 border-t border-white/10 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-stone-300 text-[11px]">
                        {lang === 'hi' ? 'सुरक्षित स्प्रे समय:' : 'Safe Spray Window:'}
                      </span>
                      <span className="font-black text-emerald-300 flex items-center gap-1 text-xs">
                        <Activity className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{isSafeSpray ? '4:00 PM – 7:30 PM' : 'Postpone Spray'}</span>
                      </span>
                    </div>
                    <div className="text-[10.5px] text-stone-400 font-medium leading-tight">
                      {isSafeSpray
                        ? (lang === 'hi' ? 'हवा की गति कम (11 km/h) • वर्षा की 0% संभावना' : 'Low wind & 0% rain probability.')
                        : (lang === 'hi' ? 'उच्च नमी या वर्षा की संभावना, छिड़काव टालें।' : 'Unfavorable weather for spraying.')}
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>

        </div>

        {/* ============================================================= */}
        {/* 3. SLEEK INTEGRATED WEATHER & MICROCLIMATE BAR               */}
        {/* ============================================================= */}
        <div className="pt-3 border-t border-stone-100/90">
          <div className="flex items-center justify-between mb-2 px-0.5">
            <div className="flex items-center gap-1.5">
              <Sun className="w-4 h-4 text-amber-600 stroke-[2.2]" />
              <span className="text-xs font-bold text-stone-700 tracking-tight">
                {t('home_weather_today') || (lang === 'hi' ? 'खेत का आज का मौसम' : 'Field Weather Today')}
              </span>
            </div>
            
            <button
              type="button"
              onClick={() => onNavigate('weather')}
              className="text-xs font-black text-emerald-800 hover:text-emerald-950 flex items-center gap-0.5 transition-colors"
            >
              <span>{t('home_view_forecast') || (lang === 'hi' ? '7-दिवसीय पूर्वानुमान देखें' : '7-Day Forecast')}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            
            {/* Temperature */}
            <div className="px-3 py-2 rounded-xl bg-stone-50 hover:bg-stone-100/80 border border-stone-200/70 shadow-2xs flex items-center gap-2.5 transition-all">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-700 flex items-center justify-center flex-shrink-0">
                <Thermometer className="w-3.5 h-3.5 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-black text-stone-900 leading-none">
                  {temp}°C
                </div>
                <div className="text-[9.5px] text-stone-500 font-bold uppercase tracking-wide mt-0.5 truncate">
                  {t('home_weather_temp') || 'Temp'}
                </div>
              </div>
            </div>

            {/* Humidity */}
            <div className="px-3 py-2 rounded-xl bg-stone-50 hover:bg-stone-100/80 border border-stone-200/70 shadow-2xs flex items-center gap-2.5 transition-all">
              <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-700 flex items-center justify-center flex-shrink-0">
                <Droplets className="w-3.5 h-3.5 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-black text-stone-900 leading-none">
                  {humidity}%
                </div>
                <div className="text-[9.5px] text-stone-500 font-bold uppercase tracking-wide mt-0.5 truncate">
                  {t('home_weather_humidity') || 'Humidity'}
                </div>
              </div>
            </div>

            {/* Rain Status */}
            <div className="px-3 py-2 rounded-xl bg-stone-50 hover:bg-stone-100/80 border border-stone-200/70 shadow-2xs flex items-center gap-2.5 transition-all">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-700 flex items-center justify-center flex-shrink-0">
                <CloudRain className="w-3.5 h-3.5 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-black text-stone-900 leading-none truncate">
                  {rainLabel}
                </div>
                <div className="text-[9.5px] text-stone-500 font-bold uppercase tracking-wide mt-0.5 truncate">
                  {t('home_weather_rain') || 'Rain'}
                </div>
              </div>
            </div>

            {/* Wind */}
            <div className="px-3 py-2 rounded-xl bg-stone-50 hover:bg-stone-100/80 border border-stone-200/70 shadow-2xs flex items-center gap-2.5 transition-all">
              <div className="w-7 h-7 rounded-lg bg-teal-500/10 text-teal-700 flex items-center justify-center flex-shrink-0">
                <Wind className="w-3.5 h-3.5 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-black text-stone-900 leading-none">
                  {windKph} {t('home_kph') || 'km/h'}
                </div>
                <div className="text-[9.5px] text-stone-500 font-bold uppercase tracking-wide mt-0.5 truncate">
                  {t('home_weather_wind') || 'Wind'}
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}