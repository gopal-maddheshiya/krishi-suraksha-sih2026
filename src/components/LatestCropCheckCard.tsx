import { useState, useEffect } from 'react';
import {
  Camera, CheckCircle2, Clock, ChevronRight, Sprout,
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
  const { t } = useLang();
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
            return;
          }
        }
        // Fallback to local offline cache
        const localCache = JSON.parse(localStorage.getItem('crophealth_observations_cache') || '[]');
        if (localCache && localCache.length > 0) {
          setLatestObs(localCache[0]);
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
    return <div className="h-14 bg-stone-50/40" />;
  }

  if (!latestObs) {
    return (
      <div className="py-4 sm:py-5 border-b border-stone-200/90 flex items-center gap-3 sm:gap-4">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
          <Sprout className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
            {t('home_latest_check')}
          </div>
          <div className="text-sm font-extrabold text-stone-900 leading-snug">
            {t('home_no_action')}
          </div>
          <div className="text-xs text-stone-600 leading-snug mt-0.5 line-clamp-1">
            {t('home_no_action_msg')}
          </div>
        </div>
        <button
          onClick={onCheckCrop}
          className="px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] flex items-center gap-1.5 flex-shrink-0"
        >
          <Camera className="w-3.5 h-3.5" />
          <span>{t('home_check_crop')}</span>
        </button>
      </div>
    );
  }

  const topDiag = latestObs.diagnoses?.[0];
  const isVerified = latestObs.status === 'verified';
  const expertReview = latestObs.expert_reviews?.[0];
  const rawPath = latestObs.images?.[0]?.storage_path;
  const imageUrl = rawPath?.startsWith('data:')
    ? rawPath
    : rawPath
    ? supabase.storage.from('crop-observations').getPublicUrl(rawPath).data.publicUrl
    : undefined;
  const cropName = latestObs.farm_crop?.crop?.name || 'Cotton';

  return (
    <div className="py-4 sm:py-5 border-b border-stone-200/90 flex items-center gap-3 sm:gap-4">
      {imageUrl && (
        <img
          src={imageUrl}
          alt="Crop Leaf"
          className="w-12 h-12 sm:w-14 sm:h-14 object-cover rounded-xl border border-stone-200 flex-shrink-0"
        />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          {isVerified ? (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-bold uppercase border border-emerald-200/80">
              <CheckCircle2 className="w-3 h-3" />
              {t('home_expert_verified')}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-900 text-[10px] font-bold uppercase border border-amber-200/80">
              <Clock className="w-3 h-3" />
              {t('home_ai_preliminary')}
            </span>
          )}
          <span className="text-[10px] text-stone-500 font-semibold">{cropName}</span>
          <span className="text-[10px] text-stone-400">
            · {new Date(latestObs.created_at).toLocaleDateString()}
          </span>
        </div>
        <div className="mt-0.5 text-sm font-extrabold text-stone-900 truncate">
          {isVerified
            ? expertReview?.expert_diagnosis || 'Foliar Issue Confirmed'
            : topDiag?.disease?.name || 'Preliminary Symptom Observed'}
        </div>
        <div className="text-xs text-stone-600 line-clamp-1 mt-0.5">
          {isVerified
            ? expertReview?.recommended_action || 'Follow standard cultural management practices.'
            : 'Preliminary screening based on visible foliar patterns.'}
        </div>
      </div>
      <div className="flex flex-col gap-1 flex-shrink-0">
        <button
          onClick={onViewHistory}
          className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5"
        >
          <span>{t('common_view_all')}</span>
          <ChevronRight className="w-3 h-3" />
        </button>
        <button
          onClick={onCheckCrop}
          className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-black text-white font-bold text-[10px]"
        >
          {t('home_check_another')}
        </button>
      </div>
    </div>
  );
}