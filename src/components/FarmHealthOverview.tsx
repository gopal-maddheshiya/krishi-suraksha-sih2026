import { useState, useEffect } from 'react';
import { 
  ShieldCheck, ShieldAlert, AlertTriangle, 
  HelpCircle, Clock, CheckCircle2, UserCheck, Sprout, ArrowRight
} from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';
import { supabase } from '@/lib/supabase';
import { ObservationService, type CropObservationEntity } from '@/services/ObservationService';
import { RiskAssessmentService, type RiskAssessmentResult } from '@/services/RiskAssessmentService';

interface FarmHealthOverviewProps {
  farmId: string;
  cropName: string;
  cropStage: string;
  onNavigateToCheck: () => void;
  onNavigateToAdvisory: () => void;
}

export type HealthStatus = 'healthy' | 'needs_attention' | 'high_risk' | 'under_review' | 'no_data';

export default function FarmHealthOverview({
  farmId,
  cropName,
  cropStage,
  onNavigateToCheck,
  onNavigateToAdvisory,
}: FarmHealthOverviewProps) {
  const { lang } = useLang();
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
    return (
      <div className="p-5 rounded-3xl bg-white border border-gray-200/80 shadow-sm animate-pulse mb-6">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
        <div className="h-6 bg-gray-200 rounded w-2/3 mb-2" />
        <div className="h-4 bg-gray-100 rounded w-1/2" />
      </div>
    );
  }

  // Derive Health Status strictly from real data
  let status: HealthStatus = 'no_data';
  let statusTitle = lang === 'hi' ? 'कोई नया अवलोकन नहीं' : 'No observations recorded';
  let statusSubtitle = lang === 'hi' ? 'फसल की पहली फोटो लेकर स्वास्थ्य जांच शुरू करें' : 'Take your first crop photo to screen for visible symptoms';
  let badgeTone = 'bg-stone-100 text-stone-700 border-stone-200';
  let Icon = Sprout;

  if (latestObs) {
    const isVerified = latestObs.status === 'verified';
    const isUnderReview = latestObs.status === 'processing' || latestObs.status === 'pending_expert';
    const topDiag = latestObs.diagnoses?.[0];

    if (isVerified) {
      status = 'healthy';
      statusTitle = lang === 'hi' ? 'विशेषज्ञ द्वारा सत्यापित' : 'Expert Verified';
      statusSubtitle = latestObs.expert_reviews?.[0]?.expert_diagnosis || topDiag?.disease?.name || 'Healthy Crop Foliage';
      badgeTone = 'bg-emerald-100 text-emerald-800 border-emerald-200';
      Icon = ShieldCheck;
    } else if (isUnderReview) {
      status = 'under_review';
      statusTitle = lang === 'hi' ? 'विशेषज्ञ समीक्षाधीन' : 'Under Expert Review';
      statusSubtitle = lang === 'hi' ? 'कृषि वैज्ञानिक द्वारा जांच प्रक्रियाधीन है' : 'Agronomist case review in progress';
      badgeTone = 'bg-blue-100 text-blue-800 border-blue-200';
      Icon = UserCheck;
    } else if (topDiag) {
      status = 'needs_attention';
      statusTitle = lang === 'hi' ? 'संभावित लक्षण पहचाने गए' : 'Possible Symptoms Detected';
      statusSubtitle = `${topDiag.disease?.name || 'Preliminary Foliar Issue'} (${lang === 'hi' ? 'प्रारंभिक जांच' : 'AI Screening'})`;
      badgeTone = 'bg-amber-100 text-amber-800 border-amber-200';
      Icon = AlertTriangle;
    }
  }

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-white border border-gray-200/90 shadow-sm mb-6 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Left: Health Indicator */}
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0 text-emerald-700">
            <Icon className="w-6 h-6 stroke-[2.2]" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black uppercase tracking-wider text-gray-500">
                {lang === 'hi' ? 'फसल स्वास्थ्य स्थिति' : 'Crop Health Status'}
              </span>
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${badgeTone}`}>
                {status === 'healthy' ? 'Verified' : status === 'under_review' ? 'In Review' : status === 'needs_attention' ? 'Attention' : 'No Data'}
              </span>
            </div>

            <h3 className="font-extrabold text-gray-900 text-base sm:text-lg mt-0.5">
              {statusTitle}
            </h3>
            <p className="text-xs text-gray-600 font-medium mt-0.5">
              {statusSubtitle}
            </p>
          </div>
        </div>

        {/* Right Action Button */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          {status === 'no_data' ? (
            <button
              onClick={onNavigateToCheck}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
            >
              <span>{lang === 'hi' ? '📷 फोटो जांचें' : '📷 Check Crop'}</span>
            </button>
          ) : (
            <button
              onClick={onNavigateToAdvisory}
              className="px-3.5 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold text-xs border border-gray-200 transition-colors flex items-center gap-1"
            >
              <span>{lang === 'hi' ? 'सलाह देखें' : 'View Action Plan'}</span>
              <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
