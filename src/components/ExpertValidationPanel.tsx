import { useState, useEffect } from 'react';
import { 
  UserCheck, CheckCircle2, XCircle, HelpCircle, 
  Clock, MapPin, ZoomIn, ZoomOut, RotateCcw, 
  Sparkles, CloudRain, Thermometer, Droplets, 
  Send, AlertTriangle, ShieldCheck, X, Filter, Sprout, Tractor
} from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';
import { supabase } from '@/lib/supabase';
import { ObservationService, type CropObservationEntity } from '@/services/ObservationService';
import { WeatherService } from '@/services/WeatherService';
import type { WeatherDataBundle } from '@/services/types';
import { Section, SectionHeader, Card, PrimaryButton, SecondaryButton } from './ui';

export default function ExpertValidationPanel() {
  const { lang, t } = useLang();
  const [queue, setQueue] = useState<CropObservationEntity[]>([]);
  const [selectedObs, setSelectedObs] = useState<CropObservationEntity | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'submitted' | 'processing' | 'verified' | 'pending_expert' | 'diagnosed'>('all');

  // Review Form State
  const [decision, setDecision] = useState<'confirmed' | 'rejected' | 'needs_more_information'>('confirmed');
  const [diagnosisCategory, setDiagnosisCategory] = useState<'disease' | 'pest' | 'nutrient_deficiency' | 'healthy' | 'unable_to_determine'>('disease');
  const [expertDiagnosis, setExpertDiagnosis] = useState('');
  const [affectedPart, setAffectedPart] = useState<'leaf' | 'stem' | 'fruit_boll' | 'flower' | 'root' | 'whole_plant'>('leaf');
  const [severity, setSeverity] = useState<'low' | 'moderate' | 'severe'>('moderate');
  const [requestedInfo, setRequestedInfo] = useState('Upload a clearer close-up photograph of the leaf underside.');
  const [expertComments, setExpertComments] = useState('');
  const [expertInstructions, setExpertInstructions] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Evidence Image Zoom & Pan State
  const [zoomLevel, setZoomLevel] = useState(1);
  const [weatherContext, setWeatherContext] = useState<WeatherDataBundle | null>(null);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const data = await ObservationService.getExpertReviewQueue(filter);
      setQueue(data);
    } catch (e) {
      console.warn('Queue fetch error:', e);
      setQueue([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [filter]);

  const handleOpenReview = async (obs: CropObservationEntity) => {
    setSelectedObs(obs);
    setZoomLevel(1);
    setSubmitSuccess(false);

    // Pre-populate diagnosis from AI prediction if available
    const topDiag = obs.diagnoses?.[0];
    if (topDiag) {
      setExpertDiagnosis(topDiag.disease?.name || topDiag.pest?.name || 'Cotton Bacterial Blight');
    } else {
      setExpertDiagnosis(`${obs.farm_crop?.crop?.name || 'Crop'} Foliar Issue`);
    }

    // Load current weather context if coordinates are present
    if (obs.latitude && obs.longitude) {
      try {
        const weather = await WeatherService.fetchRealWeather({
          latitude: obs.latitude,
          longitude: obs.longitude,
          district: obs.farm?.district || 'Farm Location',
          state: obs.farm?.state || 'Maharashtra',
          source: 'gps',
        });
        setWeatherContext(weather);
      } catch {
        setWeatherContext(null);
      }
    }
  };

  const handleClaim = async (obsId: string) => {
    const { data: authData } = await supabase.auth.getUser();
    const expertId = authData.user?.id || '00000000-0000-0000-0000-000000000001';
    await ObservationService.claimObservation(obsId, expertId);
    fetchQueue();
  };

  const handleSubmitReview = async () => {
    if (!selectedObs) return;
    setSubmitting(true);

    try {
      const { data: authData } = await supabase.auth.getUser();
      const expertId = authData.user?.id || '00000000-0000-0000-0000-000000000001';

      await ObservationService.submitExpertReview({
        observation_id: selectedObs.id,
        diagnosis_id: selectedObs.diagnoses?.[0]?.id,
        expert_id: expertId,
        decision,
        expert_diagnosis: expertDiagnosis,
        diagnosis_category: diagnosisCategory,
        affected_plant_part: affectedPart,
        severity,
        requested_information: decision === 'needs_more_information' ? requestedInfo : undefined,
        comments: expertComments || undefined,
        recommended_action: expertInstructions || undefined,
      });

      setSubmitSuccess(true);
      setTimeout(() => {
        setSelectedObs(null);
        fetchQueue();
      }, 1200);
    } catch (err) {
      console.error('Submit review error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Queue Counters
  const pendingCount = queue.filter((q) => q.status === 'submitted' || q.status === 'pending_expert').length;
  const inReviewCount = queue.filter((q) => q.status === 'processing').length;
  const verifiedCount = queue.filter((q) => q.status === 'verified').length;

  return (
    <Section id="expert" tone="indigo">
      <SectionHeader 
        title={lang === 'hi' ? 'कृषि विशेषज्ञ समीक्षा पोर्टल' : 'Agricultural Expert Review Portal'} 
        subtitle={lang === 'hi' ? 'किसानों द्वारा भेजे गए फसल रोग लक्षणों की विशेषज्ञ समीक्षा एवं सत्यापन' : 'Review queue for agricultural experts and agronomists'} 
      />

      {/* Top Counter Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-6 max-w-5xl mx-auto">
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-950">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-700">Pending Review</div>
          <div className="text-2xl font-black mt-1">{pendingCount}</div>
        </div>
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200/80 text-blue-950">
          <div className="text-xs font-bold uppercase tracking-wider text-blue-700">In Review</div>
          <div className="text-2xl font-black mt-1">{inReviewCount}</div>
        </div>
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-950">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">Verified</div>
          <div className="text-2xl font-black mt-1">{verifiedCount}</div>
        </div>
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 text-gray-900">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-500">Total Queue</div>
          <div className="text-2xl font-black mt-1">{queue.length}</div>
        </div>
      </div>

      {/* Queue Filter Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-5 max-w-5xl mx-auto">
        {[
          { id: 'all', label: 'All Observations' },
          { id: 'submitted', label: 'Pending Review' },
          { id: 'processing', label: 'In Review' },
          { id: 'verified', label: 'Verified' },
          { id: 'pending_expert', label: 'Needs Info' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              filter === tab.id
                ? 'bg-indigo-700 text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Observation Queue Table / Cards */}
      <div className="max-w-5xl mx-auto space-y-3.5">
        {loading && (
          <div className="py-16 text-center text-sm font-semibold text-gray-500">
            Loading review queue from Supabase database...
          </div>
        )}

        {!loading && queue.length === 0 && (
          <div className="py-16 text-center rounded-3xl bg-gray-50 border border-dashed border-gray-200 p-8">
            <UserCheck className="w-10 h-10 text-gray-400 mx-auto mb-2" />
            <div className="font-bold text-gray-700 text-base">No observations in this queue.</div>
            <p className="text-xs text-gray-400 mt-1">Farmer submissions will appear here for expert review.</p>
          </div>
        )}

        {!loading && queue.map((obs) => {
          const topDiag = obs.diagnoses?.[0];
          const isVerified = obs.status === 'verified';
          const isProcessing = obs.status === 'processing';
          const submittedAt = new Date(obs.observed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          return (
            <div
              key={obs.id}
              className="p-4 sm:p-5 rounded-3xl bg-white border border-gray-200/80 shadow-sm hover:border-indigo-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0 text-indigo-700 font-black">
                  <Sprout className="w-6 h-6" />
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-gray-900 text-base">
                      {obs.farm_crop?.crop?.name || 'Crop Observation'}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">
                      ({obs.farm_crop?.current_stage || 'Stage: Vegetative'})
                    </span>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        obs.priority === 'high' || obs.priority === 'critical'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {obs.priority} Priority
                    </span>
                  </div>

                  <div className="text-xs text-gray-600 mt-1 flex items-center gap-2 flex-wrap">
                    <span className="flex items-center gap-1 font-semibold text-emerald-800">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      AI Suspected: {topDiag?.disease?.name || topDiag?.pest?.name || 'Foliar Infection'}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      {obs.farm?.district || 'Location'}, {obs.farm?.state || 'MH'}
                    </span>
                    <span>•</span>
                    <span className="text-gray-400">{submittedAt}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {isProcessing ? (
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200">
                    In Review
                  </span>
                ) : isVerified ? (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                  </span>
                ) : (
                  <button
                    onClick={() => handleClaim(obs.id)}
                    className="px-3 py-2 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-50"
                  >
                    Claim
                  </button>
                )}

                <button
                  onClick={() => handleOpenReview(obs)}
                  className="px-4 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold shadow-sm transition-all"
                >
                  Review Case
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* FULL EXPERT REVIEW MODAL */}
      {selectedObs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-gray-950/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="bg-indigo-900 text-white p-4 sm:p-5 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <UserCheck className="w-5 h-5 text-indigo-300" />
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base">
                    Agricultural Case Review • Obs #{selectedObs.id.substring(0, 8)}
                  </h3>
                  <div className="text-[11px] text-indigo-200">
                    {selectedObs.farm_crop?.crop?.name} • {selectedObs.farm?.farm_name} ({selectedObs.farm?.district}, {selectedObs.farm?.state})
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedObs(null)}
                className="p-1.5 rounded-full hover:bg-white/10 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: 2 Columns */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* Left Column: Image Viewer & Weather Context */}
              <div className="lg:col-span-5 space-y-4">
                
                {/* Evidence Image with Zoom controls */}
                <div className="relative rounded-2xl overflow-hidden bg-gray-950 border border-gray-200">
                  <div className="w-full h-64 sm:h-72 overflow-hidden flex items-center justify-center">
                    {(() => {
                      const p = selectedObs.images?.[0]?.storage_path;
                      const imgSrc = !p
                        ? '/images/sample-cotton.jpg'
                        : p.startsWith('/') || p.startsWith('http') || p.startsWith('data:')
                        ? p
                        : `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/crop-observations/${p}`;
                      return (
                        <img
                          src={imgSrc}
                          alt="Evidence Leaf"
                          style={{ transform: `scale(${zoomLevel})`, transition: 'transform 0.2s ease-out' }}
                          className="max-h-full max-w-full object-contain"
                        />
                      );
                    })()}
                  </div>

                  {/* Zoom Pan Floating Toolbar */}
                  <div className="absolute bottom-2 right-2 bg-gray-900/80 backdrop-blur-md rounded-xl p-1 flex items-center gap-1 text-white text-xs border border-white/10">
                    <button
                      onClick={() => setZoomLevel((z) => Math.max(1, z - 0.25))}
                      className="p-1.5 hover:bg-white/20 rounded-lg"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-1 font-mono">{Math.round(zoomLevel * 100)}%</span>
                    <button
                      onClick={() => setZoomLevel((z) => Math.min(3, z + 0.25))}
                      className="p-1.5 hover:bg-white/20 rounded-lg"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setZoomLevel(1)}
                      className="p-1.5 hover:bg-white/20 rounded-lg"
                      title="Reset Zoom"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* AI Screening Summary (Preserved Candidate Record) */}
                <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs space-y-1.5">
                  <div className="font-bold text-amber-900 flex items-center gap-1.5 uppercase tracking-wide text-[10px]">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    Candidate AI Screening (Preserved for Evaluation)
                  </div>
                  <div className="font-extrabold text-amber-950 text-sm">
                    {selectedObs.diagnoses?.[0]?.disease?.name || selectedObs.diagnoses?.[0]?.pest?.name || 'Foliar Blight'}
                  </div>
                  <div className="text-amber-800 text-[11px] flex justify-between">
                    <span>Engine: {selectedObs.diagnoses?.[0]?.model_name || 'AgriVision Vision Engine'}</span>
                    <span>Confidence: {selectedObs.diagnoses?.[0]?.confidence || 75}%</span>
                  </div>
                </div>

                {/* Current Weather Context (Open-Meteo) */}
                {weatherContext && (
                  <div className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-200/80 text-xs space-y-2">
                    <div className="font-bold text-sky-900 flex items-center gap-1.5 uppercase tracking-wide text-[10px]">
                      <CloudRain className="w-3.5 h-3.5 text-sky-600" />
                      Current Weather Context (Open-Meteo Feed)
                    </div>
                    <div className="grid grid-cols-3 gap-1 text-center font-bold text-sky-950">
                      <div className="p-1.5 bg-white/70 rounded-xl">
                        <div className="text-[10px] text-gray-400 font-normal">Temp</div>
                        {weatherContext.current.temperatureC}°C
                      </div>
                      <div className="p-1.5 bg-white/70 rounded-xl">
                        <div className="text-[10px] text-gray-400 font-normal">Humidity</div>
                        {weatherContext.current.relativeHumidityPct}%
                      </div>
                      <div className="p-1.5 bg-white/70 rounded-xl">
                        <div className="text-[10px] text-gray-400 font-normal">Rain</div>
                        {weatherContext.current.precipitationMm} mm
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Right Column: Expert Structured Form */}
              <div className="lg:col-span-7 space-y-4">
                
                {submitSuccess ? (
                  <div className="py-16 text-center space-y-2 bg-emerald-50 rounded-3xl p-6 border border-emerald-200">
                    <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                    <div className="font-bold text-emerald-950 text-lg">Expert Review Successfully Submitted!</div>
                    <p className="text-xs text-emerald-700">Review status and candidate record updated in database.</p>
                  </div>
                ) : (
                  <>
                    {/* Structured Decision Selector */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        Expert Review Decision
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'confirmed', label: 'Confirm Diagnosis', icon: CheckCircle2, color: 'text-emerald-700 border-emerald-500 bg-emerald-50' },
                          { id: 'rejected', label: 'Reject / Correct', icon: XCircle, color: 'text-rose-700 border-rose-500 bg-rose-50' },
                          { id: 'needs_more_information', label: 'Needs More Info', icon: HelpCircle, color: 'text-amber-700 border-amber-500 bg-amber-50' },
                        ].map((d) => (
                          <button
                            key={d.id}
                            onClick={() => setDecision(d.id as any)}
                            className={`p-2.5 rounded-2xl border text-xs font-bold text-center flex flex-col items-center gap-1 transition-all ${
                              decision === d.id
                                ? d.color
                                : 'border-gray-200 text-gray-600 bg-gray-50/50 hover:bg-white'
                            }`}
                          >
                            <d.icon className="w-4 h-4" />
                            <span>{d.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Expert Diagnosis Field */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                        Expert Diagnosis / Identification
                      </label>
                      <input
                        type="text"
                        value={expertDiagnosis}
                        onChange={(e) => setExpertDiagnosis(e.target.value)}
                        placeholder="e.g. Cotton Bacterial Blight (Xanthomonas)"
                        className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-semibold text-gray-900 outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 mb-1">Category</label>
                        <select
                          value={diagnosisCategory}
                          onChange={(e) => setDiagnosisCategory(e.target.value as any)}
                          className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-semibold outline-none"
                        >
                          <option value="disease">Fungal / Bacterial Disease</option>
                          <option value="pest">Insect Pest Damage</option>
                          <option value="nutrient_deficiency">Nutrient Deficiency</option>
                          <option value="healthy">Healthy Leaf</option>
                          <option value="unable_to_determine">Unable to Determine</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 mb-1">Affected Part</label>
                        <select
                          value={affectedPart}
                          onChange={(e) => setAffectedPart(e.target.value as any)}
                          className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-semibold outline-none"
                        >
                          <option value="leaf">Leaf Foliage</option>
                          <option value="stem">Stem / Branch</option>
                          <option value="flower">Flower / Bud</option>
                          <option value="fruit_boll">Fruit / Boll</option>
                          <option value="root">Root / Collar</option>
                          <option value="whole_plant">Whole Plant</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 mb-1">Severity</label>
                        <select
                          value={severity}
                          onChange={(e) => setSeverity(e.target.value as any)}
                          className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-semibold outline-none"
                        >
                          <option value="low">Low (Trace)</option>
                          <option value="moderate">Moderate</option>
                          <option value="severe">Severe (Critical)</option>
                        </select>
                      </div>
                    </div>

                    {decision === 'needs_more_information' && (
                      <div>
                        <label className="block text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">
                          Requested Information from Farmer
                        </label>
                        <select
                          value={requestedInfo}
                          onChange={(e) => setRequestedInfo(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-amber-200 bg-amber-50 text-xs font-semibold text-amber-900 outline-none"
                        >
                          <option value="Upload a clearer close-up photograph of the leaf underside.">Upload a clearer close-up of leaf underside.</option>
                          <option value="Upload a full-canopy wide photo of the affected plant.">Upload a full-canopy wide photo of the plant.</option>
                          <option value="Please specify how many days ago the symptoms first appeared.">Specify how many days ago symptoms appeared.</option>
                        </select>
                      </div>
                    )}

                    {/* Expert Comments / Scientific Notes */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                        Diagnostic Reasoning & Observations
                      </label>
                      <textarea
                        rows={2}
                        value={expertComments}
                        onChange={(e) => setExpertComments(e.target.value)}
                        placeholder="e.g. Angular water-soaked lesions bounded by veins indicate Xanthomonas..."
                        className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-xs text-gray-900 outline-none focus:border-indigo-500"
                      />
                    </div>

                    {/* Prescriptive Farmer Instructions */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                        Recommended Farmer Action Plan
                      </label>
                      <textarea
                        rows={2}
                        value={expertInstructions}
                        onChange={(e) => setExpertInstructions(e.target.value)}
                        placeholder="e.g. Improve field drainage. Apply recommended copper-based formulation in accordance with university guidance..."
                        className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-xs text-gray-900 outline-none focus:border-indigo-500"
                      />
                    </div>

                    {/* Submit Review Button */}
                    <button
                      onClick={handleSubmitReview}
                      disabled={submitting}
                      className="w-full py-3.5 px-4 rounded-2xl bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-indigo-700/20 transition-all disabled:opacity-75"
                    >
                      <Send className="w-4 h-4" />
                      <span>{submitting ? 'Submitting Review...' : 'Submit Expert Review'}</span>
                    </button>
                  </>
                )}

              </div>

            </div>

          </div>
        </div>
      )}
    </Section>
  );
}
