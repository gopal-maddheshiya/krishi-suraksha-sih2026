import {
  AlertTriangle, CheckCircle2, UserCheck, ArrowRight, Sparkles, ShieldCheck
} from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';
import { useFarmContext } from '@/contexts/FarmContext';

interface TodayDecisionLayerProps {
  onCheckCrop: () => void;
  onViewAdvisory: () => void;
  onViewExpertReview: () => void;
  onViewWeather: () => void;
}

export default function TodayDecisionLayer({
  onCheckCrop,
  onViewAdvisory,
  onViewExpertReview,
}: TodayDecisionLayerProps) {
  const { t } = useLang();
  const { activeFarm, risk, latestObservation, isLoading } = useFarmContext();

  if (isLoading) {
    return <div className="h-16 bg-stone-50/50 rounded-2xl animate-pulse my-3" />;
  }

  let priorityLevel: 'urgent' | 'high' | 'moderate' | 'normal' = 'normal';
  let Icon = CheckCircle2;
  let iconBg = 'bg-emerald-100/80 text-emerald-800 border-emerald-200';
  let badgeTone = 'bg-emerald-100/70 text-emerald-900 border-emerald-300';
  let priorityKey = 'home_priority_normal';

  if (latestObservation?.status === 'pending_expert' || latestObservation?.status === 'processing') {
    priorityLevel = 'high';
    Icon = UserCheck;
    priorityKey = 'home_priority_reviewing';
    iconBg = 'bg-blue-100/80 text-blue-800 border-blue-200';
    badgeTone = 'bg-blue-100/70 text-blue-900 border-blue-300';
  } else if (risk?.riskLevel === 'high' || risk?.riskLevel === 'critical') {
    priorityLevel = 'urgent';
    Icon = AlertTriangle;
    priorityKey = 'home_priority_action';
    iconBg = 'bg-rose-100/80 text-rose-800 border-rose-200';
    badgeTone = 'bg-rose-100/70 text-rose-900 border-rose-300';
  } else if (risk?.riskLevel === 'moderate') {
    priorityLevel = 'moderate';
    Icon = AlertTriangle;
    priorityKey = 'home_priority_attention';
    iconBg = 'bg-amber-100/80 text-amber-800 border-amber-200';
    badgeTone = 'bg-amber-100/70 text-amber-900 border-amber-300';
  }

  let title = t('home_no_action');
  let message = t('home_no_action_msg');
  let ctaText = t('home_view_advisory');
  let onCtaClick = onViewAdvisory;

  if (priorityLevel === 'high') {
    title = t('home_status_review');
    message = t('home_review_msg');
    ctaText = t('home_view_status');
    onCtaClick = onViewExpertReview;
  } else if (priorityLevel === 'urgent') {
    title = t('home_take_photo');
    const stage = activeFarm?.crop?.stage || 'sensitive stage';
    message = t('home_high_risk_msg').replace('{stage}', stage);
    ctaText = t('home_take_photo');
    onCtaClick = onCheckCrop;
  } else if (priorityLevel === 'moderate') {
    title = t('home_today_action');
    message = t('home_scout_msg');
    ctaText = t('home_inspection_steps');
    onCtaClick = onViewAdvisory;
  }

  return (
    <section
      aria-label="Today decision layer"
      className="my-3.5 bg-white rounded-3xl border border-stone-200/90 shadow-xs overflow-hidden"
    >
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        <div className="flex items-start sm:items-center gap-3.5 min-w-0">
          <div className={`w-11 h-11 rounded-2xl ${iconBg} border flex items-center justify-center flex-shrink-0 shadow-2xs`}>
            <Icon className="w-5 h-5 stroke-[2.4]" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-stone-500">
                {t('home_today_heading')}
              </span>
              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${badgeTone}`}>
                {t(priorityKey)}
              </span>
            </div>
            
            <div className="text-sm sm:text-base font-black text-stone-900 leading-snug">
              {title}
            </div>
            <div className="text-xs font-medium text-stone-600 leading-relaxed mt-0.5 line-clamp-2">
              {message}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
          <button
            type="button"
            onClick={onCtaClick}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white font-bold text-xs transition-all active:scale-[0.98] shadow-2xs min-h-[42px]"
          >
            <span>{ctaText}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </section>
  );
}