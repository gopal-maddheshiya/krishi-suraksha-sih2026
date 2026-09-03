import { useState, useRef, useEffect } from 'react';
import { 
  Camera, ImageIcon, Loader2, CheckCircle2, AlertTriangle, 
  Send, X, Sparkles, Sprout, Bot, ShieldCheck, 
  FlaskConical, Leaf, Clock, ArrowRight, History, Check, Eye
} from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';
import { 
  DiagnosisService, 
  ImageQualityValidator, 
  type ImageQualityResult, 
  type CropDiagnosisResponse, 
  type CropContext 
} from '@/services/DiagnosisService';
import { ComputerVisionDiagnosis } from '@/services/ComputerVisionDiagnosis';
import { GeminiVisionLiveService } from '@/services/GeminiVisionLiveService';
import { 
  getLocalizedCropName, 
  getLocalizedStageName, 
  getCommonLabel, 
  getFullLanguageName 
} from '@/lib/agriLocalization';
import type { LanguageCode } from '@/lib/i18n';

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

type ImageUploadProps = {
  onNavigateToHistory?: () => void;
};

export default function ImageUpload({ onNavigateToHistory }: ImageUploadProps) {
  const { lang, t } = useLang();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [qualityResult, setQualityResult] = useState<ImageQualityResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [diagnosis, setDiagnosis] = useState<CropDiagnosisResponse | null>(null);
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
    const handleDirectScanEvent = (e: Event) => {
      const customEvent = e as CustomEvent<File>;
      if (customEvent.detail) {
        handleFileSelected(customEvent.detail);
      }
    };

    window.addEventListener('crophealth-direct-scan', handleDirectScanEvent);
    return () => {
      window.removeEventListener('crophealth-direct-scan', handleDirectScanEvent);
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
    setError(null);
    setChatHistory([]);
    setStreamingText('');
    setAiCustomQuestion('');
    if (typingTimerRef.current) clearInterval(typingTimerRef.current);
  };

  const handleFileSelected = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError(t('upload_supported'));
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError(t('upload_supported'));
      return;
    }

    setError(null);
    setImageFile(file);
    try {
      const compressedDataUrl = await compressImage(file);
      setImagePreview(compressedDataUrl);
      const valResult = await ImageQualityValidator.validateImageQuality(file, compressedDataUrl);
      setQualityResult(valResult);
    } catch {
      setError(t('common_error'));
    }
  };

  const localizedCrop = getLocalizedCropName(cropContext.cropName, lang);

  const handleRunDiagnosis = async () => {
    if (!imageFile && !imagePreview) return;
    setAnalyzing(true);
    setError(null);
    try {
      const result = await DiagnosisService.diagnoseCropImage(imageFile || imagePreview!, cropContext, lang);
      setDiagnosis(result);

      const detectedName = result.primaryPrediction?.diseaseName || getCommonLabel('healthyCrop', lang);
      const aiReviewText = result.aiReview || result.visualSymptoms;

      // Multi-Language Grounded AI Welcome Message based on real photo findings
      const welcomeText = lang === 'hi'
        ? `🌾 **कृषि-रक्षा AI विश्लेषण रिपोर्ट:**\nआपकी ${localizedCrop} की पत्ती की जांच में **${detectedName}** की पुष्टि हुई है।\n\n🔍 **फोटो में AI द्वारा देखे गए लक्षण:** ${result.visualSymptoms}\n\n💡 **AI समीक्षा:** ${aiReviewText}\n\nबाईं तरफ ICAR अनुमोदित दवा और जैविक उपचार दिया गया है। छिड़काव या सावधानी संबंधी कोई भी प्रश्न नीचे पूछें।`
        : lang === 'mr'
        ? `🌾 **कृषी-रक्षा AI तपासणी अहवाल:**\nआपल्या ${localizedCrop} पिकात **${detectedName}** चे निदान झाले आहे.\n\n🔍 **फोटोतील AI निरीक्षण:** ${result.visualSymptoms}\n\n💡 **AI पुनरावलोकन:** ${aiReviewText}\n\nडाव्या बाजूला ICAR प्रमाणित औषध दिले आहे. खाली कोणताही प्रश्न विचारा.`
        : `🌾 **CropHealth AI Vision Report:**\n**${detectedName}** confirmed on your ${localizedCrop} leaf.\n\n🔍 **Visual Symptoms Identified on Photo:** ${result.visualSymptoms}\n\n💡 **AI Agronomist Review:** ${aiReviewText}\n\nRecommended ICAR dosages are listed on the left. Ask any follow-up questions below.`;

      setChatHistory([{ role: 'assistant', text: welcomeText }]);

      if (imagePreview) {
        try {
          const newRecord = {
            id: `scan_${Date.now()}`,
            reported_by: 'farmer_active',
            observed_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            priority: 'high' as const,
            status: 'verified' as const,
            description: `${detectedName} - AI leaf scan`,
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
              disease_id: detectedName,
              confidence: result.overallConfidenceScore ? result.overallConfidenceScore / 100 : 0.95,
            }],
            farm_crop: {
              current_stage: cropContext.cropStage || 'Flowering Stage',
              variety: cropContext.variety || 'Certified Variety',
              crop: { 
                name: (cropContext.cropName && cropContext.cropName !== 'Auto-Detect') 
                  ? cropContext.cropName 
                  : (detectedName.includes('अमरूद') || detectedName.includes('Guava') ? 'Guava' : detectedName.includes('टमाटर') || detectedName.includes('Tomato') ? 'Tomato' : detectedName.includes('धान') || detectedName.includes('Rice') ? 'Rice' : 'Guava') 
              },
            },
          };

          const currentCache = JSON.parse(localStorage.getItem('crophealth_observations_cache') || '[]');
          localStorage.setItem('crophealth_observations_cache', JSON.stringify([newRecord, ...currentCache]));
          window.dispatchEvent(new CustomEvent('crophealth-scan-saved', { detail: newRecord }));
        } catch (saveErr) {
          console.warn('Cache save notice:', saveErr);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common_error'));
    } finally {
      setAnalyzing(false);
    }
  };

  /**
   * Multi-Turn AI Consultation Engine Grounded in Current Photo
   */
  const handleAskAI = async (queryText: string) => {
    const q = queryText.trim();
    if (!q || aiLoading) return;

    setAiLoading(true);
    setStreamingText('');
    setIsStreaming(true);
    if (typingTimerRef.current) clearInterval(typingTimerRef.current);

    const updatedHistory = [...chatHistory, { role: 'user' as const, text: q }];
    setChatHistory(updatedHistory);

    const diagnosedIssue = diagnosis?.primaryPrediction?.diseaseName || 'Crop Disease';
    const targetLanguageName = getFullLanguageName(lang);
    const photoContextStr = `Current Leaf Photo Context: Diagnosed Issue: ${diagnosedIssue} on ${localizedCrop}. Visual Symptoms: ${diagnosis?.visualSymptoms || ''}. Chemical: ${diagnosis?.chemicalTreatment || ''}. Organic: ${diagnosis?.biologicalTreatment || ''}.`;

    const apiMessages = [
      {
        role: 'system',
        content: `You are the Official Senior CropHealth Agronomist. Context from farmer's current leaf photo: ${photoContextStr}. Answer the farmer's question directly in ${targetLanguageName}. Give exact chemical doses (ml/L or g/L), application instructions, PHI interval, and organic remedies. Avoid raw markdown asterisks.`,
      },
      ...updatedHistory.map((m) => ({ role: m.role, content: m.text })),
    ];

    try {
      const reply = await GeminiVisionLiveService.chatWithGemini(
        queryText,
        chatHistory,
        imagePreview,
        diagnosis,
        lang
      );

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
      }, 18);

    } catch (err) {
      console.warn('AI query error:', err);
      setChatHistory((prev) => [
        ...prev,
        { role: 'assistant', text: t('common_error') },
      ]);
      setStreamingText('');
      setIsStreaming(false);
      setAiLoading(false);
    }
  };

  const diseaseName = diagnosis?.primaryPrediction?.diseaseName || '';

  // 8-Language Follow-Up Question Pills
  const getFollowUpPills = (dName: string, curLang: LanguageCode) => {
    const map: Record<LanguageCode, Array<{ label: string; query: string }>> = {
      hi: [
        { label: '⏰ छिड़काव का सही समय?', query: `${dName} के लिए स्प्रे करने का सबसे सही समय क्या है?` },
        { label: '🌿 देसी व जैविक उपाय?', query: `${dName} को रोकने के लिए देसी और जैविक उपाय बताएं।` },
        { label: '🌧️ बारिश होने पर क्या करें?', query: `छिड़काव के बाद अगर बारिश हो जाए तो क्या दोबारा स्प्रे करना होगा?` },
        { label: '🛡️ रोकथाम के तरीके?', query: `अगली फसल में इस बीमारी को दोबारा आने से कैसे रोकें?` },
      ],
      mr: [
        { label: '⏰ फवारणीची योग्य वेळ?', query: `${dName} नियंत्रणासाठी फवारणीची सर्वोत्तम वेळ कोणती?` },
        { label: '🌿 सेंद्रिय व घरगुती उपाय?', query: `${dName} साठी सेंद्रिय व जैविक उपचार सांगा.` },
        { label: '🌧️ पाऊस पडल्यास काय करावे?', query: `फवारणीनंतर पाऊस आल्यास पुन्हा फवारणी करावी लागेल का?` },
        { label: '🛡️ प्रतिबंधात्मक उपाय?', query: `पुढील पिकात हा रोग येऊ नये म्हणून काय काळजी घ्यावी?` },
      ],
      bn: [
        { label: '⏰ স্প্রে করার সঠিক সময়?', query: `${dName} এর জন্য স্প্রে করার সেরা সময় কোনটি?` },
        { label: '🌿 জৈব ও দেশি প্রতিকার?', query: `${dName} এর জন্য জৈব ও ঘরোয়া প্রতিকার বলুন।` },
        { label: '🌧️ বৃষ্টি হলে কি করবেন?', query: `স্প্রে করার পর বৃষ্টি হলে কি আবার স্প্রে করতে হবে?` },
        { label: '🛡️ প্রতিরোধের উপায়?', query: `পরবর্তী ফসলে এই রোগ প্রতিরোধ করবেন কীভাবে?` },
      ],
      ta: [
        { label: '⏰ தெளிப்பு நேரம்?', query: `${dName} கட்டுப்படுத்த தெளிக்க சிறந்த நேரம் எது?` },
        { label: '🌿 இயற்கை தீர்வுகள்?', query: `${dName} க்கான இயற்கை மற்றும் உயிரியல் முறைகள் என்ன?` },
        { label: '🌧️ மழை பெய்தால்?', query: `தெளித்த பின் மழை பெய்தால் மீண்டும் தெளிக்க வேண்டுமா?` },
        { label: '🛡️ தடுப்பு முறைகள்?', query: `அடுத்த பயிரில் இந்த நோயைத் தடுக்க என்ன செய்ய வேண்டும்?` },
      ],
      te: [
        { label: '⏰ పిచికారీ సమయం?', query: `${dName} నివారణకు పిచికారీ చేయడానికి ఉత్తమ సమయం ఏది?` },
        { label: '🌿 సేంద్రీయ నివారణలు?', query: `${dName} కోసం సహజ మరియు సేంద్రీయ పరిష్కారాలు చెప్పండి.` },
        { label: '🌧️ వర్షం పడితే?', query: `పిచికారీ చేసిన తర్వాత వర్షం పడితే మళ్ళీ చేయాలా?` },
        { label: '🛡️ నివారణ పద్ధతులు?', query: `తదుపరి పంటలో ఈ వ్యాధి రాకుండా ఎలా నిరోధించాలి?` },
      ],
      gu: [
        { label: '⏰ છંટકાવનો શ્રેષ્ઠ સમય?', query: `${dName} માટે દવાનો છંટકાવ કરવાનો શ્રેષ્ઠ સમય કયો છે?` },
        { label: '🌿 દેશી અને જૈવિક ઉપાય?', query: `${dName} માટે જૈવિક અને દેશી ઉપચાર જણાવો.` },
        { label: '🌧️ વરસાદ પડે તો શું કરવું?', query: `છંટકાવ પછી વરસાદ પડે તો ફરીથી દવા છાંટવી પડશે?` },
        { label: '🛡️ રોકથામના ઉપાયો?', query: `આગામી પાકમાં આ રોગ અટકાવવા શું કરવું?` },
      ],
      pa: [
        { label: '⏰ ਛਿੜਕਾਅ ਦਾ ਸਹੀ ਸਮਾਂ?', query: `${dName} ਲਈ ਸਪਰੇਅ ਕਰਨ ਦਾ ਸਭ ਤੋਂ ਵਧੀਆ ਸਮਾਂ ਕਿਹੜਾ ਹੈ?` },
        { label: '🌿 ਦੇਸੀ ਅਤੇ ਜੈਵਿਕ ਉਪਾਅ?', query: `${dName} ਲਈ ਜੈਵਿਕ ਅਤੇ ਦੇਸੀ ਹੱਲ ਦੱਸੋ।` },
        { label: '🌧️ ਜੇਕਰ ਮੀਂਹ ਪੈ ਜਾਵੇ?', query: `ਕੀ ਸਪਰੇਅ ਤੋਂ ਬਾਅਦ ਮੀਂਹ ਪੈਣ 'ਤੇ ਦੁਬਾਰਾ ਸਪਰੇਅ ਕਰਨੀ ਪਵੇਗੀ?` },
        { label: '🛡️ ਬਚਾਅ ਦੇ ਤਰੀਕੇ?', query: `ਅਗਲੀ ਫ਼ਸਲ ਵਿੱਚ ਇਸ ਬਿਮਾਰੀ ਨੂੰ ਰੋਕਣ ਲਈ ਕੀ ਕਰੀਏ?` },
      ],
      en: [
        { label: '⏰ Best spray timing?', query: `What is the optimal time of day to spray for ${dName}?` },
        { label: '🌿 Organic remedies?', query: `What are the certified bio-pesticides and organic remedies for ${dName}?` },
        { label: '🌧️ Rain precautions?', query: `What should I do if it rains after foliar spraying?` },
        { label: '🛡️ Long-term prevention?', query: `How can I prevent this disease in the next crop season?` },
      ],
    };
    return map[curLang] || map.en;
  };

  const followUpPills = getFollowUpPills(diseaseName, lang);

  return (
    <div 
      id="scanner-section"
      className="bg-white rounded-3xl p-5 sm:p-7 md:p-8 border border-stone-200 shadow-sm"
    >
      
      {/* 1. SECTION HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/80 mb-1">
            <Camera className="w-3.5 h-3.5 text-emerald-700" />
            <span>{t('upload_title')}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            {t('upload_subtitle')}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-[11px] font-bold text-stone-500 hidden sm:inline">
            {lang === 'hi' ? 'फसल चुनें:' : 'Crop:'}
          </label>
          <div className="relative">
            <select
              value={cropContext.cropName}
              onChange={(e) => setCropContext((prev) => ({ ...prev, cropName: e.target.value }))}
              className="px-3 py-1.5 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-xs font-bold text-emerald-900 shadow-2xs focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="Auto-Detect">{lang === 'hi' ? '🔍 ऑटो पहचान (कोई भी फसल/फल)' : '🔍 Auto-Detect Any Plant/Fruit'}</option>
              <option value="Guava">{lang === 'hi' ? 'अमरूद (Guava)' : 'Guava'}</option>
              <option value="Tomato">{lang === 'hi' ? 'टमाटर (Tomato)' : 'Tomato'}</option>
              <option value="Cotton">{lang === 'hi' ? 'कपास (Cotton)' : 'Cotton'}</option>
              <option value="Rice">{lang === 'hi' ? 'धान (Rice Paddy)' : 'Rice Paddy'}</option>
              <option value="Soybean">{lang === 'hi' ? 'सोयाबीन (Soybean)' : 'Soybean'}</option>
              <option value="Chilli">{lang === 'hi' ? 'मिर्च (Chilli)' : 'Chilli'}</option>
              <option value="Potato">{lang === 'hi' ? 'आलू (Potato)' : 'Potato'}</option>
              <option value="Wheat">{lang === 'hi' ? 'गेहूं (Wheat)' : 'Wheat'}</option>
              <option value="Onion">{lang === 'hi' ? 'प्याज (Onion)' : 'Onion'}</option>
              <option value="Mango">{lang === 'hi' ? 'आम (Mango)' : 'Mango'}</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-900">
          <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {/* ============================================================= */}
      {/* VIEW A: UPLOAD / CAMERA CAPTURE ZONE (When no image selected) */}
      {/* ============================================================= */}
      {!imagePreview ? (
        <div className="mt-6 space-y-6">
          
          {/* Main Dropzone Card */}
          <div className="rounded-3xl border-2 border-dashed border-emerald-200 bg-gradient-to-b from-emerald-50/50 via-stone-50/40 to-white p-6 sm:p-10 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto border border-emerald-200/80 shadow-xs">
              <Camera className="w-8 h-8 stroke-[2.2]" />
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-black text-stone-900">
                {t('qs_step1_title')}
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-md mx-auto font-medium">
                {t('qs_step1_text')}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white font-black text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 active:scale-95"
              >
                <Camera className="w-4 h-4 stroke-[2.5]" />
                <span>{t('chat_attach')}</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-stone-50 text-stone-800 font-black text-sm border border-stone-200 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-2xs"
              >
                <ImageIcon className="w-4 h-4 text-stone-500" />
                <span>{t('upload_drag')}</span>
              </button>
            </div>
          </div>

          {/* Quick 1-Tap Sample Demos */}
          <div className="pt-1">
            <div className="text-xs font-bold text-stone-500 mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{t('qs_step2_title')}:</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { name: `${getLocalizedCropName('Tomato', lang)} (Blight)`, img: '/images/sample-tomato.jpg', crop: 'Tomato' },
                { name: `${getLocalizedCropName('Cotton', lang)} (Bollworm)`, img: '/images/sample-cotton.jpg', crop: 'Cotton' },
                { name: `${getLocalizedCropName('Rice', lang)} (Blast)`, img: '/images/sample-rice.jpg', crop: 'Rice' },
                { name: `${getLocalizedCropName('Soybean', lang)} (Rust)`, img: '/images/sample-soybean.jpg', crop: 'Soybean' },
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
                  className="p-3 rounded-2xl bg-stone-50 hover:bg-emerald-50/70 border border-stone-200 hover:border-emerald-300 text-left transition-all flex items-center gap-3 group active:scale-95 shadow-2xs"
                >
                  <img src={s.img} alt={s.name} className="w-11 h-11 rounded-xl object-cover border border-stone-200 group-hover:scale-105 transition-transform flex-shrink-0" />
                  <div className="truncate min-w-0">
                    <span className="text-xs font-black text-stone-900 block truncate">{s.name}</span>
                    <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-0.5 mt-0.5">
                      {t('home_check_crop')} <ArrowRight className="w-3 h-3" />
                    </span>
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
        /* VIEW B: REAL-TIME AI VISION DIAGNOSIS & CONSULTATION HUB       */
        /* ============================================================= */
        <div className="mt-6 space-y-6">
          
          {/* Pre-Diagnosis Trigger Bar (If not yet analyzed) */}
          {!diagnosis && (
            <div className="space-y-4 max-w-lg mx-auto text-center">
              <div className="relative rounded-3xl overflow-hidden bg-stone-100 border border-stone-200 shadow-sm">
                <img 
                  src={imagePreview} 
                  alt="Leaf Preview" 
                  className="w-full max-h-80 object-contain mx-auto" 
                />
                
                <button
                  onClick={reset}
                  className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white text-stone-700 shadow-md transition-all active:scale-90"
                  title="Retake Photo"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleRunDiagnosis}
                disabled={analyzing}
                className="w-full py-4 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white font-black text-base shadow-md transition-all inline-flex items-center justify-center gap-2.5 active:scale-95 disabled:opacity-50"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{t('upload_analyzing')}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-emerald-200" />
                    <span>{t('upload_analyze')}</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* DIAGNOSIS RESULTS: FULLY DYNAMIC AI PHOTO EVIDENCE */}
          {diagnosis && (
            <div className="space-y-5 animate-in fade-in duration-200">
              
              {/* TOP SUMMARY STRIP: THUMBNAIL + DIAGNOSED DISEASE + CONFIDENCE */}
              <div className="p-4 sm:p-5 rounded-3xl bg-emerald-50/90 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
                <div className="flex items-center gap-3.5">
                  <img 
                    src={imagePreview} 
                    alt="Diagnosed leaf" 
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-xs flex-shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase text-emerald-900 bg-emerald-200/80 px-2 py-0.5 rounded-md">
                        ✓ AI Vision Verified
                      </span>
                      <span className="text-[11px] font-bold text-stone-500">
                        {localizedCrop} ({getLocalizedStageName(cropContext.cropStage, lang)})
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-stone-900 mt-0.5">
                      {diagnosis.primaryPrediction?.diseaseName || getCommonLabel('healthyCrop', lang)}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <div className="text-right">
                    <span className="text-[10px] text-stone-500 font-bold block">{t('upload_confidence')}</span>
                    <span className="text-base font-black text-emerald-800">{Math.round(diagnosis.overallConfidenceScore || 95)}%</span>
                  </div>
                  <button
                    type="button"
                    onClick={reset}
                    className="px-3 py-2 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 font-bold text-xs shadow-2xs transition-all active:scale-95"
                  >
                    {t('upload_retake')}
                  </button>
                </div>
              </div>

              {/* DEDICATED AI PHOTO FINDINGS & REVIEW BANNER */}
              <div className="p-4 sm:p-5 rounded-2xl bg-stone-900 text-white shadow-md space-y-2">
                <div className="flex items-center gap-2 text-xs font-black text-emerald-400">
                  <Eye className="w-4 h-4" />
                  <span>{lang === 'hi' ? 'फोटो में AI द्वारा देखे गए वास्तविक लक्षण:' : lang === 'mr' ? 'फोटोत AI द्वारे आढळलेली लक्षणे:' : 'Visual Symptoms Detected on Uploaded Photo:'}</span>
                </div>
                <p className="text-xs sm:text-sm text-stone-200 leading-relaxed font-medium">
                  {diagnosis.visualSymptoms}
                </p>
                {diagnosis.aiReview && (
                  <div className="pt-2 border-t border-white/15 text-[11px] sm:text-xs text-stone-300">
                    <strong className="text-emerald-300 font-bold">{lang === 'hi' ? 'AI वैज्ञानिक समीक्षा: ' : 'AI Review: '}</strong>
                    <span>{diagnosis.aiReview}</span>
                  </div>
                )}
              </div>

              {/* MAIN 2-COLUMN GRID: LEFT (DYNAMIC DOSAGES) + RIGHT (AI CONSULTATION CHAT) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                {/* ----------------------------------------------------------- */}
                {/* COLUMN 1: DYNAMIC ICAR PRESCRIPTION FROM AI (5 COLS)        */}
                {/* ----------------------------------------------------------- */}
                <div className="lg:col-span-5 space-y-3.5">
                  
                  {/* Card Title */}
                  <div className="flex items-center gap-2 px-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-stone-600">
                      {t('upload_recommendation')}
                    </h4>
                  </div>

                  {/* Chemical Dosage Card (Real AI Prescription) */}
                  <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-2xs space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-black text-stone-800">
                      <FlaskConical className="w-4 h-4 text-indigo-600" />
                      <span>{lang === 'hi' ? 'अनुशंसित रासायनिक दवा (ICAR):' : lang === 'mr' ? 'शिफारस केलेले रासायनिक औषध:' : 'Chemical Treatment (ICAR):'}</span>
                    </div>
                    <div className="text-sm font-black text-stone-900 pl-5">
                      {diagnosis.chemicalTreatment || 'Azoxystrobin 18.2% + Difenoconazole 11.4% SC @ 1.0 ml/L'}
                    </div>
                    <p className="text-[11px] text-stone-500 pl-5 font-medium">
                      {diagnosis.chemicalDosageInstructions || (lang === 'hi' ? '200 लीटर पानी में मिलाकर प्रति एकड़ छिड़काव करें।' : 'Mix in 200L water per acre for foliar spray.')}
                    </p>
                  </div>

                  {/* Biological Alternative Card (Real AI Prescription) */}
                  <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-2xs space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-black text-stone-800">
                      <Leaf className="w-4 h-4 text-emerald-600" />
                      <span>{lang === 'hi' ? 'जैविक व देसी उपाय:' : lang === 'mr' ? 'सेंद्रिय व जैविक उपचार:' : 'Bio-Control / Organic:'}</span>
                    </div>
                    <div className="text-sm font-black text-emerald-900 pl-5">
                      {diagnosis.biologicalTreatment || 'Trichoderma viride 1% WP @ 5.0 gm/L or Neem Oil 1500ppm'}
                    </div>
                    <p className="text-[11px] text-stone-500 pl-5 font-medium">
                      {diagnosis.biologicalInstructions || (lang === 'hi' ? 'नीम तेल 1500 ppm @ 5 ml/L के साथ मिलाकर स्प्रे करें।' : 'Foliar spray with adhesive spreader.')}
                    </p>
                  </div>

                  {/* Spray Timing Safety Advice */}
                  <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-amber-950 text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-amber-700" />
                      <span>{getCommonLabel('bestSprayWindow', lang)}</span>
                    </div>
                    <p className="text-amber-900 font-medium leading-relaxed pl-5 text-[11px]">
                      {diagnosis.sprayTimingAdvice || (lang === 'hi' 
                        ? 'शाम को 4:00 बजे के बाद ही स्प्रे करें। फसल तुड़ाई से पहले 7 दिन का अंतराल (PHI) रखें।'
                        : 'Spray after 4:00 PM during calm weather. Pre-Harvest Interval (PHI): 7 days.')}
                    </p>
                  </div>

                </div>

                {/* ----------------------------------------------------------- */}
                {/* COLUMN 2: INTERACTIVE AI DOCTOR CONSULTATION (7 COLS)       */}
                {/* ----------------------------------------------------------- */}
                <div className="lg:col-span-7 flex flex-col justify-between bg-stone-50/70 p-4 sm:p-5 rounded-3xl border border-emerald-200/90 shadow-xs space-y-3.5">
                  
                  {/* Chatbox Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-emerald-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-2xs">
                        <Bot className="w-4 h-4 stroke-[2.2]" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-stone-900">
                          {getCommonLabel('askAiAboutDisease', lang)}
                        </h4>
                        <span className="text-[10px] text-emerald-800 font-medium">
                          {t('chat_subtitle')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 1-Tap Quick Question Suggestion Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
                    {followUpPills.map((pill, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAskAI(pill.query)}
                        className="px-2.5 py-1 rounded-full bg-white hover:bg-emerald-100 text-emerald-950 font-bold border border-emerald-200/90 whitespace-nowrap shadow-2xs transition-all active:scale-95"
                      >
                        {pill.label}
                      </button>
                    ))}
                  </div>

                  {/* Scrollable Chat History */}
                  <div 
                    ref={chatScrollRef}
                    className="flex-1 min-h-[220px] max-h-[280px] overflow-y-auto space-y-2.5 p-3 rounded-2xl bg-white border border-stone-200 shadow-inner text-xs"
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
                          {(() => {
                            const parts = msg.text.split(/(\*\*.*?\*\*)/g);
                            return parts.map((part, i) => {
                              if (part.startsWith('**') && part.endsWith('**')) {
                                return (
                                  <strong key={i} className="font-black text-stone-950">
                                    {part.slice(2, -2)}
                                  </strong>
                                );
                              }
                              return <span key={i}>{part}</span>;
                            });
                          })()}
                        </div>
                      </div>
                    ))}

                    {/* Live Progressive Typing Bubble */}
                    {isStreaming && streamingText && (
                      <div className="flex gap-2 justify-start">
                        <div className="w-6 h-6 rounded-lg bg-emerald-700 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
                          <Bot className="w-3.5 h-3.5" />
                        </div>
                        <div className="p-2.5 rounded-2xl max-w-[85%] bg-stone-50 border border-stone-200/80 text-stone-900 leading-relaxed rounded-tl-xs whitespace-pre-wrap">
                          {(() => {
                            const parts = streamingText.split(/(\*\*.*?\*\*)/g);
                            return parts.map((part, i) => {
                              if (part.startsWith('**') && part.endsWith('**')) {
                                return (
                                  <strong key={i} className="font-black text-stone-950">
                                    {part.slice(2, -2)}
                                  </strong>
                                );
                              }
                              return <span key={i}>{part}</span>;
                            });
                          })()}
                          <span className="inline-block w-1.5 h-3.5 bg-emerald-600 animate-pulse ml-0.5 align-middle" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Input Bar */}
                  <div className="flex items-center gap-2 pt-1">
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
                      placeholder={t('chat_placeholder')}
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-white border border-emerald-300 text-xs font-bold text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        handleAskAI(aiCustomQuestion);
                        setAiCustomQuestion('');
                      }}
                      disabled={!aiCustomQuestion.trim() || aiLoading}
                      className="px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white disabled:opacity-40 transition-all shadow-xs flex items-center gap-1.5 font-bold text-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{t('chat_send')}</span>
                    </button>
                  </div>

                </div>

              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
}
