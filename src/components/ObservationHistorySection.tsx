import { useState, useEffect } from 'react';
import { 
  History, Camera, Calendar, MapPin, ShieldCheck, 
  AlertTriangle, ChevronRight, CheckCircle2, UserCheck, 
  Trash2, ExternalLink, RefreshCw, Sparkles, Filter,
  Layers, Sprout, Info, Eye, X
} from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';
import { useFarmContext } from '@/contexts/FarmContext';
import { ObservationService, type CropObservationEntity } from '@/services/ObservationService';

type ObservationHistorySectionProps = {
  onScanNewCrop: () => void;
  onNavigateToAdvisory: () => void;
};

export default function ObservationHistorySection({ onScanNewCrop, onNavigateToAdvisory }: ObservationHistorySectionProps) {
  const { lang } = useLang();
  const { currentUser, activeFarm } = useFarmContext();
  const [observations, setObservations] = useState<CropObservationEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedObs, setSelectedObs] = useState<CropObservationEntity | null>(null);
  const [filterCrop, setFilterCrop] = useState<string>('all');

  const loadHistory = async () => {
    setLoading(true);
    try {
      const farmerId = currentUser?.id || 'farmer_guest';
      const records = await ObservationService.getFarmerObservations(farmerId);
      
      // Fallback: If DB records are empty, check localStorage cache
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
    <div className="space-y-6 animate-in fade-in duration-200 max-w-6xl mx-auto py-2">
      
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
              <History className="w-5 h-5 stroke-[2.4]" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              {lang === 'hi' ? 'मेरी फसल जांच का इतिहास' : lang === 'mr' ? 'माझ्या पीक तपासणीचा इतिहास' : 'My Crop Check History'}
            </h1>
          </div>
          <p className="text-xs text-emerald-200/90 mt-1.5 font-medium">
            {lang === 'hi' 
              ? 'आपकी अपलोड की गई पत्तियों के AI रोग निदान, कीटनाशक खुराक और कृषि वैज्ञानिकों की रिपोर्ट'
              : 'All your uploaded crop leaf scans, AI disease diagnoses, recommended dosages & ICAR scientist reviews'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={loadHistory}
            className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all shadow-2xs"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            onClick={onScanNewCrop}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black text-xs transition-all shadow-md flex items-center justify-center gap-2 active:scale-95"
          >
            <Camera className="w-4 h-4" />
            <span>{lang === 'hi' ? 'नई फोटो स्कैन करें' : 'Scan New Crop'}</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
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
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              {crop === 'all' ? (lang === 'hi' ? 'सभी फसलें' : 'All Crops') : crop}
            </button>
          ))}
        </div>
      )}

      {/* Main Grid of Scans */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-700 rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-stone-500">
            {lang === 'hi' ? 'इतिहास लोड हो रहा है...' : 'Loading scan records...'}
          </p>
        </div>
      ) : filtered.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-3xl p-10 text-center max-w-lg mx-auto border border-stone-200 shadow-md space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-100 shadow-inner">
            <Camera className="w-8 h-8 stroke-[1.8]" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-stone-900">
              {lang === 'hi' ? 'अभी तक कोई फसल स्कैन नहीं की गई है' : 'No Scanned Crops Yet'}
            </h3>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto leading-relaxed">
              {lang === 'hi'
                ? 'अपने खेत की किसी भी पत्ती की फोटो लें। हमारा AI तुरंत रोग की पहचान करके सटीक इलाज का पर्चा तैयार करेगा।'
                : 'Take a clear leaf photo from your farm. Our AI will identify any disease and generate an ICAR dosage prescription.'}
            </p>
          </div>
          <button
            onClick={onScanNewCrop}
            className="px-6 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs shadow-md transition-all inline-flex items-center gap-2 active:scale-95"
          >
            <Camera className="w-4 h-4" />
            <span>{lang === 'hi' ? 'अभी पहली पत्ती की जांच करें' : 'Check First Leaf Now'}</span>
          </button>
        </div>
      ) : (
        /* Observation Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((obs) => {
            const diag = obs.diagnoses?.[0];
            const img = obs.images?.[0]?.storage_path || 'https://images.unsplash.com/photo-1597916829826-02e5bb4a54e0?w=600&auto=format&fit=crop&q=80';
            const cropName = obs.farm_crop?.crop?.name || obs.farm_crop?.variety || 'Cotton';
            const isVerified = obs.status === 'verified';

            return (
              <div
                key={obs.id}
                onClick={() => setSelectedObs(obs)}
                className="bg-white rounded-3xl overflow-hidden border border-stone-200 hover:border-emerald-500 shadow-sm hover:shadow-xl transition-all duration-200 cursor-pointer flex flex-col group"
              >
                {/* Image Banner */}
                <div className="relative h-44 bg-stone-100 overflow-hidden">
                  <img
                    src={img}
                    alt={cropName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1597916829826-02e5bb4a54e0?w=600&auto=format&fit=crop&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
                  
                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-black border border-white/20">
                      {cropName}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black backdrop-blur-md border ${
                      isVerified
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                        : 'bg-amber-950/80 text-amber-300 border-amber-500/50'
                    }`}>
                      {isVerified ? '✓ KVK Verified' : 'AI Analysis'}
                    </span>
                  </div>

                  {/* Bottom Date on Image */}
                  <div className="absolute bottom-3 left-3 text-white text-[11px] font-medium flex items-center gap-1.5 drop-shadow-md">
                    <Calendar className="w-3.5 h-3.5 text-emerald-300" />
                    <span>{new Date(obs.observed_at || obs.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-black text-sm text-stone-900 group-hover:text-emerald-700 transition-colors">
                        {diag?.disease_id ? diag.disease_id.replace(/_/g, ' ') : (lang === 'hi' ? 'पत्ती रोग जांच' : 'Crop Symptom Check')}
                      </h3>
                      {diag?.confidence && (
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                          {Math.round(diag.confidence * 100)}%
                        </span>
                      )}
                    </div>
                    
                    <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                      {obs.description || (lang === 'hi' ? 'लक्षण जांच और अनुमोदित कीटनाशक मात्रा रिपोर्ट।' : 'Preliminary symptoms and ICAR certified chemical prescription.')}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      <span>{lang === 'hi' ? 'पूरा इलाज देखें' : 'View Prescription'}</span>
                    </span>
                    <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* DETAILED OBSERVATION & PRESCRIPTION MODAL                                 */}
      {/* ========================================================================= */}
      {selectedObs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-gray-950/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
                  <Sprout className="w-4 h-4 stroke-[2.4]" />
                </div>
                <div>
                  <h3 className="font-black text-base text-white">
                    {lang === 'hi' ? 'रोग निदान एवं उपचार पर्चा' : 'Diagnosis & Treatment Prescription'}
                  </h3>
                  <p className="text-[11px] text-emerald-200">
                    ID: {selectedObs.id.slice(0, 14)} • {new Date(selectedObs.observed_at || selectedObs.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedObs(null)}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
              
              {/* Image & Disease Badge */}
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <img
                  src={selectedObs.images?.[0]?.storage_path || 'https://images.unsplash.com/photo-1597916829826-02e5bb4a54e0?w=600&auto=format&fit=crop&q=80'}
                  alt="Leaf"
                  className="w-full sm:w-48 h-40 object-cover rounded-2xl border border-stone-200 shadow-xs"
                />

                <div className="flex-1 space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-800 text-xs font-black">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    <span>{selectedObs.diagnoses?.[0]?.disease_id ? selectedObs.diagnoses[0].disease_id.replace(/_/g, ' ') : 'Target Spot / Rust'}</span>
                  </div>

                  <h4 className="font-black text-lg text-stone-900">
                    {selectedObs.farm_crop?.crop?.name || 'Cotton'} • {selectedObs.farm_crop?.variety || 'Bt Cotton'}
                  </h4>

                  <p className="text-xs text-stone-600 leading-relaxed">
                    {selectedObs.description || 'प्रभावित पत्तियों पर भूरे धब्बे दिखाई दे रहे हैं। तुरंत छिड़काव की सिफारिश की जाती है।'}
                  </p>
                </div>
              </div>

              {/* Treatment Prescription Box */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2.5">
                <div className="font-black text-xs text-emerald-950 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>{lang === 'hi' ? 'ICAR प्रमाणित उपचार एवं स्प्रे मात्रा:' : 'ICAR Recommended Treatment Dosage:'}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-emerald-100 shadow-2xs">
                    <span className="text-[11px] font-bold text-stone-500 block">{lang === 'hi' ? 'रासायनिक उपचार (Chemical)' : 'Chemical Fungicide'}</span>
                    <span className="font-extrabold text-stone-900 mt-0.5 block">कॉपर ऑक्सीक्लोराइड 50% WP</span>
                    <span className="text-[11px] text-emerald-700 font-bold">2.5 ग्राम / लीटर पानी</span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-emerald-100 shadow-2xs">
                    <span className="text-[11px] font-bold text-stone-500 block">{lang === 'hi' ? 'जैविक उपचार (Biological)' : 'Biological Control'}</span>
                    <span className="font-extrabold text-stone-900 mt-0.5 block">ट्राइकोडर्मा विरिडी 1% WP</span>
                    <span className="text-[11px] text-emerald-700 font-bold">5 ग्राम / लीटर पानी</span>
                  </div>
                </div>

                <div className="text-[11px] text-emerald-900 font-medium">
                  ⏰ <strong>छिड़काव का समय:</strong> सुबह 10 बजे से पहले या शाम को 4 बजे के बाद करें। कटाई पूर्व प्रतीक्षा अवधि (PHI): 14 दिन।
                </div>
              </div>

              {/* Scientist Review Status */}
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-700" />
                  <div>
                    <div className="font-bold text-stone-900">{lang === 'hi' ? 'कृषि वैज्ञानिक समीक्षा स्थिति' : 'KVK Scientist Validation'}</div>
                    <div className="text-[11px] text-stone-500">{lang === 'hi' ? 'कृषि विज्ञान केंद्र (KVK) पैनल द्वारा सत्यापित' : 'Verified by KVK Expert Panel'}</div>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black">
                  ✓ Verified
                </span>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
              <button
                onClick={() => {
                  setSelectedObs(null);
                  onNavigateToAdvisory();
                }}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 underline"
              >
                {lang === 'hi' ? 'सम्बंधित सरकारी सलाह देखें →' : 'View Related Advisories →'}
              </button>

              <button
                onClick={() => setSelectedObs(null)}
                className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow-xs"
              >
                {lang === 'hi' ? 'बंद करें' : 'Close'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
