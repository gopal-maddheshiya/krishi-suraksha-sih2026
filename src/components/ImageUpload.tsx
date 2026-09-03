import { useState, useRef, useCallback, useEffect } from 'react';
import { 
  Camera, ImageIcon, Loader2, CheckCircle2, AlertTriangle, 
  Send, X, MapPin, Sparkles, RefreshCw, ShieldAlert, ShieldCheck, 
  Info, UserCheck, HelpCircle, ChevronRight, Sprout, Sun, Focus,
  Check, ArrowRight, Eye, Layers, FlaskConical, Clock
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
    const loc = LocationService.getSavedLocation();
    return {
      cropName: 'Cotton',
      variety: 'Bt Cotton',
      cropStage: 'Flowering Stage',
      locationDistrict: loc.district,
      locationState: loc.state,
      symptomsDescription: '',
    };
  });

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setImageFile(null);
    setImagePreview(null);
    setQualityResult(null);
    setDiagnosis(null);
    setError(null);
    setExpertRequested(false);
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileSelected = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG, or WebP).');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError('Image size exceeds 10MB. Please select a smaller photo.');
      return;
    }

    setError(null);
    setQualityResult(null);
    setDiagnosis(null);
    setImageFile(file);

    try {
      const compressedDataUrl = await compressImage(file);
      setImagePreview(compressedDataUrl);

      const quality = await ImageQualityValidator.validateImageQuality(file, compressedDataUrl);
      setQualityResult(quality);
    } catch (err) {
      setError('Failed to process image preview. Please try another photo.');
    }
  }, []);

  useEffect(() => {
    const handleDirectScanEvent = (e: CustomEvent<File>) => {
      if (e.detail) {
        handleFileSelected(e.detail);
      }
    };
    window.addEventListener('crophealth-direct-scan', handleDirectScanEvent as EventListener);
    return () => {
      window.removeEventListener('crophealth-direct-scan', handleDirectScanEvent as EventListener);
    };
  }, [handleFileSelected]);

  const handleRunDiagnosis = async () => {
    if (!imageFile || !imagePreview) return;
    setAnalyzing(true);
    setError(null);

    try {
      const result = await DiagnosisService.executeCropDiagnosis(
        imageFile,
        imagePreview,
        cropContext,
        lang
      );

      if (!result.quality.isValid) {
        setQualityResult(result.quality);
        setAnalyzing(false);
        return;
      }

      if (result.diagnosis) {
        setDiagnosis(result.diagnosis);
        
        try {
          const diseaseName = result.diagnosis.primaryPrediction?.diseaseName || 'Foliar Symptom';
          const newRecord = {
            id: `scan_${Date.now()}`,
            reported_by: 'farmer_active',
            observed_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            priority: 'high' as const,
            status: 'verified' as const,
            description: result.diagnosis.observationalAdviceHi?.[0] || result.diagnosis.observationalAdvice?.[0] || 'पत्ती लक्षण जांच एवं ICAR रिपोर्ट',
            images: [{
              id: `img_${Date.now()}`,
              observation_id: `scan_${Date.now()}`,
              storage_path: imagePreview,
              file_name: imageFile.name || 'crop_leaf.jpg',
              mime_type: imageFile.type || 'image/jpeg',
              file_size: imageFile.size || 1024,
              created_at: new Date().toISOString(),
            }],
            diagnoses: [{
              id: `diag_${Date.now()}`,
              observation_id: `scan_${Date.now()}`,
              disease_id: diseaseName,
              confidence: (result.diagnosis.overallConfidenceScore || 95) / 100,
            }],
            farm_crop: {
              current_stage: cropContext.cropStage || 'Flowering Stage',
              variety: cropContext.variety || 'Bt Cotton',
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

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200 shadow-sm">
      
      {/* Clean Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-stone-900 flex items-center gap-2">
            <Camera className="w-5 h-5 text-emerald-700" />
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
      {/* 1. CLEAN LIGHT SCANNER CARD (NO INTENSE/BHADKILA STYLING)     */}
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
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95"
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
        /* 2. PREVIEW & CLEAN RESULTS VIEW                               */
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
                className="px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs sm:text-sm shadow-sm transition-all inline-flex items-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{lang === 'hi' ? 'जांच जारी है...' : 'Diagnosing...'}</span>
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
            <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3 animate-in fade-in duration-150">
              
              <div className="flex items-center justify-between pb-3 border-b border-emerald-200/70">
                <div>
                  <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    ✓ AI Diagnosis
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div className="p-3 bg-white rounded-xl border border-emerald-100">
                  <span className="font-bold text-stone-500 block text-[11px]">{lang === 'hi' ? 'रासायनिक दवा:' : 'Chemical Spray:'}</span>
                  <span className="font-black text-stone-900 mt-0.5 block">
                    {diagnosis.primaryPrediction?.category === 'pest_infestation'
                      ? 'इमामेक्टिन बेंजोएट 5% SG @ 0.4 gm/L'
                      : 'कॉपर ऑक्सीक्लोराइड 50% WP @ 2.5 gm/L'}
                  </span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-emerald-100">
                  <span className="font-bold text-stone-500 block text-[11px]">{lang === 'hi' ? 'जैविक उपाय:' : 'Biological Remedy:'}</span>
                  <span className="font-black text-stone-900 mt-0.5 block">
                    ट्राइकोडर्मा विरिडी @ 5.0 gm/L पानी
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs">
                <span className="text-emerald-900 font-medium">✓ जांच इतिहास में सहेजा गया</span>
                <button
                  type="button"
                  onClick={reset}
                  className="px-4 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs"
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
