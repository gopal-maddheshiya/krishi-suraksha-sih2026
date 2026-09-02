import { useState, useEffect } from 'react';
import { 
  Camera, CheckCircle2, AlertCircle, Clock, 
  UserCheck, ChevronRight, Sparkles, Sprout
} from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';
import { supabase } from '@/lib/supabase';
import { ObservationService, type CropObservationEntity } from '@/services/ObservationService';

interface LatestCropCheckCardProps {
  onCheckCrop: () => void;
  onViewHistory: () => void;
}

export default function LatestCropCheckCard({
  onCheckCrop,
  onViewHistory,
}: LatestCropCheckCardProps) {
  const { lang } = useLang();
  const [latestObs, setLatestObs] = useState<CropObservationEntity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const { data: authData } = await supabase.auth.getUser();
        if (authData.user) {
          const rows = await ObservationService.getFarmerObservations(authData.user.id);
          if (rows && rows.length > 0) {
            setLatestObs(rows[0]);
          }
        }
      } catch (e) {
        console.warn('LatestCropCheckCard load exception:', e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-sm animate-pulse mb-8">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-3" />
        <div className="h-5 bg-gray-200 rounded w-1/2 mb-2" />
        <div className="h-4 bg-gray-100 rounded w-1/3" />
      </div>
    );
  }

  // If no observation exists, show intentional empty state
  if (!latestObs) {
    return (
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/50 border border-emerald-200/80 shadow-sm mb-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-lg">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
            <Sprout className="w-3.5 h-3.5" />
            <span>{lang === 'hi' ? 'पहला कदम' : 'Get Started'}</span>
          </div>
          <h3 className="text-lg sm:text-xl font-extrabold text-gray-900">
            {lang === 'hi' ? 'फसल की पहली जांच करें' : 'Check your crop health today'}
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            {lang === 'hi'
              ? 'पत्तियों की फोटो खींचकर रोग के शुरुआती लक्षणों की तुरंत जांच करें और वैज्ञानिक सलाह प्राप्त करें।'
              : 'Take a clear leaf photo to screen for visible foliar diseases and receive ICAR-backed IPM guidance.'}
          </p>
        </div>

        <button
          onClick={onCheckCrop}
          className="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-2 flex-shrink-0"
        >
          <Camera className="w-4 h-4" />
          <span>{lang === 'hi' ? '📷 फोटो स्कैन करें' : '📷 Take Leaf Photo'}</span>
        </button>
      </div>
    );
  }

  const topDiag = latestObs.diagnoses?.[0];
  const isVerified = latestObs.status === 'verified';
  const expertReview = latestObs.expert_reviews?.[0];
  const storagePath = latestObs.images?.[0]?.storage_path;
  const imageUrl = storagePath 
    ? supabase.storage.from('crop-observations').getPublicUrl(storagePath).data.publicUrl 
    : undefined;
  const cropName = latestObs.farm_crop?.crop?.name || 'Cotton';

  return (
    <div className="p-6 rounded-3xl bg-white border border-gray-200/90 shadow-sm mb-8">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-gray-500">
            {lang === 'hi' ? 'हाल की फसल जांच' : 'Latest Crop Check'}
          </span>
          <span className="text-[10px] text-gray-400">
            • {new Date(latestObs.created_at).toLocaleDateString()}
          </span>
        </div>

        <button
          onClick={onViewHistory}
          className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1"
        >
          <span>{lang === 'hi' ? 'सभी जांचें देखें' : 'View All'}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
        
        {/* Left: Thumbnail if exists */}
        {imageUrl && (
          <div className="sm:col-span-3">
            <img
              src={imageUrl}
              alt="Crop Leaf"
              className="w-full h-28 object-cover rounded-2xl border border-gray-200 shadow-inner"
            />
          </div>
        )}

        {/* Middle: Diagnosis & Status */}
        <div className={imageUrl ? 'sm:col-span-6' : 'sm:col-span-9'}>
          <div className="flex items-center gap-2 mb-1">
            {isVerified ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                {lang === 'hi' ? 'विशेषज्ञ द्वारा सत्यापित' : 'Expert Verified'}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black uppercase">
                <Clock className="w-3 h-3 text-amber-700" />
                {lang === 'hi' ? 'प्रारंभिक AI जांच' : 'AI Preliminary Screening'}
              </span>
            )}

            <span className="text-xs text-gray-400 font-semibold">
              {cropName}
            </span>
          </div>

          <h4 className="text-base sm:text-lg font-black text-gray-900">
            {isVerified
              ? expertReview?.expert_diagnosis || 'Foliar Issue Confirmed'
              : topDiag?.disease?.name || 'Preliminary Symptom Observed'}
          </h4>

          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            {isVerified
              ? expertReview?.recommended_action || 'Follow standard cultural management practices.'
              : 'Preliminary screening based on visible foliar patterns. Expert verification can be requested.'}
          </p>
        </div>

        {/* Right CTA */}
        <div className="sm:col-span-3 flex justify-end">
          <button
            onClick={onCheckCrop}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-800 font-bold text-xs border border-gray-200 transition-colors text-center"
          >
            {lang === 'hi' ? 'नई फोटो लें' : 'Check Another'}
          </button>
        </div>

      </div>
    </div>
  );
}
