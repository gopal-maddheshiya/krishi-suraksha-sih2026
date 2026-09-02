import { 
  AlertTriangle, CheckCircle2, UserCheck, 
  Camera, CloudRain, ShieldCheck, ArrowRight, Sparkles 
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
  onViewWeather,
}: TodayDecisionLayerProps) {
  const { lang } = useLang();
  const { activeFarm, weather, risk, latestObservation, isLoading } = useFarmContext();

  if (isLoading) {
    return (
      <div className="p-6 rounded-3xl bg-white border border-gray-200/90 shadow-sm animate-pulse mb-6">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-3" />
        <div className="h-6 bg-gray-200 rounded w-2/3 mb-2" />
        <div className="h-4 bg-gray-100 rounded w-1/2" />
      </div>
    );
  }

  // 1. Dynamic Priority Evaluation from real data
  let priorityLevel: 'urgent' | 'high' | 'moderate' | 'normal' = 'normal';
  let title = lang === 'hi' ? 'आज कोई आपातकालीन कार्रवाई आवश्यक नहीं है' : 'No urgent action needed today';
  let message = lang === 'hi' ? 'मौसम अनुकूल है। नियमित फसल निरीक्षण जारी रखें।' : 'Conditions are normal. Continue routine crop monitoring.';
  let ctaText = lang === 'hi' ? 'सलाह देखें' : 'View Advisory';
  let onCtaClick = onViewAdvisory;
  let bgGradient = 'from-emerald-50 via-white to-teal-50/40 border-emerald-200 text-emerald-950';
  let badgeTone = 'bg-emerald-100 text-emerald-800 border-emerald-200';
  let Icon = CheckCircle2;

  // Check 1: Expert review status
  if (latestObservation?.status === 'pending_expert' || latestObservation?.status === 'processing') {
    priorityLevel = 'high';
    title = lang === 'hi' ? 'विशेषज्ञ समीक्षा प्रक्रियाधीन है' : 'Crop Case Under Expert Review';
    message = lang === 'hi' ? 'कृषि वैज्ञानिक द्वारा आपके खेत की फोटो की समीक्षा की जा रही है।' : 'An agronomist is reviewing your submitted leaf photo.';
    ctaText = lang === 'hi' ? 'स्थिति देखें' : 'View Status';
    onCtaClick = onViewExpertReview;
    bgGradient = 'from-blue-50 via-white to-indigo-50/40 border-blue-200 text-blue-950';
    badgeTone = 'bg-blue-100 text-blue-800 border-blue-200';
    Icon = UserCheck;
  }
  // Check 2: High or critical disease risk from weather & crop stage
  else if (risk?.riskLevel === 'high' || risk?.riskLevel === 'critical') {
    priorityLevel = 'urgent';
    title = lang === 'hi' ? 'आज फसल की जांच अवश्य करें' : 'Inspect Your Crop Today';
    message = lang === 'hi' 
      ? `उच्च आर्द्रता (${weather?.current.relativeHumidityPct || 80}%) और ${activeFarm?.crop?.stage || 'फूल आने की अवस्था'} में रोग का जोखिम अधिक है।`
      : `High humidity (${weather?.current.relativeHumidityPct || 80}%) and ${activeFarm?.crop?.stage || 'sensitive stage'} favor disease development.`;
    ctaText = lang === 'hi' ? '📷 फोटो लें' : '📷 Take Crop Photo';
    onCtaClick = onCheckCrop;
    bgGradient = 'from-rose-50 via-white to-orange-50/40 border-rose-200 text-rose-950';
    badgeTone = 'bg-rose-100 text-rose-800 border-rose-200';
    Icon = AlertTriangle;
  }
  // Check 3: Moderate disease risk
  else if (risk?.riskLevel === 'moderate') {
    priorityLevel = 'moderate';
    title = lang === 'hi' ? 'खेत में पत्तियों की जांच करें' : 'Scout Lower Leaves Today';
    message = lang === 'hi'
      ? 'वर्तमान मौसम में फंगल धब्बों की संभावना है। निचली पत्तियों पर जलभराव या धब्बे देखें।'
      : 'Current microclimate favors mild fungal pressure. Inspect lower leaf undersides for initial spots.';
    ctaText = lang === 'hi' ? 'निरीक्षण गाइड' : 'Inspection Steps';
    onCtaClick = onViewAdvisory;
    bgGradient = 'from-amber-50 via-white to-orange-50/40 border-amber-200 text-amber-950';
    badgeTone = 'bg-amber-100 text-amber-800 border-amber-200';
    Icon = AlertTriangle;
  }

  return (
    <div className={`p-6 sm:p-7 rounded-3xl bg-gradient-to-br ${bgGradient} border shadow-sm mb-8 transition-all`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        
        {/* Left: Dynamic Decision Content */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/80 border border-current/20 flex items-center justify-center flex-shrink-0 shadow-sm">
            <Icon className="w-6 h-6 stroke-[2.2]" />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[11px] font-black uppercase tracking-wider">
                {lang === 'hi' ? 'आज आपके खेत में क्या करना है?' : 'What to do today on your farm'}
              </span>
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${badgeTone}`}>
                {priorityLevel === 'urgent' ? 'Action Required' : priorityLevel === 'high' ? 'Reviewing' : priorityLevel === 'moderate' ? 'Attention' : 'Normal'}
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-black tracking-tight mt-0.5">
              {title}
            </h3>
            
            <p className="text-xs sm:text-sm font-medium mt-1 leading-relaxed opacity-90 max-w-xl">
              {message}
            </p>
          </div>
        </div>

        {/* Right: Dynamic CTA Button */}
        <div className="self-start sm:self-center flex-shrink-0">
          <button
            onClick={onCtaClick}
            className="px-5 py-3.5 rounded-2xl bg-gray-900 hover:bg-black text-white font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all flex items-center gap-2"
          >
            <span>{ctaText}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
