import { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, UserCheck, Sprout, ArrowRight } from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';
import { supabase } from '@/lib/supabase';
import { ObservationService, type CropObservationEntity } from '@/services/ObservationService';

export type HealthStatus = 'healthy' | 'needs_attention' | 'high_risk' | 'under_review' | 'no_data';

interface FarmHealthOverviewProps {
  farmId: string;
  cropName: string;
  cropStage: string;
  onNavigateToCheck: () => void;
  onNavigateToAdvisory: () => void;
}

export default function FarmHealthOverview({
  farmId,
  cropName,
  cropStage,
  onNavigateToCheck,
  onNavigateToAdvisory,
}: FarmHealthOverviewProps) {
  const { t } = useLang();
  const [latestObs, setLatestObs] = useState<CropObservationEntity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHealth = async () => {
      setLoading(true);
      try {
        const { data: authData } = await supabase.auth.getUser();
        const userId = authData.user?.id;
        if (userId) {
          const observations = await ObservationService.getFarmerObservations(userId);
          if (observations && observations.length > 0) {
            setLatestObs(observations[0]);
          } else {
            setLatestObs(null);
          }
        }
      } catch (e) {
        console.warn('FarmHealthOverview load exception:', e);
      } finally {
        setLoading(false);
      }
    };
    loadHealth();
  }, [farmId]);

  if (loading) {
    return <div className="h-16 rounded-xl bg-white border border-stone-200/90 animate-pulse" />;
  }

  let status: HealthStatus = 'no_data';
  let statusKey = 'home_priority_normal';
  let badgeTone = 'bg-stone-100 text-stone-700 border-stone-200';
  let iconBg = 'bg-stone-50 text-stone-600';
  let Icon = Sprout;
  let statusTitle = t('home_no_action');
  let statusSubtitle = t('home_no_action_msg');
  let ctaText = t('home_check_crop');
  let onCtaClick = onNavigateToCheck;

  if (latestObs) {
    const isVerified = latestObs.status === 'verified';
    const isUnderReview = latestObs.status === 'processing' || latestObs.status === 'pending_expert';
    const topDiag = latestObs.diagnoses?.[0];

    if (isVerified) {
      status = 'healthy';
      statusKey = 'home_priority_normal';
      badgeTone = 'bg-emerald-100 text-emerald-800 border-emerald-200';
      iconBg = 'bg-emerald-50 text-emerald-700';
      Icon = ShieldCheck;
      statusTitle = t('home_expert_verified');
      statusSubtitle = latestObs.expert_reviews?.[0]?.expert_diagnosis || topDiag?.disease?.name || t('home_crop_health_ok');
      ctaText = t('home_view_advisory');
      onCtaClick = onNavigateToAdvisory;
    } else if (isUnderReview) {
      status = 'under_review';
      statusKey = 'home_priority_reviewing';
      badgeTone = 'bg-blue-100 text-blue-800 border-blue-200';
      iconBg = 'bg-blue-50 text-blue-700';
      Icon = UserCheck;
      statusTitle = t('home_status_review');
      statusSubtitle = t('home_review_msg');
      ctaText = t('home_view_status');
      onCtaClick = onNavigateToAdvisory;
    } else if (topDiag) {
      status = 'needs_attention';
      statusKey = 'home_priority_attention';
      badgeTone = 'bg-amber-100 text-amber-800 border-amber-200';
      iconBg = 'bg-amber-50 text-amber-700';
      Icon = AlertTriangle;
      statusTitle = topDiag.disease?.name || t('home_status_attention');
      statusSubtitle = t('home_ai_preliminary');
      ctaText = t('home_view_advisory');
      onCtaClick = onNavigateToAdvisory;
    }
  } else {
    ctaText = t('home_check_crop');
    onCtaClick = onNavigateToCheck;
  }

  return (
    <div className="flex items-center gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-xl bg-white border border-stone-200/90">
      <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-5 h-5 stroke-[2.2]" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${badgeTone}`}>
            {t(statusKey)}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
            {t('home_crop_health')} · {cropName}
          </span>
        </div>
        <div className="text-sm sm:text-[15px] font-extrabold text-stone-900 leading-snug mt-0.5">
          {statusTitle}
        </div>
        <div className="text-xs text-stone-600 leading-snug mt-0.5 line-clamp-2">
          {statusSubtitle}
        </div>
      </div>

      <button
        onClick={onCtaClick}
        className="hidden sm:inline-flex items-center gap-1 px-3.5 py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white font-bold text-xs flex-shrink-0 transition-colors"
      >
        <span>{ctaText}</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}