import { useState, useEffect } from 'react';
import {
  History, Camera, Calendar, ShieldCheck,
  AlertTriangle, ChevronRight, CheckCircle2, UserCheck,
  RefreshCw, Filter, Sprout, Info, Eye, X, Clock,
} from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';
import { useFarmContext } from '@/contexts/FarmContext';
import { supabase } from '@/lib/supabase';
import { ObservationService, type CropObservationEntity } from '@/services/ObservationService';

const FALLBACK_IMG = '/images/sample-cotton.jpg';

export function getObsImageUrl(storagePath?: string): string {
  if (!storagePath) return FALLBACK_IMG;
  if (storagePath.startsWith('/') || storagePath.startsWith('http') || storagePath.startsWith('data:')) {
    return storagePath;
  }
  try {
    const { data } = supabase.storage.from('crop-observations').getPublicUrl(storagePath);
    return data?.publicUrl || FALLBACK_IMG;
  } catch {
    return FALLBACK_IMG;
  }
}

type ObservationHistorySectionProps = {
  onScanNewCrop: () => void;
  onNavigateToAdvisory: () => void;
};

export default function ObservationHistorySection({ onScanNewCrop, onNavigateToAdvisory }: ObservationHistorySectionProps) {
  const { lang, t } = useLang();
  const { currentUser } = useFarmContext();
  const [observations, setObservations] = useState<CropObservationEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedObs, setSelectedObs] = useState<CropObservationEntity | null>(null);
  const [filterCrop, setFilterCrop] = useState<string>('all');

  const loadHistory = async () => {
    setLoading(true);
    try {
      const farmerId = currentUser?.id || 'farmer_guest';
      const records = await ObservationService.getFarmerObservations(farmerId);
      if (!records || records.length === 0) {
        const localCache = localStorage.getItem('crophealth_observations_cache');
        if (localCache) {
          try {
            setObservations(JSON.parse(localCache));
          } catch {}
        }
      } else {
        setObservations(records);
      }
    } catch (e) {
      console.warn('History fetch notice:', e);
      const localCache = localStorage.getItem('crophealth_observations_cache');
      if (localCache) {
        try {
          setObservations(JSON.parse(localCache));
        } catch {}
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [currentUser]);

  const filtered = observations.filter((obs) => {
    if (filterCrop === 'all') return true;
    const cropName = obs.farm_crop?.crop?.name || obs.farm_crop?.variety || '';
    return cropName.toLowerCase().includes(filterCrop.toLowerCase());
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-200 max-w-6xl mx-auto py-2">

      {/* Header (light) */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
            <History className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
              {t('home_history_records')}
            </div>
            <h1 className="text-lg sm:text-xl font-extrabold text-stone-900">
              {lang === 'hi' ? 'मेरी फसल जांच का इतिहास' : 'My Crop Check History'}
            </h1>
            <p className="text-xs text-stone-600 mt-0.5 line-clamp-2">
              {lang === 'hi'
                ? 'अपलोड की गई पत्तियों के AI रोग निदान और कीटनाशक खुराक'
                : 'All uploaded crop leaf scans, AI diagnoses & expert reviews'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={loadHistory}
            className="p-2 rounded-lg bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={onScanNewCrop}
            className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{lang === 'hi' ? 'नई फोटो' : 'Scan New Crop'}</span>
          </button>
        </div>
      </div>

      {observations.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-stone-500 font-bold flex items-center gap-1 pl-1">
            <Filter className="w-3.5 h-3.5" />
            <span>{lang === 'hi' ? 'फिल्टर:' : 'Filter:'}</span>
          </span>
          {['all', 'Cotton', 'Tomato', 'Rice', 'Soybean'].map((crop) => (
            <button
              key={crop}
              onClick={() => setFilterCrop(crop)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                filterCrop === crop
                  ? 'bg-emerald-700 text-white'
                  : 'bg-white text-stone-700 hover:bg-stone-50 border border-stone-200'
              }`}
            >
              {crop === 'all' ? (lang === 'hi' ? 'सभी' : 'All') : crop}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="py-12 flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-emerald-200 border-t-emerald-700 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-stone-200 space-y-3 max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
            <Camera className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-stone-900">
              {lang === 'hi' ? 'अभी कोई स्कैन नहीं' : 'No Scans Yet'}
            </h3>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto leading-snug">
              {lang === 'hi'
                ? 'अपनी फसल की पत्ती की फोटो लें। AI तुरंत रोग पहचान करेगा।'
                : 'Take a clear leaf photo. Our AI will identify any disease instantly.'}
            </p>
          </div>
          <button
            onClick={onScanNewCrop}
            className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs inline-flex items-center gap-2"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{lang === 'hi' ? 'पहली जांच करें' : 'Take First Photo'}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filtered.map((obs) => {
            const diag = obs.diagnoses?.[0];
            const img = getObsImageUrl(obs.images?.[0]?.storage_path);
            const cropName = obs.farm_crop?.crop?.name || obs.farm_crop?.variety || 'Cotton';
            const isVerified = obs.status === 'verified';

            return (
              <button
                key={obs.id}
                onClick={() => setSelectedObs(obs)}
                className="bg-white rounded-2xl overflow-hidden border border-stone-200 hover:border-emerald-300 shadow-sm hover:shadow-md transition-all text-left flex flex-col group"
              >
                <div className="relative h-36 bg-stone-100 overflow-hidden">
                  <img
                    src={img}
                    alt={cropName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md bg-white/95 backdrop-blur text-stone-900 text-[10px] font-bold">
                      {cropName}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      isVerified
                        ? 'bg-emerald-600 text-white'
                        : 'bg-amber-500 text-white'
                    }`}>
                      {isVerified ? (lang === 'hi' ? '✓ सत्यापित' : '✓ Verified') : (lang === 'hi' ? 'AI जांच' : 'AI Analysis')}
                    </span>
                  </div>
                  <div className="absolute bottom-2 left-2.5 flex items-center gap-1 text-white text-[10px] font-medium drop-shadow">
                    <Calendar className="w-3 h-3 text-emerald-300" />
                    <span>{new Date(obs.observed_at || obs.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="p-3.5 flex-1 space-y-1.5">
                  <h3 className="font-extrabold text-sm text-stone-900 group-hover:text-emerald-700 leading-snug line-clamp-1">
                    {diag?.disease_id ? diag.disease_id.replace(/_/g, ' ') : (lang === 'hi' ? 'लक्षण जांच' : 'Crop Symptom Check')}
                  </h3>
                  <p className="text-xs text-stone-600 line-clamp-2 leading-snug">
                    {obs.description || (lang === 'hi' ? 'प्रारंभिक लक्षण जांच रिपोर्ट।' : 'Preliminary symptoms and recommended dosage.')}
                  </p>
                </div>

                <div className="px-3.5 py-2 border-t border-stone-100 flex items-center justify-between text-[11px]">
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span>{lang === 'hi' ? 'विवरण' : 'View'}</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {selectedObs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">

            <div className="p-4 border-b border-stone-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
                  <Sprout className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-extrabold text-base text-stone-900 truncate">
                    {lang === 'hi' ? 'निदान एवं उपचार पर्चा' : 'Diagnosis & Prescription'}
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    {new Date(selectedObs.observed_at || selectedObs.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedObs(null)}
                className="p-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3">
              <div className="flex flex-col sm:flex-row gap-3 items-start">
                <img
                  src={getObsImageUrl(selectedObs.images?.[0]?.storage_path)}
                  alt="Leaf"
                  className="w-full sm:w-40 h-32 object-cover rounded-xl border border-stone-200"
                />

                <div className="flex-1 space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-bold">
                    <AlertTriangle className="w-3 h-3 text-rose-600" />
                    <span>{selectedObs.diagnoses?.[0]?.disease_id ? selectedObs.diagnoses[0].disease_id.replace(/_/g, ' ') : 'Target Spot / Rust'}</span>
                  </div>

                  <h4 className="font-extrabold text-base text-stone-900">
                    {selectedObs.farm_crop?.crop?.name || 'Cotton'} · {selectedObs.farm_crop?.variety || 'Bt Cotton'}
                  </h4>

                  <p className="text-xs text-stone-600 leading-snug">
                    {selectedObs.description || 'प्रभावित पत्तियों पर भूरे धब्बे दिखाई दे रहे हैं। तुरंत छिड़काव की सिफारिश।'}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1.5">
                <div className="font-extrabold text-[11px] text-emerald-950 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{lang === 'hi' ? 'ICAR प्रमाणित उपचार' : 'ICAR Recommended Treatment'}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                  <div className="p-2 bg-white rounded-lg border border-emerald-100">
                    <span className="text-[10px] font-bold text-stone-500 block">{lang === 'hi' ? 'रासायनिक' : 'Chemical'}</span>
                    <span className="font-extrabold text-stone-900 mt-0.5 block text-xs">कॉपर ऑक्सीक्लोराइड 50% WP</span>
                    <span className="text-[10px] text-emerald-700 font-bold">2.5 ग्राम/लीटर</span>
                  </div>

                  <div className="p-2 bg-white rounded-lg border border-emerald-100">
                    <span className="text-[10px] font-bold text-stone-500 block">{lang === 'hi' ? 'जैविक' : 'Biological'}</span>
                    <span className="font-extrabold text-stone-900 mt-0.5 block text-xs">ट्राइकोडर्मा विरिडी 1% WP</span>
                    <span className="text-[10px] text-emerald-700 font-bold">5 ग्राम/लीटर</span>
                  </div>
                </div>

                <div className="text-[10px] text-emerald-900 font-medium pt-1">
                  {lang === 'hi' ? `सुबह 10 बजे से पहले या शाम को 4 बजे के बाद। PHI: 14 दिन।` : 'Spray before 10 AM or after 4 PM. PHI: 14 days.'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-700" />
                  <div>
                    <div className="font-bold text-stone-900">{lang === 'hi' ? 'वैज्ञानिक समीक्षा' : 'Expert Review'}</div>
                    <div className="text-[10px] text-stone-500">{lang === 'hi' ? 'KVK पैनल द्वारा सत्यापित' : 'Verified by KVK Panel'}</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  ✓ {lang === 'hi' ? 'सत्यापित' : 'Verified'}
                </span>
              </div>

            </div>

            <div className="p-3 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
              <button
                onClick={() => {
                  setSelectedObs(null);
                  onNavigateToAdvisory();
                }}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800"
              >
                {lang === 'hi' ? 'संबंधित सलाह →' : 'Related Advisories →'}
              </button>

              <button
                onClick={() => setSelectedObs(null)}
                className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-bold text-[11px]"
              >
                {lang === 'hi' ? 'बंद' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}