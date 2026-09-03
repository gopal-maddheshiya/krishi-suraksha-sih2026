import { useState, useEffect } from 'react';
import {
  Camera, Droplets, CloudRain, Wind, Thermometer,
  ShieldCheck, ShieldAlert, AlertTriangle, Sprout,
  ChevronRight, MapPin, Sparkles, Sun, CheckCircle2,
  Calendar, Layers, ArrowDown, Activity, Leaf, Eye
} from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';
import { useFarmContext } from '@/contexts/FarmContext';
import { getLocalizedCropName, getLocalizedStageName, getCommonLabel } from '@/lib/agriLocalization';

type HeroProps = {
  onNavigate: (section: string) => void;
  onOpenOnboarding?: () => void;
};

export default function Hero({ onNavigate }: HeroProps) {
  const { t, lang } = useLang();
  const { activeFarm, weather, risk, latestObservation } = useFarmContext();
  const [recentScan, setRecentScan] = useState<any>(null);

  useEffect(() => {
    try {
      const cached = localStorage.getItem('crophealth_observations_cache');
      if (cached) {
        const list = JSON.parse(cached);
        if (list && list.length > 0) {
          setRecentScan(list[0]);
        }
      }
    } catch {}
  }, []);

  const rawCropName = recentScan?.farm_crop?.crop?.name || activeFarm?.crop?.name || 'Cotton';
  const cropName = getLocalizedCropName(rawCropName, lang);
  const rawCropStage = recentScan?.farm_crop?.current_stage || activeFarm?.crop?.stage || 'Flowering & Boll Stage';
  const cropStage = getLocalizedStageName(rawCropStage, lang);
  const cropVariety = recentScan?.farm_crop?.variety || activeFarm?.crop?.variety || t('upload_form_variety') || 'Certified Hybrid';
  const farmerName = (activeFarm as any)?.farmer?.full_name || (activeFarm as any)?.farmer?.name || '';
  const farmArea = activeFarm?.area_acres || 2.5;
  const district = activeFarm?.district || (lang === 'hi' ? 'पुणे, महाराष्ट्र' : lang === 'mr' ? 'पुणे, महाराष्ट्र' : 'Pune, Maharashtra');

  // Resolve Real Photo from Latest Scan or Active Crop
  const getRecentCropImage = () => {
    if (recentScan?.images?.[0]?.storage_path) {
      return recentScan.images[0].storage_path;
    }
    if (latestObservation?.images?.[0]?.storage_path) {
      return latestObservation.images[0].storage_path;
    }
    const cLower = rawCropName.toLowerCase();
    if (cLower.includes('tomato') || cLower.includes('टमाटर') || cLower.includes('टोमॅटो')) return '/images/sample-tomato.jpg';
    if (cLower.includes('rice') || cLower.includes('धान') || cLower.includes('भात')) return '/images/sample-rice.jpg';
    if (cLower.includes('soybean') || cLower.includes('सोयाबीन')) return '/images/sample-soybean.jpg';
    return '/images/sample-cotton.jpg';
  };

  const cropImageUrl = getRecentCropImage();
  const recentDiseaseName = recentScan?.diagnoses?.[0]?.disease_id || recentScan?.description?.split('-')?.[0]?.trim() || getCommonLabel('healthyCrop', lang);

  const hour = new Date().getHours();
  const greeting = hour < 12 
    ? t('home_greeting_morning') 
    : hour < 17 
    ? t('home_greeting_afternoon') 
    : t('home_greeting_evening');

  const temp = weather?.current?.temperatureC != null ? Math.round(weather.current.temperatureC) : 28;
  const humidity = weather?.current?.relativeHumidityPct != null ? Math.round(weather.current.relativeHumidityPct) : 76;
  const rainMm = weather?.current?.precipitationMm != null ? weather.current.precipitationMm : 0;
  const windKph = weather?.current?.windSpeedKmh != null ? Math.round(weather.current.windSpeedKmh) : 11;

  const rainLabel = rainMm === 0 
    ? t('home_no_rain') 
    : rainMm < 2.5 
    ? t('home_low_rain') 
    : rainMm < 10 
    ? t('home_med_rain') 
    : t('home_high_rain');

  let statusKey = 'home_status_healthy';
  let statusDetailKey = 'home_hero_healthy';
  let statusTone: 'healthy' | 'attention' | 'urgent' | 'review' = 'healthy';
  let StatusIcon = ShieldCheck;

  if (recentScan?.status === 'flagged' || recentScan?.priority === 'high' || risk?.riskLevel === 'high') {
    statusKey = 'home_status_attention';
    statusDetailKey = 'home_hero_action';
    statusTone = 'urgent';
    StatusIcon = ShieldAlert;
  } else if (risk?.riskLevel === 'moderate') {
    statusKey = 'home_status_attention';
    statusDetailKey = 'home_hero_attention';
    statusTone = 'attention';
    StatusIcon = AlertTriangle;
  }

  const handleCheckCrop = () => {
    const el = document.getElementById('scanner-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      onNavigate('report');
    }
  };

  const isSafeSpray = humidity < 85 && windKph < 15 && rainMm < 1.0;

  return (
    <section 
      aria-label="Farm Overview & Hero"
      className="relative bg-white/95 backdrop-blur-md rounded-3xl sm:rounded-[32px] border border-stone-200/90 shadow-sm overflow-hidden"
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
        {/* 2. MAIN HERO GRID: HEALTH STATE (LEFT) + REAL CROP CARD (RIGHT)*/}
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

              <div className="flex items-center gap-2 mt-2">
                <Sprout className="w-4 h-4 text-emerald-700" />
                <span className="text-sm sm:text-base font-bold text-stone-600">
                  {cropStage}
                </span>
              </div>
            </div>

            {/* Farm Condition Banner */}
            <div 
              role="status" 
              className={`p-4 rounded-2xl border transition-all ${
                statusTone === 'urgent' 
                  ? 'bg-rose-50/80 border-rose-200/90 text-rose-950' 
                  : statusTone === 'attention' 
                  ? 'bg-amber-50/80 border-amber-200/90 text-amber-950' 
                  : 'bg-emerald-50/80 border-emerald-200/90 text-emerald-950'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-xl flex-shrink-0 ${
                  statusTone === 'urgent' 
                    ? 'bg-rose-600 text-white' 
                    : statusTone === 'attention' 
                    ? 'bg-amber-500 text-white' 
                    : 'bg-emerald-700 text-white'
                }`}>
                  <StatusIcon className="w-4 h-4 stroke-[2.4]" />
                </div>
                <div>
                  <div className="font-extrabold text-sm flex items-center gap-2">
                    <span>
                      {recentScan?.diagnoses?.[0]?.disease_id 
                        ? `${recentDiseaseName}` 
                        : t(statusKey)}
                    </span>
                    <span className="inline-block w-2 h-2 rounded-full bg-current opacity-70" />
                  </div>
                  <p className="text-xs mt-0.5 opacity-90 font-medium leading-relaxed">
                    {recentScan?.diagnoses?.[0]?.disease_id
                      ? `${t('home_hero_action')}`
                      : t(statusDetailKey)}
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

          {/* ============================================================= */}
          {/* RIGHT: DYNAMIC RECENT CROP LEAF PHOTO & HEALTH CARD           */}
          {/* ============================================================= */}
          <div className="lg:col-span-5">
            <div className="rounded-[28px] sm:rounded-[32px] border border-stone-200/90 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[310px] group bg-stone-950">
              
              {/* Actual Background Photo of Recent Crop Leaf */}
              <img 
                src={cropImageUrl} 
                alt={cropName} 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90" 
              />

              {/* Seamless Natural Gradient Layer for Clean Contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/25 to-stone-950/50 pointer-events-none" />

              {/* Top Meta Badges (Smooth Floating Pills) */}
              <div className="flex items-center justify-between p-4 z-10">
                <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5 bg-emerald-900/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-emerald-400/30 shadow-md">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                  <span>{getCommonLabel('recentScan', lang)}</span>
                </span>
                <span className="text-[11px] font-black text-emerald-200 bg-stone-950/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 shadow-md">
                  ICAR Certified
                </span>
              </div>

              {/* Bottom Integrated Glassmorphism Capsule Card (Smooth Rounded Inset) */}
              <div className="p-3.5 z-10">
                <div className="p-3.5 rounded-2xl bg-stone-950/75 backdrop-blur-xl border border-white/15 shadow-xl space-y-2.5">
                  
                  {/* Crop Title & Disease Indicator */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-black text-white tracking-tight leading-snug">
                        {cropName} • {cropVariety}
                      </h3>
                      <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5 mt-0.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                        <span className="line-clamp-1">{recentDiseaseName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Spray Recommendation Micro-Bar */}
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-stone-300">
                    <span className="font-semibold text-[11px]">{t('home_spray_safe')}:</span>
                    <span className="font-black text-emerald-300 flex items-center gap-1 text-xs">
                      <Activity className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{isSafeSpray ? '✓ 4:00 PM+ (Safe)' : '⚠️ Postpone'}</span>
                    </span>
                  </div>

                </div>
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
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center flex-shrink-0">
                <Thermometer className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <div className="text-sm sm:text-base font-black text-stone-900 leading-none">
                  {temp}°C
                </div>
                <div className="text-[10px] text-stone-500 font-bold uppercase tracking-wide mt-1 truncate">
                  {t('home_weather_temp')}
                </div>
              </div>
            </div>

            {/* Humidity */}
            <div className="px-3.5 py-2.5 rounded-2xl bg-stone-50/70 hover:bg-stone-50 border border-stone-200/70 shadow-2xs flex items-center gap-2.5 transition-all">
              <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-700 flex items-center justify-center flex-shrink-0">
                <Droplets className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <div className="text-sm sm:text-base font-black text-stone-900 leading-none">
                  {humidity}%
                </div>
                <div className="text-[10px] text-stone-500 font-bold uppercase tracking-wide mt-1 truncate">
                  {t('home_weather_humidity')}
                </div>
              </div>
            </div>

            {/* Rain Status */}
            <div className="px-3.5 py-2.5 rounded-2xl bg-stone-50/70 hover:bg-stone-50 border border-stone-200/70 shadow-2xs flex items-center gap-2.5 transition-all">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-700 flex items-center justify-center flex-shrink-0">
                <CloudRain className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <div className="text-sm sm:text-base font-black text-stone-900 leading-none truncate">
                  {rainLabel}
                </div>
                <div className="text-[10px] text-stone-500 font-bold uppercase tracking-wide mt-1 truncate">
                  {t('home_weather_rain')}
                </div>
              </div>
            </div>

            {/* Wind */}
            <div className="px-3.5 py-2.5 rounded-2xl bg-stone-50/70 hover:bg-stone-50 border border-stone-200/70 shadow-2xs flex items-center gap-2.5 transition-all">
              <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-700 flex items-center justify-center flex-shrink-0">
                <Wind className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <div className="text-sm sm:text-base font-black text-stone-900 leading-none">
                  {windKph} {t('home_kph')}
                </div>
                <div className="text-[10px] text-stone-500 font-bold uppercase tracking-wide mt-1 truncate">
                  {t('home_weather_wind')}
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}