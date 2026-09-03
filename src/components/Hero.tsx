import { 
  Camera, MapPin, CloudRain, Droplets, 
  Sprout, ChevronRight, Sun, ShieldCheck,
  CheckCircle2, Sparkles, Tractor, Thermometer
} from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';
import { useFarmContext } from '@/contexts/FarmContext';

type HeroProps = {
  onNavigate: (section: string) => void;
  onOpenOnboarding?: () => void;
};

export default function Hero({ onNavigate, onOpenOnboarding }: HeroProps) {
  const { lang } = useLang();
  const { activeFarm, weather, risk, latestObservation, currentUser } = useFarmContext();

  // Natural localized greetings
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      if (lang === 'hi') return 'शुभ प्रभात';
      if (lang === 'mr') return 'शुभ सकाळ';
      if (lang === 'bn') return 'সুপ্রভাত';
      if (lang === 'ta') return 'காலை வணக்கம்';
      return 'Good Morning';
    }
    if (hour < 17) {
      if (lang === 'hi') return 'नमस्ते';
      if (lang === 'mr') return 'शुभ दुपार';
      if (lang === 'bn') return 'নমস্কার';
      if (lang === 'ta') return 'மதிய வணக்கம்';
      return 'Good Afternoon';
    }
    if (lang === 'hi') return 'शुभ संध्या';
    if (lang === 'mr') return 'शुभ संध्याकाळ';
    if (lang === 'bn') return 'शुभ সন্ধ্যা';
    if (lang === 'ta') return 'மாலை வணக்கம்';
    return 'Good Evening';
  };

  const getFarmerRoleTitle = () => {
    if (currentUser?.fullName) return currentUser.fullName;
    if (lang === 'hi') return 'किसान मित्र';
    if (lang === 'mr') return 'शेतकरी मित्र';
    if (lang === 'bn') return 'কৃষক বন্ধু';
    if (lang === 'ta') return 'விவசாய தோழர்';
    return 'Farmer Friend';
  };

  const cropName = activeFarm?.crop?.name || 'Cotton';
  const cropStage = activeFarm?.crop?.stage || 'Flowering Stage';
  const farmName = activeFarm?.farm_name || 'Main Field';
  const district = activeFarm?.district || 'Pune';
  const state = activeFarm?.state || 'Maharashtra';
  const areaAcres = activeFarm?.area_acres || 2.5;

  const getCtaText = () => {
    if (lang === 'hi') return 'फसल की जांच करें';
    if (lang === 'mr') return 'पीक तपासा';
    if (lang === 'bn') return 'ফসল পরীক্ষা করুন';
    if (lang === 'ta') return 'பயிர் பரிசோதனை';
    return 'Check My Crop';
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xl border border-emerald-800/40 mb-6">
      {/* Subtle organic ambient glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Column: Heading, Context, Weather & Dominant Primary CTA */}
        <div className="lg:col-span-7 space-y-4 text-center lg:text-left">
          
          {/* Top Greeting Badge & Location */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-900/80 border border-emerald-600/40 text-emerald-300 text-xs font-bold tracking-wide shadow-xs">
              <Sprout className="w-3.5 h-3.5 text-emerald-400" />
              <span>{getGreeting()}, {getFarmerRoleTitle()}</span>
            </span>

            <span className="inline-flex items-center gap-1 text-emerald-200/80 text-xs font-medium">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>{district}, {state}</span>
            </span>
          </div>

          {/* Display Headline */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-white tracking-tight leading-[1.2]">
            {lang === 'hi' ? (
              <>आपकी <span className="text-emerald-300 underline decoration-emerald-400/50 decoration-2 underline-offset-4">{cropName}</span> फसल की स्थिति</>
            ) : lang === 'mr' ? (
              <>आपल्या <span className="text-emerald-300 underline decoration-emerald-400/50 decoration-2 underline-offset-4">{cropName}</span> पिकाची सद्यस्थिती</>
            ) : (
              <>How is your <span className="text-emerald-300 underline decoration-emerald-400/50 decoration-2 underline-offset-4">{cropName}</span> crop today?</>
            )}
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-normal max-w-xl mx-auto lg:mx-0">
            {lang === 'hi'
              ? 'पत्ती की फोटो लेकर तुरंत AI द्वारा रोग एवं कीट की प्रारंभिक जांच करें और ICAR अनुमोदित समाधान पाएं।'
              : 'Upload a leaf photo for instant preliminary symptom screening and certified extension guidance.'}
          </p>

          {/* Live Microclimate Pill */}
          {weather && (
            <div className="inline-flex items-center justify-center lg:justify-start gap-3 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-xs text-white font-medium flex-wrap">
              <span className="font-bold text-emerald-200 text-sm">{weather.current.temperatureC}°C</span>
              <span className="text-white/40">•</span>
              <span className="flex items-center gap-1 text-emerald-100">
                <Droplets className="w-3.5 h-3.5 text-sky-300" />
                <span>{weather.current.relativeHumidityPct}% {lang === 'hi' ? 'आर्द्रता' : 'Humidity'}</span>
              </span>
              <span className="text-white/40">•</span>
              <span className="flex items-center gap-1 text-emerald-100">
                <CloudRain className="w-3.5 h-3.5 text-sky-300" />
                <span>{weather.current.precipitationMm} mm {lang === 'hi' ? 'वर्षा' : 'Rain'}</span>
              </span>
            </div>
          )}

          {/* Primary CTA Button */}
          <div className="pt-2 flex justify-center lg:justify-start">
            <button
              onClick={() => {
                const el = document.getElementById('scanner-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                else onNavigate('report');
              }}
              className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-white text-emerald-950 font-black text-sm sm:text-base hover:bg-emerald-50 active:scale-95 shadow-xl transition-all"
            >
              <Camera className="w-5 h-5 text-emerald-700 stroke-[2.4]" />
              <span>{getCtaText()}</span>
            </button>
          </div>

        </div>

        {/* Right Column (Desktop & Tablet): Crisp Field Overview Card */}
        <div className="hidden lg:block lg:col-span-5">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/15 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-300">
                  <Tractor className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-white">{farmName}</div>
                  <div className="text-[10px] text-emerald-200/80">{district}, {state}</div>
                </div>
              </div>

              <span className="text-[11px] font-bold text-emerald-300 bg-emerald-900/80 px-2.5 py-1 rounded-full border border-emerald-500/30">
                {areaAcres} {lang === 'hi' ? 'एकड़' : 'Acres'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <div className="text-[10px] uppercase font-bold text-emerald-200/70 tracking-wider">
                  {lang === 'hi' ? 'सक्रिय फसल' : 'Active Crop'}
                </div>
                <div className="font-extrabold text-white text-sm mt-0.5">{cropName}</div>
                <div className="text-[11px] text-emerald-300/90">{cropStage}</div>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <div className="text-[10px] uppercase font-bold text-emerald-200/70 tracking-wider">
                  {lang === 'hi' ? 'रोग जोखिम' : 'Disease Risk'}
                </div>
                <div className="font-extrabold text-emerald-300 text-sm mt-0.5 uppercase">
                  {risk?.riskLevel || 'Normal'}
                </div>
                <div className="text-[11px] text-emerald-200/80">Open-Meteo</div>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2 text-[11px] text-emerald-200/90">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{lang === 'hi' ? 'ICAR एवं कृषि विज्ञान केंद्र (KVK) मानक' : 'ICAR IPM Disease Protection Standards'}</span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
