import {
  Camera, Droplets, CloudRain, Wind, Thermometer,
  ShieldCheck, ShieldAlert, AlertTriangle, Sprout,
  ChevronRight, MapPin, Sparkles, Sun, CheckCircle2,
  Calendar, Layers, ArrowDown, Activity, Leaf
} from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';
import { useFarmContext } from '@/contexts/FarmContext';

type HeroProps = {
  onNavigate: (section: string) => void;
  onOpenOnboarding?: () => void;
};

export default function Hero({ onNavigate }: HeroProps) {
  const { t, lang } = useLang();
  const { activeFarm, weather, risk, latestObservation } = useFarmContext();

  const cropName = activeFarm?.crop?.name || (lang === 'hi' ? 'कपास' : lang === 'mr' ? 'कापूस' : 'Cotton');
  const cropVariety = activeFarm?.crop?.variety || (lang === 'hi' ? 'उन्नत बी.टी. संकर' : 'Certified Hybrid');
  const cropStage = activeFarm?.crop?.stage || (lang === 'hi' ? 'फूल व कलियां आने की अवस्था' : lang === 'mr' ? 'फुलोरा अवस्था' : 'Flowering & Boll Stage');
  const farmerName = (activeFarm as any)?.farmer?.full_name || (activeFarm as any)?.farmer?.name || '';
  const farmArea = activeFarm?.area_acres || 2.5;
  const district = activeFarm?.district || (lang === 'hi' ? 'पुणे, महाराष्ट्र' : 'Pune, Maharashtra');

  const hour = new Date().getHours();
  const greeting = hour < 12 
    ? t('home_greeting_morning') 
    : hour < 17 
    ? t('home_greeting_afternoon') 
    : t('home_greeting_evening');

  const weatherAvailable = !!weather?.current;
  const temp = weather?.current?.temperatureC != null ? Math.round(weather.current.temperatureC) : 28;
  const humidity = weather?.current?.relativeHumidityPct != null ? Math.round(weather.current.relativeHumidityPct) : 76;
  const rainMm = weather?.current?.precipitationMm != null ? weather.current.precipitationMm : 0;
  const windKph = weather?.current?.windSpeedKmh != null ? Math.round(weather.current.windSpeedKmh) : 11;

  // Rain status label
  const rainLabel = rainMm === 0 
    ? t('home_no_rain') 
    : rainMm < 2.5 
    ? t('home_low_rain') 
    : rainMm < 10 
    ? t('home_med_rain') 
    : t('home_high_rain');

  // Status derived from real data
  let statusKey = 'home_status_healthy';
  let statusDetailKey = 'home_hero_healthy';
  let statusTone: 'healthy' | 'attention' | 'urgent' | 'review' = 'healthy';
  let StatusIcon = ShieldCheck;

  if (latestObservation?.status === 'pending_expert' || latestObservation?.status === 'processing') {
    statusKey = 'home_status_review';
    statusDetailKey = 'home_hero_review';
    statusTone = 'review';
    StatusIcon = AlertTriangle;
  } else if (risk?.riskLevel === 'high' || risk?.riskLevel === 'critical') {
    statusKey = 'home_status_attention';
    statusDetailKey = 'home_hero_action';
    statusTone = 'urgent';
    StatusIcon = ShieldAlert;
  } else if (risk?.riskLevel === 'moderate') {
    statusKey = 'home_status_attention';
    statusDetailKey = 'home_hero_attention';
    statusTone = 'attention';
    StatusIcon = AlertTriangle;
  } else if (!latestObservation) {
    statusKey = 'home_status_healthy';
    statusDetailKey = 'home_hero_healthy';
    statusTone = 'healthy';
    StatusIcon = ShieldCheck;
  }

  const handleCheckCrop = () => {
    const el = document.getElementById('scanner-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      onNavigate('report');
    }
  };

  return (
    <section 
      aria-label="Farm Overview & Hero"
      className="relative bg-white rounded-3xl sm:rounded-[32px] border border-stone-200/90 shadow-sm overflow-hidden"
    >
      {/* Subtle organic sunlight gradient layer */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-radial from-emerald-100/40 via-teal-50/20 to-transparent pointer-events-none rounded-full blur-2xl -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-radial from-amber-100/20 via-transparent to-transparent pointer-events-none rounded-full blur-xl -ml-16 -mb-16" />

      <div className="relative p-5 sm:p-7 md:p-8 lg:p-9 space-y-6 sm:space-y-8">

        {/* ============================================================= */}
        {/* 1. TOP CONTEXT BAR: GREETING & FARM IDENTITY                  */}
        {/* ============================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center font-bold flex-shrink-0 shadow-2xs">
              <Sprout className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="text-xs font-bold text-stone-500 flex items-center gap-1.5">
                <span>{greeting}, {farmerName || t('home_farmer_fallback')}</span>
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="text-sm font-black text-stone-900 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                <span>{district} • {farmArea} {t('home_acres')}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-full bg-stone-100 text-stone-700 text-xs font-bold border border-stone-200/80 flex items-center gap-1.5 shadow-2xs">
              <Layers className="w-3.5 h-3.5 text-stone-500" />
              <span>{cropVariety}</span>
            </span>
          </div>
        </div>

        {/* ============================================================= */}
        {/* 2. MAIN HERO GRID: HEALTH STATE (LEFT) + BOTANICAL ART (RIGHT) */}
        {/* ============================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">

          {/* LEFT: Crop Identity + Condition + Primary Action */}
          <div className="lg:col-span-7 space-y-5">
            
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-900 bg-emerald-100/70 px-3 py-1 rounded-full border border-emerald-200 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                <span>{t('home_today_on_farm')}</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-stone-900 tracking-tight leading-[1.05]">
                {cropName}
              </h1>
              
              <p className="text-sm sm:text-base font-bold text-stone-500 mt-1 flex items-center gap-1.5">
                <Leaf className="w-4 h-4 text-emerald-600 inline" />
                <span>{cropStage}</span>
              </p>
            </div>

            {/* Health Status Capsule */}
            <div className={`p-4 sm:p-4.5 rounded-2xl sm:rounded-3xl border transition-all ${
              statusTone === 'urgent'
                ? 'bg-rose-50/90 border-rose-200 text-rose-950 shadow-xs'
                : statusTone === 'attention'
                ? 'bg-amber-50/90 border-amber-200 text-amber-950 shadow-xs'
                : statusTone === 'review'
                ? 'bg-blue-50/90 border-blue-200 text-blue-950 shadow-xs'
                : 'bg-emerald-50/80 border-emerald-200/90 text-emerald-950 shadow-xs'
            }`}>
              <div className="flex items-start gap-3.5">
                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs ${
                  statusTone === 'urgent' ? 'bg-rose-200 text-rose-800' :
                  statusTone === 'attention' ? 'bg-amber-200 text-amber-800' :
                  statusTone === 'review' ? 'bg-blue-200 text-blue-800' :
                  'bg-emerald-200 text-emerald-800'
                }`}>
                  <StatusIcon className="w-5 h-5 stroke-[2.4]" />
                </div>
                <div>
                  <div className="text-sm sm:text-base font-black flex items-center gap-2">
                    <span>{t(statusKey)}</span>
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      statusTone === 'urgent' ? 'bg-rose-500 animate-ping' :
                      statusTone === 'attention' ? 'bg-amber-500' :
                      statusTone === 'review' ? 'bg-blue-500 animate-pulse' :
                      'bg-emerald-500'
                    }`} />
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-stone-600 mt-0.5 leading-relaxed">
                    {t(statusDetailKey)}
                  </p>
                </div>
              </div>
            </div>

            {/* ONE PROMINENT PRIMARY CTA */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleCheckCrop}
                className="w-full sm:w-auto px-8 py-4 sm:py-4.5 rounded-2xl bg-gradient-to-r from-emerald-800 via-emerald-800 to-teal-900 hover:from-emerald-900 hover:to-teal-950 text-white font-black text-base sm:text-lg shadow-lg hover:shadow-xl hover:shadow-emerald-900/25 transition-all duration-200 flex items-center justify-center gap-3 active:scale-[0.98] ring-4 ring-emerald-600/20 group min-h-[54px]"
              >
                <div className="p-1 rounded-lg bg-white/15">
                  <Camera className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.4] group-hover:scale-110 transition-transform" />
                </div>
                <span>{t('home_check_crop')}</span>
                <ArrowDown className="w-4 h-4 opacity-70 group-hover:translate-y-0.5 transition-transform ml-1" />
              </button>
            </div>

          </div>

          {/* RIGHT: Agricultural Visual Composition */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl bg-gradient-to-br from-emerald-50/90 via-stone-50/80 to-teal-50/60 p-6 border border-emerald-100/90 shadow-xs relative overflow-hidden flex flex-col justify-between min-h-[270px]">
              
              {/* Top Meta Tag */}
              <div className="flex items-center justify-between z-10">
                <span className="text-xs font-black text-emerald-900 uppercase tracking-wider flex items-center gap-1.5 bg-white/80 px-2.5 py-1 rounded-full border border-emerald-200/60">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>{t('home_crop_health')}</span>
                </span>
                <span className="text-[11px] font-bold text-stone-500 bg-white/90 px-2.5 py-1 rounded-full border border-stone-200 shadow-2xs">
                  ICAR Certified
                </span>
              </div>

              {/* Center Botanical Silhouette Art */}
              <div className="my-auto py-3 text-center relative z-10">
                <div className="relative inline-block">
                  <svg className="w-28 h-28 mx-auto text-emerald-600 filter drop-shadow-md" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Plant stem & leaves vector */}
                    <path d="M50 88V32" stroke="#047857" strokeWidth="4" strokeLinecap="round" />
                    <path d="M50 68C36 68 22 56 18 38C34 38 46 50 50 68Z" fill="#10B981" fillOpacity="0.85" stroke="#047857" strokeWidth="2" />
                    <path d="M50 50C64 50 78 38 82 20C66 20 54 32 50 50Z" fill="#34D399" fillOpacity="0.85" stroke="#047857" strokeWidth="2" />
                    <path d="M50 32C44 16 28 12 22 8C32 14 44 24 50 32Z" fill="#059669" stroke="#047857" strokeWidth="2" />
                    <circle cx="50" cy="32" r="4.5" fill="#FBBF24" />
                    <circle cx="18" cy="38" r="3.5" fill="#34D399" />
                    <circle cx="82" cy="20" r="3.5" fill="#34D399" />
                  </svg>
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full animate-ping pointer-events-none" />
                </div>
                <div className="mt-2 text-xs sm:text-sm font-black text-stone-900">
                  {cropName} • {cropVariety}
                </div>
                <div className="text-[11px] text-stone-500 font-semibold mt-0.5">
                  {statusTone === 'urgent' ? t('home_hero_action') : t('home_hero_healthy')}
                </div>
              </div>

              {/* Bottom Quick Advice */}
              <div className="pt-3 border-t border-emerald-100/90 flex items-center justify-between text-xs z-10 bg-white/60 -mx-6 -mb-6 p-4 rounded-b-3xl">
                <span className="font-bold text-stone-600">{t('home_spray_safe')}:</span>
                <span className="font-black text-emerald-800 flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{humidity < 85 && windKph < 15 ? '✓ 4:00 PM+' : '⚠️ Postpone'}</span>
                </span>
              </div>

            </div>
          </div>

        </div>

        {/* ============================================================= */}
        {/* 3. SLEEK & CLASSY INTEGRATED WEATHER BAR                      */}
        {/* ============================================================= */}
        <div className="pt-4 border-t border-stone-100/90">
          <div className="flex items-center justify-between mb-2.5 px-0.5">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-amber-100/70 text-amber-700 flex items-center justify-center">
                <Sun className="w-3 h-3 stroke-[2.2]" />
              </div>
              <span className="text-xs font-bold text-stone-600 tracking-tight">
                {t('home_weather_today')}
              </span>
            </div>
            
            <button
              type="button"
              onClick={() => onNavigate('weather')}
              className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-0.5 transition-colors"
            >
              <span>{t('home_view_forecast')}</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            
            {/* Temperature */}
            <div className="px-3.5 py-2.5 rounded-2xl bg-stone-50/70 hover:bg-stone-50 border border-stone-200/70 shadow-2xs flex items-center gap-2.5 transition-all">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0 border border-amber-100/80">
                <Thermometer className="w-4 h-4 stroke-[2]" />
              </div>
              <div className="min-w-0">
                <div className="text-sm sm:text-base font-black text-stone-900 leading-none tabular-nums">
                  {temp}°<span className="text-[11px] font-semibold text-stone-500">{t('home_unit_celsius')}</span>
                </div>
                <div className="text-[10px] font-medium text-stone-400 mt-0.5 truncate">
                  {t('home_temp')}
                </div>
              </div>
            </div>

            {/* Humidity */}
            <div className="px-3.5 py-2.5 rounded-2xl bg-stone-50/70 hover:bg-stone-50 border border-stone-200/70 shadow-2xs flex items-center gap-2.5 transition-all">
              <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center flex-shrink-0 border border-sky-100/80">
                <Droplets className="w-4 h-4 stroke-[2]" />
              </div>
              <div className="min-w-0">
                <div className="text-sm sm:text-base font-black text-stone-900 leading-none tabular-nums">
                  {humidity}%
                </div>
                <div className="text-[10px] font-medium text-stone-400 mt-0.5 truncate">
                  {t('home_humidity')}
                </div>
              </div>
            </div>

            {/* Rainfall */}
            <div className="px-3.5 py-2.5 rounded-2xl bg-stone-50/70 hover:bg-stone-50 border border-stone-200/70 shadow-2xs flex items-center gap-2.5 transition-all">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0 border border-blue-100/80">
                <CloudRain className="w-4 h-4 stroke-[2]" />
              </div>
              <div className="min-w-0">
                <div className="text-sm sm:text-base font-black text-stone-900 leading-none truncate">
                  {rainLabel}
                </div>
                <div className="text-[10px] font-medium text-stone-400 mt-0.5 truncate">
                  {t('home_rain')}
                </div>
              </div>
            </div>

            {/* Wind */}
            <div className="px-3.5 py-2.5 rounded-2xl bg-stone-50/70 hover:bg-stone-50 border border-stone-200/70 shadow-2xs flex items-center gap-2.5 transition-all">
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center flex-shrink-0 border border-teal-100/80">
                <Wind className="w-4 h-4 stroke-[2]" />
              </div>
              <div className="min-w-0">
                <div className="text-sm sm:text-base font-black text-stone-900 leading-none tabular-nums">
                  {windKph} <span className="text-[10px] font-medium text-stone-500">{t('home_unit_kmh')}</span>
                </div>
                <div className="text-[10px] font-medium text-stone-400 mt-0.5 truncate">
                  {t('home_wind')}
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}