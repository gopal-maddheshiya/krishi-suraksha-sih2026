import { useState, useRef, useCallback, useEffect } from 'react';
import { 
  Camera, ImageIcon, Loader2, CheckCircle2, AlertTriangle, 
  Send, X, MapPin, Sparkles, RefreshCw, ShieldAlert, ShieldCheck, 
  Info, UserCheck, HelpCircle, ChevronRight, Sprout
} from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';
import { 
  DiagnosisService, 
  ImageQualityValidator, 
  type ImageQualityResult, 
  type CropDiagnosisResponse, 
  type CropContext 
} from '@/services/DiagnosisService';
import { OFFICIAL_CROP_REGISTRY } from '@/services/DiseaseService';
import { LocationService } from '@/services/LocationService';
import { Section, SectionHeader, Card, PrimaryButton, SecondaryButton } from './ui';
import DiagnosisHistory from './DiagnosisHistory';

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
  
  // Quality check state
  const [qualityResult, setQualityResult] = useState<ImageQualityResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [diagnosis, setDiagnosis] = useState<CropDiagnosisResponse | null>(null);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [expertRequested, setExpertRequested] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Active Crop & Farm Context
  const [cropContext, setCropContext] = useState<CropContext>(() => {
    try {
      const activeFarmStr = localStorage.getItem('crophealth_active_farm');
      if (activeFarmStr) {
        const f = JSON.parse(activeFarmStr);
        return {
          farmId: f.id,
          cropName: f.crop?.name || 'Cotton',
          variety: f.crop?.variety || 'Bt Cotton',
          cropStage: f.crop?.stage || 'Vegetative Growth',
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
      cropStage: 'Vegetative Growth',
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
    setShowTechnicalDetails(false);
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

      // Pre-flight image quality check
      const quality = await ImageQualityValidator.validateImageQuality(file, compressedDataUrl);
      setQualityResult(quality);
    } catch (err) {
      setError('Failed to process image preview. Please try another photo.');
    }
  }, []);

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
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Diagnosis screening failed. Please retry.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleRequestExpertVerification = () => {
    setExpertRequested(true);
  };

  return (
    <Section id="report" tone="green">
      <SectionHeader 
        title={lang === 'hi' ? 'फसल पत्ती लक्षण पहचान (Check Crop)' : lang === 'mr' ? 'पीक रोग व कीड तपासणी' : 'Crop Symptom Identification'} 
        subtitle={lang === 'hi' ? 'प्रभावित पत्ती की स्पष्ट फोटो लें और प्रारंभिक लक्षण व अवलोकन सलाह पाएं' : 'Take a clear photo of the affected plant leaf for preliminary screening & next steps'} 
      />

      {error && (
        <div className="mb-5 mx-auto max-w-2xl">
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <span className="text-sm font-medium text-rose-900">{error}</span>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        <Card className="overflow-hidden">
          
          {/* UPLOAD / CAPTURE VIEW */}
          {!imagePreview ? (
            <div className="p-5 sm:p-7 space-y-4">
              
              {/* Primary Camera Capture Button */}
              <PrimaryButton
                tone="green"
                icon={<Camera className="w-5 h-5" />}
                onClick={() => cameraInputRef.current?.click()}
                className="w-full py-4 text-base shadow-md shadow-emerald-600/20"
              >
                {lang === 'hi' ? 'कैमरे से फोटो लें (Check Crop)' : lang === 'mr' ? 'कॅमेऱ्याने फोटो काढा' : 'Take Photo with Camera'}
              </PrimaryButton>

              {/* Drag & Drop / Gallery Picker */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDrop={(e) => {
                  e.preventDefault();
                  const f = e.dataTransfer.files[0];
                  if (f) handleFileSelected(f);
                }}
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed border-gray-200 rounded-2xl p-6 sm:p-8 text-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/30 transition-all"
              >
                <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <p className="text-sm sm:text-base text-gray-700 font-medium mb-1">
                  {lang === 'hi' ? 'गैलरी से फोटो चुनें या यहाँ खींचें' : 'Browse gallery or drag photo here'}
                </p>
                <p className="text-xs text-gray-400">Supports JPG, PNG, WebP (Max 10MB)</p>
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
            <div className="p-4 sm:p-6">
              
              {/* Image Preview Card */}
              <div className="relative rounded-2xl overflow-hidden mb-4 bg-gray-900 border border-gray-200">
                <img src={imagePreview} alt="Crop Leaf Preview" className="w-full max-h-72 sm:max-h-96 object-contain mx-auto" />
                <button
                  onClick={reset}
                  className="absolute top-3 right-3 p-2 rounded-full bg-white/95 hover:bg-white active:scale-95 shadow-md flex items-center justify-center text-gray-700 transition-all"
                  aria-label="Retake Photo"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Quality Check Feedback Banner */}
              {qualityResult && !qualityResult.isValid && (
                <div className="mb-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>
                      {lang === 'hi' ? 'फोटो स्पष्ट नहीं है' : 'Photo is not clear'}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed">
                    {lang === 'hi' ? qualityResult.userGuidanceMessageHi : qualityResult.userGuidanceMessage}
                  </p>
                  <div className="pt-1 flex gap-2">
                    <button
                      onClick={reset}
                      className="px-3 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700"
                    >
                      {lang === 'hi' ? 'दोबारा फोटो लें' : 'Retake Photo'}
                    </button>
                  </div>
                </div>
              )}

              {/* Pre-Diagnosis Context & Trigger */}
              {!diagnosis && !analyzing && (
                <div className="space-y-4">
                  <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-gray-400 block font-medium">Selected Crop Context:</span>
                      <span className="font-bold text-gray-800">{cropContext.cropName} ({cropContext.cropStage})</span>
                    </div>
                    <span className="text-emerald-700 font-semibold">{cropContext.locationDistrict}</span>
                  </div>

                  <PrimaryButton
                    tone="green"
                    icon={<Sparkles className="w-5 h-5" />}
                    onClick={handleRunDiagnosis}
                    disabled={qualityResult ? !qualityResult.isValid : false}
                    className="w-full py-4 text-base shadow-md shadow-emerald-600/20"
                  >
                    {lang === 'hi' ? 'AI लक्षण जांच करें (Analyze)' : 'Screen Leaf Symptoms'}
                  </PrimaryButton>
                </div>
              )}

              {/* Analyzing Loader */}
              {analyzing && (
                <div className="py-12 text-center space-y-3">
                  <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mx-auto" />
                  <p className="text-sm font-bold text-gray-800">
                    {lang === 'hi' ? 'पत्ती के लक्षणों का विश्लेषण हो रहा है...' : 'Evaluating leaf pathology features...'}
                  </p>
                  <p className="text-xs text-gray-400">Comparing with ICAR plant disease registry</p>
                </div>
              )}

              {/* DIAGNOSIS RESULT CARD */}
              {diagnosis && (
                <div className="space-y-4">
                  <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/40 border border-emerald-200/80 shadow-sm space-y-4">
                    
                    {/* Header with Suspected / Healthy Badge */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-600" />
                        <h3 className="font-extrabold text-emerald-950 text-base sm:text-lg">
                          {diagnosis.isHealthy 
                            ? (lang === 'hi' ? 'पौधा स्वस्थ प्रतीत होता है' : 'Healthy Plant Foliage')
                            : (lang === 'hi' ? 'संभावित समस्या पहचान (Preliminary)' : 'Possible Issue Detected')}
                        </h3>
                      </div>

                      <span
                        className={`text-xs font-black uppercase px-2.5 py-1 rounded-full ${
                          diagnosis.confidenceTier === 'high'
                            ? 'bg-emerald-100 text-emerald-800'
                            : diagnosis.confidenceTier === 'moderate'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {diagnosis.confidenceTier === 'high'
                          ? (lang === 'hi' ? 'उच्च संभावना' : 'High Confidence')
                          : diagnosis.confidenceTier === 'moderate'
                          ? (lang === 'hi' ? 'मध्यम संभावना' : 'Moderate Confidence')
                          : (lang === 'hi' ? 'अनिश्चित' : 'Low Confidence')}
                      </span>
                    </div>

                    {/* Primary Prediction Details */}
                    <div className="p-4 rounded-2xl bg-white border border-gray-200/80">
                      <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">
                        {lang === 'hi' ? 'पहचानी गई बीमारी / कीट' : 'Suspected Problem:'}
                      </div>
                      <div className="text-lg font-black text-gray-900">
                        {diagnosis.primaryPrediction.diseaseName}
                      </div>
                      {diagnosis.primaryPrediction.scientificName && (
                        <div className="text-xs text-gray-500 italic mt-0.5">
                          {diagnosis.primaryPrediction.scientificName}
                        </div>
                      )}
                    </div>

                    {/* Observational Next Steps */}
                    <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/60 space-y-2">
                      <div className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>{lang === 'hi' ? 'आपको अब क्या करना चाहिए (What to do next):' : 'What you should do now:'}</span>
                      </div>
                      <ul className="text-xs sm:text-sm text-emerald-950 space-y-1.5 list-disc list-inside font-medium leading-relaxed">
                        {(lang === 'hi' ? diagnosis.observationalAdviceHi : diagnosis.observationalAdvice).map((adv, idx) => (
                          <li key={idx}>{adv}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Non-Prescriptive Scientific Disclaimer */}
                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-[11px] text-gray-500 flex items-start gap-2">
                      <Info className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <span>{lang === 'hi' ? diagnosis.disclaimerHi : diagnosis.disclaimer}</span>
                    </div>

                    {/* Technical Details Toggle */}
                    <div className="pt-1">
                      <button
                        onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                        className="text-xs text-emerald-700 hover:text-emerald-800 font-bold underline"
                      >
                        {showTechnicalDetails ? 'Hide technical inference details' : 'See technical model details & alternatives'}
                      </button>

                      {showTechnicalDetails && (
                        <div className="mt-3 p-3.5 bg-gray-50 rounded-2xl border border-gray-100 text-xs space-y-2 animate-in fade-in duration-150">
                          <div className="flex justify-between text-gray-600">
                            <span>Model Engine:</span>
                            <span className="font-semibold">{diagnosis.modelName} ({diagnosis.modelVersion})</span>
                          </div>
                          <div className="flex justify-between text-gray-600">
                            <span>Confidence Score:</span>
                            <span className="font-semibold">{diagnosis.overallConfidenceScore}%</span>
                          </div>
                          {diagnosis.alternativePredictions.length > 0 && (
                            <div className="pt-2 border-t border-gray-200">
                              <span className="text-gray-400 font-bold block mb-1">Alternative Possibilities:</span>
                              {diagnosis.alternativePredictions.map((alt, i) => (
                                <div key={i} className="flex justify-between text-gray-700">
                                  <span>{alt.diseaseName}</span>
                                  <span>{alt.confidencePercentage}%</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="space-y-2.5 pt-2">
                    {!expertRequested ? (
                      <button
                        onClick={handleRequestExpertVerification}
                        className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all"
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>{lang === 'hi' ? 'KVK कृषि वैज्ञानिक से सत्यापन कराएं' : 'Send to KVK Agricultural Scientist for Verification'}</span>
                      </button>
                    ) : (
                      <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 font-semibold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>
                          {lang === 'hi'
                            ? 'अवलोकन KVK वैज्ञानिक सत्यापन कतार में भेज दिया गया है।'
                            : 'Observation has been sent to KVK Agriculture Expert Review Queue.'}
                        </span>
                      </div>
                    )}

                    <SecondaryButton
                      onClick={reset}
                      className="w-full py-3 text-xs sm:text-sm font-bold"
                    >
                      {lang === 'hi' ? 'दूसरे पौधे की जांच करें (Check Another Plant)' : 'Check Another Plant'}
                    </SecondaryButton>
                  </div>

                </div>
              )}

            </div>
          )}

        </Card>

        {/* Diagnosis & Crop Checks History */}
        <DiagnosisHistory />

      </div>
    </Section>
  );
}
