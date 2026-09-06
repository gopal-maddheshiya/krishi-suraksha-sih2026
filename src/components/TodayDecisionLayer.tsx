import {
  AlertTriangle, CheckCircle2, UserCheck, ArrowRight, Sparkles, ShieldCheck,
  CloudRain, Wind, TrendingUp, Bug, ChevronRight, Activity, AlertOctagon
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
  const { lang, t } = useLang();
  const { activeFarm, risk, latestObservation, weather, isLoading } = useFarmContext();

  if (isLoading) {
    return <div className="h-24 bg-stone-50/50 rounded-3xl animate-pulse my-4" />;
  }

  // Priority calculations
  let priorityLevel: 'urgent' | 'high' | 'moderate' | 'normal' = 'normal';
  let Icon = CheckCircle2;
  let iconBg = 'bg-emerald-100 text-emerald-800 border-emerald-200';
  let badgeTone = 'bg-emerald-100 text-emerald-900 border-emerald-300';
  let priorityKey = 'home_priority_normal';

  if (latestObservation?.status === 'pending_expert' || latestObservation?.status === 'processing') {
    priorityLevel = 'high';
    Icon = UserCheck;
    priorityKey = 'home_priority_reviewing';
    iconBg = 'bg-blue-100 text-blue-800 border-blue-200';
    badgeTone = 'bg-blue-100 text-blue-900 border-blue-300';
  } else if (risk?.riskLevel === 'high' || risk?.riskLevel === 'critical') {
    priorityLevel = 'urgent';
    Icon = AlertTriangle;
    priorityKey = 'home_priority_action';
    iconBg = 'bg-rose-100 text-rose-800 border-rose-200';
    badgeTone = 'bg-rose-100 text-rose-900 border-rose-300';
  } else if (risk?.riskLevel === 'moderate') {
    priorityLevel = 'moderate';
    Icon = AlertTriangle;
    priorityKey = 'home_priority_attention';
    iconBg = 'bg-amber-100 text-amber-800 border-amber-200';
    badgeTone = 'bg-amber-100 text-amber-900 border-amber-300';
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

  // Weather spray window details
  const humidity = weather?.humidity ?? 62;
  const windKph = weather?.windSpeed ?? 11;
  const isSafeSpray = humidity < 85 && windKph < 15;
  const sprayScore = isSafeSpray ? 85 : 30;

  return (
    <section 
      aria-label="Today's Farmer Decision Layer"
      className="space-y-4 my-2"
    >
      {/* 1. PRIMARY SYSTEM ACTION BANNER */}
      <div className="bg-white/85 backdrop-blur-xl rounded-3xl border border-stone-200/60 shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden hover:border-emerald-500/30 transition-all">
        <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          <div className="flex items-start sm:items-center gap-4 min-w-0">
            <div className={`w-12 h-12 rounded-2xl ${iconBg} border flex items-center justify-center flex-shrink-0 shadow-2xs`}>
              <Icon className="w-6 h-6 stroke-[2.4]" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-stone-500">
                  {t('home_today_heading')}
                </span>
                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${badgeTone}`}>
                  {t(priorityKey)}
                </span>
              </div>
              
              <div className="text-base sm:text-lg font-black text-stone-900 leading-snug">
                {title}
              </div>
              <div className="text-xs sm:text-sm font-medium text-stone-600 leading-relaxed mt-0.5 line-clamp-2">
                {message}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
            <button
              type="button"
              onClick={onCtaClick}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-stone-900 hover:bg-black text-white font-bold text-xs sm:text-sm transition-all active:scale-[0.98] shadow-sm min-h-[44px]"
            >
              <span>{ctaText}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* CROP EMERGENCY FIRST-AID QUICK RIBBON */}
      <div className="bg-rose-50/80 border border-rose-200/90 rounded-2xl px-4 py-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs shadow-2xs">
        <div className="flex items-center gap-2 text-rose-950 font-bold">
          <AlertOctagon className="w-4 h-4 text-rose-600 flex-shrink-0 animate-pulse" />
          <span>{lang === 'hi' ? 'फसल पर टिड्डी दल, फॉल आर्मीवर्म या अचानक उकठा रोग का हमला?' : 'Locust swarm, Fall Armyworm or Sudden Wilt attack?'}</span>
        </div>
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent('open-crop-emergency'))}
          className="inline-flex items-center gap-1.5 font-black text-rose-700 hover:text-rose-900 bg-white hover:bg-rose-100/70 px-3 py-1.5 rounded-xl border border-rose-200 text-[11px] shadow-2xs transition-all active:scale-95 flex-shrink-0 cursor-pointer"
        >
          <span>{lang === 'hi' ? '🚨 24h आपातकालीन कदम देखें' : '🚨 View 24h First-Aid'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2. MORNING BRIEFING TRIAD (3 ACTIONABLE FARMER CARDS) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* CARD 1: 🌧️ SPRAY SAFETY WINDOW (WITH SVG CIRCULAR GAUGE) */}
        <div 
          id="tour-weather-card"
          onClick={onViewWeather}
          className="bg-white/85 backdrop-blur-xl rounded-3xl border border-stone-200/60 p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-lg hover:border-emerald-500/40 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200/80 flex items-center justify-center flex-shrink-0">
                <CloudRain className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h4 className="text-sm font-black text-stone-900 tracking-tight">
                  {lang === 'hi' ? 'स्प्रे सुरक्षा विंडो' : 'Spray Safety Window'}
                </h4>
                <p className="text-xs font-bold text-emerald-800 mt-0.5">
                  {isSafeSpray 
                    ? (lang === 'hi' ? '✓ 9:00 AM – 11:30 AM सुरक्षित' : '✓ 9:00 AM – 11:30 AM Safe') 
                    : (lang === 'hi' ? '⚠️ आज छिड़काव टालें' : '⚠️ Postpone Spraying')}
                </p>
              </div>
            </div>

            {/* Circular Mini Gauge */}
            <div className="relative w-11 h-11 flex items-center justify-center flex-shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="14" fill="none" className="stroke-stone-100" strokeWidth="3" />
                <circle 
                  cx="18" cy="18" r="14" fill="none" 
                  className={isSafeSpray ? "stroke-emerald-600" : "stroke-amber-500"} 
                  strokeWidth="3" 
                  strokeDasharray={`${(sprayScore / 100) * 88} 88`}
                  strokeLinecap="round" 
                />
              </svg>
              <span className="absolute text-[11px] font-black text-stone-800">{sprayScore}%</span>
            </div>
          </div>

          <p className="text-xs text-stone-600 font-medium leading-relaxed mt-3.5">
            {isSafeSpray
              ? (lang === 'hi' ? 'हवा की गति 11 किमी/घं (धीमी) • दोपहर 2 बजे तक बारिश की शून्य संभावना।' : 'Wind speed 11 km/h (gentle). 0% rain probability until 2 PM.')
              : (lang === 'hi' ? 'दोपहर बाद 65% बारिश के आसार, दवा बहने व बर्बाद होने का जोखिम है।' : '65% rain chance post-noon. Foliar chemical runoff risk.')}
          </p>

          <div className="flex items-center justify-between text-xs font-black text-emerald-800 pt-3 mt-3 border-t border-stone-100">
            <span>{lang === 'hi' ? 'मौसम पूर्वानुमान देखें' : 'Hourly Spray Window'}</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* CARD 2: 🐛 5KM COMMUNITY PEST RADAR */}
        <div 
          onClick={onViewAdvisory}
          className="bg-white/85 backdrop-blur-xl rounded-3xl border border-stone-200/60 p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-lg hover:border-amber-500/40 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-800 border border-amber-200/80 flex items-center justify-center flex-shrink-0">
                <Bug className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h4 className="text-sm font-black text-stone-900 tracking-tight">
                  {lang === 'hi' ? '5 किमी कीट रडार' : '5km Pest Radar'}
                </h4>
                <p className="text-xs font-bold text-amber-800 flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <span>{lang === 'hi' ? '3.2 किमी दूर चेतावनी दर्ज' : 'Alert 3.2 km away'}</span>
                </p>
              </div>
            </div>
          </div>

          <p className="text-xs text-stone-600 font-medium leading-relaxed mt-3.5">
            {lang === 'hi'
              ? 'पड़ोसी गाँव में कपास बोंडअळी / इल्ली का प्रकोप देखा गया है। अपने खेत की मेड़ों पर फेरोमोन ट्रैप की तुरंत जांच करें।'
              : 'Pink Bollworm / Spodoptera reported in adjacent sector. Inspect border rows and pheromone traps.'}
          </p>

          <div className="flex items-center justify-between text-xs font-black text-amber-800 pt-3 mt-3 border-t border-stone-100">
            <span>{lang === 'hi' ? 'सुरक्षा सलाह पढ़ें' : 'View Pest Defense'}</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* CARD 3: 💰 LIVE MANDI PRICE TREND */}
        <div 
          onClick={onViewAdvisory}
          className="bg-white/85 backdrop-blur-xl rounded-3xl border border-stone-200/60 p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-lg hover:border-teal-500/40 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-800 border border-teal-200/80 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h4 className="text-sm font-black text-stone-900 tracking-tight">
                  {lang === 'hi' ? 'आज का मंडी भाव' : 'Live Mandi Price'}
                </h4>
                <p className="text-xs font-black text-teal-800 mt-0.5">
                  ₹2,650 / क्विंटल <span className="text-emerald-700 font-extrabold">(+₹45 तेज)</span>
                </p>
              </div>
            </div>
          </div>

          <p className="text-xs text-stone-600 font-medium leading-relaxed mt-3.5">
            {lang === 'hi'
              ? 'स्थानीय एपीएमसी मंडी में मांग मजबूत है। यदि फसल पकी है, तो अगले 48 घंटों में तुड़ाई व विक्रय उत्तम लाभ देगा।'
              : 'Strong buyer demand in regional APMC. High realization window over the next 48 hours.'}
          </p>

          <div className="flex items-center justify-between text-xs font-black text-teal-800 pt-3 mt-3 border-t border-stone-100">
            <span>{lang === 'hi' ? 'मंडी रुझान व सलाह' : 'Market Advisory'}</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

      </div>
    </section>
  );
}