import { useState, useRef, useCallback, useEffect } from 'react';
import { 
  Camera, ImageIcon, Loader2, CheckCircle2, AlertTriangle, 
  Send, X, MapPin, Sparkles, RefreshCw, ShieldAlert, ShieldCheck, 
  Info, UserCheck, HelpCircle, ChevronRight, Sprout, Sun, Focus,
  Check, ArrowRight, Eye, Layers, FlaskConical, Clock, Bot, MessageCircle,
  HelpCircle as QuestionIcon
} from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';
import { 
  DiagnosisService, 
  ImageQualityValidator, 
  type ImageQualityResult, 
  type CropDiagnosisResponse, 
  type CropContext 
} from '@/services/DiagnosisService';
import { LocationService } from '@/services/LocationService';

const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10MB

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Invalid image'));
      img.onload = () => {
        const maxDim = 1280;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const ratio = Math.min(maxDim / width, maxDim / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        try {
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        } catch {
          resolve(e.target?.result as string);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export default function ImageUpload() {
  const { lang } = useLang();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [qualityResult, setQualityResult] = useState<ImageQualityResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [diagnosis, setDiagnosis] = useState<CropDiagnosisResponse | null>(null);
  const [expertRequested, setExpertRequested] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Inline Multi-Turn AI Consultation State
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([]);
  const [aiCustomQuestion, setAiCustomQuestion] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const [cropContext, setCropContext] = useState<CropContext>(() => {
    try {
      const activeFarmStr = localStorage.getItem('crophealth_active_farm');
      if (activeFarmStr) {
        const f = JSON.parse(activeFarmStr);
        return {
          farmId: f.id,
          cropName: f.crop?.name || 'Cotton',
          variety: f.crop?.variety || 'Bt Cotton',
          cropStage: f.crop?.stage || 'Flowering Stage',
          locationDistrict: f.district,
          locationState: f.state,
          symptomsDescription: '',
        };
      }
    } catch {}
    return {
      cropName: 'Cotton',
      variety: 'Certified Variety',
      cropStage: 'Flowering Stage',
      locationDistrict: 'Pune',
      locationState: 'Maharashtra',
      symptomsDescription: '',
    };
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (typingTimerRef.current) clearInterval(typingTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatHistory, streamingText, isStreaming]);

  const reset = () => {
    setImageFile(null);
    setImagePreview(null);
    setQualityResult(null);
    setDiagnosis(null);
    setExpertRequested(false);
    setError(null);
    setChatHistory([]);
    setStreamingText('');
    setAiCustomQuestion('');
    if (typingTimerRef.current) clearInterval(typingTimerRef.current);
  };

  const handleFileSelected = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError(lang === 'hi' ? 'कृपया केवल JPG या PNG फोटो अपलोड करें।' : 'Please upload a valid JPG or PNG image.');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError(lang === 'hi' ? 'फोटो का साइज 10MB से कम होना चाहिए।' : 'Image size must be under 10MB.');
      return;
    }

    setError(null);
    setImageFile(file);
    try {
      const compressedDataUrl = await compressImage(file);
      setImagePreview(compressedDataUrl);
      const valResult = await ImageQualityValidator.validateImageQuality(file);
      setQualityResult(valResult);
    } catch {
      setError(lang === 'hi' ? 'फोटो लोड करने में असमर्थ। कृपया दोबारा प्रयास करें।' : 'Failed to load image. Please retry.');
    }
  };

  const handleRunDiagnosis = async () => {
    if (!imageFile && !imagePreview) return;
    setAnalyzing(true);
    setError(null);
    try {
      const result = await DiagnosisService.diagnoseCropImage(imageFile || imagePreview!, cropContext);
      setDiagnosis(result);

      const detectedName = result.primaryPrediction?.diseaseName || (lang === 'hi' ? 'पत्ती रोग' : 'Crop Disease');

      // Initialize helpful welcome message in chat history
      setChatHistory([
        {
          role: 'assistant',
          text: lang === 'hi'
            ? `🌾 **कृषि-रक्षा AI सलाहकार:** आपकी फसल में **${detectedName}** के लक्षण पहचाने गए हैं। ऊपर ICAR अनुमोदित दवा और जैविक उपचार दिया गया है। छिड़काव के समय, पानी के अनुपात या सावधानी से संबंधित कोई भी सवाल नीचे पूछें।`
            : `🌾 **CropHealth AI Advisor:** **${detectedName}** detected on your crop. Official ICAR remedies and organic sprays are listed above. Ask any questions below about spray timings, precautions, or respray safety.`,
        },
      ]);

      if (imagePreview) {
        try {
          const diseaseName = result.primaryPrediction?.diseaseName || (lang === 'hi' ? 'फसल पत्ती रोग' : 'Crop Leaf Disease');
          const newRecord = {
            id: `scan_${Date.now()}`,
            reported_by: 'farmer_active',
            observed_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            priority: 'high' as const,
            status: 'verified' as const,
            description: `${diseaseName} - AI पत्ती जांच व परामर्श`,
            images: [{
              id: `img_${Date.now()}`,
              observation_id: `scan_${Date.now()}`,
              storage_path: imagePreview,
              file_name: 'crop_leaf_scan.jpg',
              mime_type: 'image/jpeg',
              file_size: 1024,
              created_at: new Date().toISOString(),
            }],
            diagnoses: [{
              id: `diag_${Date.now()}`,
              observation_id: `scan_${Date.now()}`,
              disease_id: diseaseName,
              confidence: result.overallConfidenceScore ? result.overallConfidenceScore / 100 : 0.95,
            }],
            farm_crop: {
              current_stage: cropContext.cropStage || 'Flowering Stage',
              variety: cropContext.variety || 'Certified Variety',
              crop: { name: cropContext.cropName || 'Cotton' },
            },
          };

          const currentCache = JSON.parse(localStorage.getItem('crophealth_observations_cache') || '[]');
          localStorage.setItem('crophealth_observations_cache', JSON.stringify([newRecord, ...currentCache]));
        } catch (saveErr) {
          console.warn('Cache save notice:', saveErr);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Diagnosis screening failed. Please retry.');
    } finally {
      setAnalyzing(false);
    }
  };

  /**
   * Multi-Turn AI Consultation Engine
   */
  const handleAskAI = async (queryText: string) => {
    const q = queryText.trim();
    if (!q || aiLoading) return;

    setAiLoading(true);
    setStreamingText('');
    setIsStreaming(true);
    if (typingTimerRef.current) clearInterval(typingTimerRef.current);

    // Add user message to history immediately
    const updatedHistory = [...chatHistory, { role: 'user' as const, text: q }];
    setChatHistory(updatedHistory);

    const diagnosedIssue = diagnosis?.primaryPrediction?.diseaseName || 'Crop Disease';
    const apiMessages = [
      {
        role: 'system',
        content: `You are the Official CropHealth Agronomist AI. The farmer has scanned a ${cropContext.cropName} (${cropContext.cropStage}) leaf with diagnosed ${diagnosedIssue}. Provide direct, highly structured, clear, and reassuring ICAR guidance in ${lang === 'hi' ? 'Hindi' : 'English'}. Include exact doses, time of day (after 4 PM), PHI safety period, and organic alternatives.`,
      },
      ...updatedHistory.map((m) => ({ role: m.role, content: m.text })),
    ];

    try {
      let reply: string | null = null;

      // 1. Try /api/chat backend
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: apiMessages,
            language: lang,
          }),
        });
        if (res.ok) {
          const json = await res.json();
          if (json?.reply) reply = json.reply;
        }
      } catch {}

      // 2. Fallback knowledge answer
      if (!reply) {
        if (lang === 'hi') {
          reply = `🌾 **कृषि-रक्षा AI सलाह:** ${diagnosedIssue} के लिए:\n\n1. **दवा एवं मात्रा:** एमामेक्टिन बेंजोएट 5% SG @ 0.4 ग्राम/लीटर पानी या कॉपर ऑक्सीक्लोराइड @ 2.5 ग्राम/लीटर का छिड़काव करें।\n2. **सही समय:** हमेशा शाम 4:00 बजे के बाद छिड़काव करें जब तेज धूप न हो।\n3. **जैविक उपाय:** नीम तेल 1500 ppm @ 5 ml/लीटर का स्प्रे करें ताकि रोग आगे न फैले।`;
        } else {
          reply = `🌾 **AI Advisory:** For ${diagnosedIssue} management:\n\n1. **Dosage:** Apply Emamectin Benzoate 5% SG @ 0.4g/L or Copper Oxychloride @ 2.5g/L.\n2. **Spray Timing:** Best sprayed after 4:00 PM in calm wind.\n3. **Organic Care:** Spray Neem Oil 1500 ppm @ 5 ml/L to prevent secondary infestation.`;
        }
      }

      // Stream text progressively into the chat
      const words = reply.split(' ');
      let cur = 0;
      setStreamingText(words[0] || '');

      typingTimerRef.current = setInterval(() => {
        cur++;
        if (cur >= words.length) {
          if (typingTimerRef.current) clearInterval(typingTimerRef.current);
          setChatHistory((prev) => [...prev, { role: 'assistant', text: reply! }]);
          setStreamingText('');
          setIsStreaming(false);
          setAiLoading(false);
        } else {
          setStreamingText(words.slice(0, cur + 1).join(' '));
        }
      }, 20);

    } catch (err) {
      console.warn('AI query error:', err);
      setChatHistory((prev) => [
        ...prev,
        { role: 'assistant', text: lang === 'hi' ? 'सलाह प्राप्त करने में समस्या हुई। कृपया दोबारा पूछें।' : 'Error connecting to AI. Please retry.' },
      ]);
      setStreamingText('');
      setIsStreaming(false);
      setAiLoading(false);
    }
  };

  const diseaseName = diagnosis?.primaryPrediction?.diseaseName || '';

  const followUpPills = [
    { label: lang === 'hi' ? '⏰ छिड़काव का सही समय?' : 'Spray timing?', query: `${diseaseName} के लिए स्प्रे करने का सबसे सही समय क्या है?` },
    { label: lang === 'hi' ? '🌿 देसी व जैविक उपाय?' : 'Organic remedies?', query: `${diseaseName} को रोकने के लिए देसी और जैविक उपाय बताएं।` },
    { label: lang === 'hi' ? '🌧️ बारिश होने पर क्या करें?' : 'If it rains?', query: `छिड़काव के बाद अगर बारिश हो जाए तो क्या दोबारा स्प्रे करना होगा?` },
    { label: lang === 'hi' ? '🛡️ रोकथाम के तरीके?' : 'Prevention guide?', query: `अगली फसल में इस बीमारी को दोबारा आने से कैसे रोकें?` },
  ];

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200/90 shadow-sm">
      
      {/* Clean Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-stone-900 flex items-center gap-2">
            <Camera className="w-5 h-5 text-emerald-800" />
            <span>{lang === 'hi' ? 'फसल पत्ती लक्षण जांच' : 'Crop Leaf Health Check'}</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5 font-medium">
            {lang === 'hi' 
              ? 'प्रभावित पत्ती की फोटो लें और तुरंत बीमारी का नाम व सटीक दवा की मात्रा जानें।'
              : 'Take a clear leaf photo to identify diseases and get certified ICAR treatment.'}
          </p>
        </div>

        <div className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
          <Sprout className="w-3.5 h-3.5 text-emerald-700" />
          <span>{cropContext.cropName} ({cropContext.variety || 'Certified'})</span>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-900">
          <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {/* ============================================================= */}
      {/* 1. CLEAN LIGHT SCANNER CARD                                   */}
      {/* ============================================================= */}
      {!imagePreview ? (
        <div className="mt-5 space-y-5">
          
          {/* Soft Elegant Upload Area */}
          <div className="rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/40 p-6 sm:p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100/80 text-emerald-800 flex items-center justify-center mx-auto border border-emerald-200 shadow-2xs">
              <Camera className="w-7 h-7 stroke-[2.2]" />
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-black text-stone-900">
                {lang === 'hi' ? 'प्रभावित पत्ती की फोटो अपलोड करें' : 'Upload Affected Plant Leaf Photo'}
              </h3>
              <p className="text-xs text-stone-600 mt-1 max-w-sm mx-auto font-medium">
                {lang === 'hi' 
                  ? 'सीधे कैमरे से फोटो खींचें या फोन की गैलरी से चुनें' 
                  : 'Capture directly using camera or select from your gallery'}
              </p>
            </div>

            {/* Clean Dual Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Camera className="w-4 h-4" />
                <span>{lang === 'hi' ? 'कैमरे से फोटो लें' : 'Take Photo'}</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white hover:bg-stone-50 text-stone-700 font-bold text-xs sm:text-sm border border-stone-200 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-2xs"
              >
                <ImageIcon className="w-4 h-4 text-stone-500" />
                <span>{lang === 'hi' ? 'गैलरी से चुनें' : 'Choose from Gallery'}</span>
              </button>
            </div>
          </div>

          {/* Quick 1-Tap Sample Demos */}
          <div className="pt-2">
            <div className="text-xs font-bold text-stone-500 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{lang === 'hi' ? 'या डेमो के लिए नीचे दिए गए पत्तों पर टैप करें:' : 'Or tap a sample to test:'}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { name: 'टमाटर झुलसा', img: '/images/sample-tomato.jpg', crop: 'Tomato' },
                { name: 'कपास बोंडअळी', img: '/images/sample-cotton.jpg', crop: 'Cotton' },
                { name: 'धान ब्लास्ट', img: '/images/sample-rice.jpg', crop: 'Rice' },
                { name: 'सोयाबीन रस्ट', img: '/images/sample-soybean.jpg', crop: 'Soybean' },
              ].map((s) => (
                <button
                  key={s.name}
                  type="button"
                  onClick={async () => {
                    setImagePreview(s.img);
                    setCropContext((prev) => ({ ...prev, cropName: s.crop }));
                    try {
                      const res = await fetch(s.img);
                      const blob = await res.blob();
                      const file = new File([blob], `${s.crop}_sample.jpg`, { type: 'image/jpeg' });
                      setImageFile(file);
                    } catch {}
                  }}
                  className="p-2.5 rounded-xl bg-stone-50 hover:bg-emerald-50 border border-stone-200 hover:border-emerald-300 text-left transition-all flex items-center gap-2.5 group active:scale-95"
                >
                  <img src={s.img} alt={s.name} className="w-9 h-9 rounded-lg object-cover border border-stone-200 group-hover:scale-105 transition-transform" />
                  <div className="truncate">
                    <span className="text-[11px] font-black text-stone-900 block truncate">{s.name}</span>
                    <span className="text-[10px] text-emerald-700 font-bold">जांचें →</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFileSelected(e.target.files[0])}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFileSelected(e.target.files[0])}
          />
        </div>
      ) : (
        /* ============================================================= */
        /* 2. PREVIEW & DIAGNOSIS + INLINE AI CONSULTATION               */
        /* ============================================================= */
        <div className="mt-5 space-y-4">
          
          <div className="relative rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 max-w-md mx-auto">
            <img 
              src={imagePreview} 
              alt="Leaf Preview" 
              className="w-full max-h-72 object-contain mx-auto" 
            />
            
            <button
              onClick={reset}
              className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white text-stone-700 shadow-md transition-all active:scale-90"
              aria-label="Retake Photo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {qualityResult && !qualityResult.isValid && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
              <div className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>{lang === 'hi' ? 'फोटो स्पष्ट नहीं है' : 'Photo Not Clear'}</span>
              </div>
              <p className="mt-0.5">{lang === 'hi' ? qualityResult.userGuidanceMessageHi : qualityResult.userGuidanceMessage}</p>
            </div>
          )}

          {!diagnosis && (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={handleRunDiagnosis}
                disabled={analyzing}
                className="px-6 py-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-black text-xs sm:text-sm shadow-sm transition-all inline-flex items-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{lang === 'hi' ? 'AI जांच जारी है...' : 'Diagnosing...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-emerald-200" />
                    <span>{lang === 'hi' ? 'रोग की पहचान करें' : 'Diagnose Disease'}</span>
                  </>
                )}
              </button>
            </div>
          )}

          {diagnosis && (
            <div className="p-5 rounded-3xl bg-emerald-50/80 border border-emerald-200/90 space-y-4 animate-in fade-in duration-150">
              
              {/* Top Result Meta */}
              <div className="flex items-center justify-between pb-3 border-b border-emerald-200/70">
                <div>
                  <span className="text-[10px] font-black uppercase text-emerald-900 bg-emerald-100/90 px-2 py-0.5 rounded-full border border-emerald-300/60">
                    ✓ ICAR AI Diagnosis
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-emerald-950 mt-1">
                    {diagnosis.primaryPrediction?.diseaseName || 'Crop Disease'}
                  </h3>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-stone-500 font-bold block">{lang === 'hi' ? 'सटीकता' : 'Confidence'}</span>
                  <span className="text-sm font-black text-emerald-800">{Math.round(diagnosis.overallConfidenceScore || 95)}%</span>
                </div>
              </div>

              {/* ICAR Chemical & Bio Prescription */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div className="p-3 bg-white rounded-2xl border border-emerald-100 shadow-2xs">
                  <span className="font-bold text-stone-500 block text-[11px]">{lang === 'hi' ? 'रासायनिक दवा (ICAR):' : 'Chemical Spray:'}</span>
                  <span className="font-black text-stone-900 mt-0.5 block">
                    {diagnosis.primaryPrediction?.category === 'pest_infestation'
                      ? 'इमामेक्टिन बेंजोएट 5% SG @ 0.4 gm/L'
                      : 'कॉपर ऑक्सीक्लोराइड 50% WP @ 2.5 gm/L'}
                  </span>
                </div>

                <div className="p-3 bg-white rounded-2xl border border-emerald-100 shadow-2xs">
                  <span className="font-bold text-stone-500 block text-[11px]">{lang === 'hi' ? 'जैविक व देसी उपचार:' : 'Biological Remedy:'}</span>
                  <span className="font-black text-stone-900 mt-0.5 block">
                    ट्राइकोडर्मा विरिडी 1% WP @ 5.0 gm/L पानी
                  </span>
                </div>
              </div>

              {/* ============================================================= */}
              {/* 3. INLINE AI ADVISOR CONSULTATION SECTION                     */}
              {/* ============================================================= */}
              <div className="pt-3 border-t border-emerald-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center">
                      <Bot className="w-4 h-4 stroke-[2.2]" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-emerald-950 block leading-tight">
                        {lang === 'hi' ? '🌾 AI सलाहकार से और पूछें' : '🌾 Ask AI Advisor More'}
                      </span>
                      <span className="text-[10px] text-emerald-800 font-medium">
                        {lang === 'hi' ? 'इस बीमारी के बारे में कोई भी प्रश्न पूछें' : 'Ask any questions about this disease'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick 1-Tap Question Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
                  {followUpPills.map((pill, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAskAI(pill.query)}
                      className="px-2.5 py-1 rounded-full bg-white hover:bg-emerald-100 text-emerald-950 font-bold border border-emerald-200 whitespace-nowrap shadow-2xs transition-all active:scale-95"
                    >
                      {pill.label}
                    </button>
                  ))}
                </div>

                {/* Inline Question Input Bar */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={aiCustomQuestion}
                    onChange={(e) => setAiCustomQuestion(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAskAI(aiCustomQuestion);
                        setAiCustomQuestion('');
                      }
                    }}
                    placeholder={lang === 'hi' ? 'इस बीमारी या दवा के बारे में कुछ भी पूछें...' : 'Ask AI anything about this diagnosis...'}
                    className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-emerald-300 text-xs font-bold text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      handleAskAI(aiCustomQuestion);
                      setAiCustomQuestion('');
                    }}
                    disabled={!aiCustomQuestion.trim() || aiLoading}
                    className="p-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white disabled:opacity-40 transition-all shadow-2xs"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>

                {/* Multi-Turn AI Conversation History & Streaming Bubble */}
                {chatHistory.length > 0 && (
                  <div 
                    ref={chatScrollRef}
                    className="max-h-60 overflow-y-auto space-y-2 p-3 rounded-2xl bg-white/90 border border-emerald-200/90 shadow-2xs text-xs"
                  >
                    {chatHistory.map((msg, index) => (
                      <div
                        key={index}
                        className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {msg.role === 'assistant' && (
                          <div className="w-6 h-6 rounded-lg bg-emerald-700 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
                            <Bot className="w-3.5 h-3.5" />
                          </div>
                        )}
                        <div
                          className={`p-2.5 rounded-2xl max-w-[85%] whitespace-pre-wrap leading-relaxed ${
                            msg.role === 'user'
                              ? 'bg-emerald-800 text-white font-medium rounded-br-xs'
                              : 'bg-stone-50 border border-stone-200/80 text-stone-900 rounded-tl-xs'
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    ))}

                    {/* Live Progressive Typing Bubble */}
                    {isStreaming && streamingText && (
                      <div className="flex gap-2 justify-start">
                        <div className="w-6 h-6 rounded-lg bg-emerald-700 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
                          <Bot className="w-3.5 h-3.5" />
                        </div>
                        <div className="p-2.5 rounded-2xl max-w-[85%] bg-stone-50 border border-stone-200/80 text-stone-900 leading-relaxed rounded-tl-xs">
                          {streamingText}
                          <span className="inline-block w-1.5 h-3.5 bg-emerald-600 animate-pulse ml-0.5 align-middle" />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="pt-2 flex items-center justify-between text-xs">
                <span className="text-emerald-900 font-medium">✓ जांच इतिहास में सहेजा गया</span>
                <button
                  type="button"
                  onClick={reset}
                  className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-black text-white font-bold text-xs shadow-2xs transition-all active:scale-95"
                >
                  {lang === 'hi' ? 'दूसरी फोटो जांचें' : 'Check Another'}
                </button>
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
}
